import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList
} from 'recharts';

const colores = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7f50', '#a0522d', '#6a5acd',
  '#20b2aa', '#ff69b4', '#8a2be2', '#00ced1', '#ff6347', '#3cb371'
];

const obtenerMes = (fecha) => {
  const d = new Date(fecha);
  if (isNaN(d.getTime())) return 'Fecha inválida';
  return `${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;
};

const GraficoMeses = ({ datos = [] }) => {
  const agrupados = {};
  const totalPorCliente = {};

  datos.forEach(d => {
    if (!d.fecha || !d.hora_llegada || !d.hora_salida || !d.cliente) return;

    const mes = obtenerMes(d.fecha);
    const inicio = new Date(`1970-01-01T${d.hora_llegada}`);
    const fin = new Date(`1970-01-01T${d.hora_salida}`);

    if (isNaN(inicio) || isNaN(fin) || fin <= inicio) return;

    const duracion = (fin - inicio) / 60000; // minutos

    if (!agrupados[mes]) agrupados[mes] = {};
    agrupados[mes][d.cliente] = (agrupados[mes][d.cliente] || 0) + duracion;

    totalPorCliente[d.cliente] = (totalPorCliente[d.cliente] || 0) + duracion;
  });

  const clientesOrdenados = Object.entries(totalPorCliente)
    .sort(([, durA], [, durB]) => durB - durA)
    .map(([cliente]) => cliente);

  const dataFinal = Object.entries(agrupados).map(([mes, clientes]) => {
    const entry = { mes };
    clientesOrdenados.forEach(cliente => {
      if (clientes[cliente]) {
        entry[`cliente_${cliente}`] = clientes[cliente];
      }
    });
    return entry;
  });

  // Calcular un tamaño de barra dinámico dependiendo de la cantidad de meses
  const getBarSize = () => {
    const totalMeses = dataFinal.length;
    // Tamaño mínimo de barra y máximo dependiendo del número de meses
    return Math.max(30, Math.min(100, 500 / totalMeses));
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: 'white', padding: 10, border: '1px solid #ccc' }}>
          <strong>{label}</strong>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {payload
              .filter(p => p.value != null)
              .map((p, i) => (
                <li key={i} style={{ color: p.color }}>
                  {p.name}: {Math.round(p.value)} min
                </li>
              ))}
          </ul>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ height: 400 }}>
      <h3>Tiempo en Clientes por Mes</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={dataFinal}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="mes" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {clientesOrdenados.map((cliente, i) => (
            <Bar
              key={cliente}
              dataKey={`cliente_${cliente}`}
              fill={colores[i % colores.length]}
              name={cliente}
              isAnimationActive={false}
              barSize={getBarSize()} // Ajuste dinámico del tamaño de la barra
            >
              <LabelList
                dataKey={`cliente_${cliente}`}
                position="insideTop"
                fill="#fff"
                formatter={(value) => `${Math.round(value)} min`}
                style={{ fontSize: 12 }}
              />
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GraficoMeses;
