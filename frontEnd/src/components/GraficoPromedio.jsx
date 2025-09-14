import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Label, Legend } from 'recharts';

// Función para convertir hh:mm a minutos
const tiempoEnMinutos = (horaInicio, horaFin) => {
  if (!horaInicio || !horaFin) return 0;

  const [h1, m1] = horaInicio.split(':').map(Number);
  const [h2, m2] = horaFin.split(':').map(Number);
  return (h2 * 60 + m2) - (h1 * 60 + m1);
};

// Colores para cada mes (0-11)
const coloresPorMes = [
  "#FF0000", // Enero
  "#FF7F00", // Febrero
  "#FFFF00", // Marzo
  "#00FF00", // Abril
  "#0000FF", // Mayo
  "#4B0082", // Junio
  "#8A2BE2", // Julio
  "#A52A2A", // Agosto
  "#5F9EA0", // Septiembre
  "#D2691E", // Octubre
  "#FF4500", // Noviembre
  "#2E8B57", // Diciembre
];

const GraficoPromedio = ({ datos }) => {
  // Agrupar los datos por cliente y mes
  const agrupados = datos.reduce((acc, curr) => {
    const cliente = curr.cliente || 'Sin cliente';
    const mes = new Date(curr.fecha).getMonth(); // Obtener el mes de la fecha
    const minutos = tiempoEnMinutos(curr.hora_llegada, curr.hora_salida);

    // Si ya existe un registro para ese cliente en ese mes, actualizamos el promedio
    if (!acc[cliente]) {
      acc[cliente] = {};
    }

    if (acc[cliente][mes]) {
      acc[cliente][mes].total += minutos;
      acc[cliente][mes].count += 1;
    } else {
      acc[cliente][mes] = { total: minutos, count: 1 };
    }

    return acc;
  }, {});

  // Crear los datos para el gráfico con los promedios
  const datosGrafico = Object.entries(agrupados).map(([cliente, meses]) => {
    return Object.entries(meses).map(([mes, { total, count }]) => ({
      cliente,
      mes: parseInt(mes),  // Guardamos el mes (0-11)
      promedioMin: (total / count).toFixed(1),
    }));
  }).flat();

  // Ordenar los datos por cliente y luego por mes
  const datosOrdenados = datosGrafico.sort((a, b) => {
    if (a.cliente === b.cliente) return a.mes - b.mes; // Ordenar por mes dentro de un cliente
    return a.cliente.localeCompare(b.cliente);  // Ordenar alfabéticamente por cliente
  });

  // Crear la leyenda
  const leyendaMeses = coloresPorMes.map((color, index) => (
    <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
      <div style={{ width: '20px', height: '20px', backgroundColor: color, marginRight: '5px' }} />
      <span>{new Date(2021, index).toLocaleString('default', { month: 'long' })}</span>
    </div>
  ));

  return (
    <div style={{ width: '100%', height: 450 }} id="grafico">
      <h3 style={{ textAlign: 'center' }}>Promedio de tiempo por cliente (minutos)</h3>
      <ResponsiveContainer>
        <BarChart
          data={datosOrdenados}
          layout="vertical"
          margin={{ top: 20, right: 40, left: 80, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number">
            <Label value="Minutos" offset={-5} position="insideBottom" />
          </XAxis>
          <YAxis dataKey="cliente" type="category" />
          <Tooltip formatter={(value) => `${value} min`} />
          <Legend />
          {datosOrdenados.map((data, index) => (
            <Bar
              key={index}
              dataKey="promedioMin"
              fill={coloresPorMes[data.mes]}  // Color según el mes
              isAnimationActive={false}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
      <div style={{ marginTop: '20px' }}>
        <h4>Leyenda:</h4>
        {leyendaMeses}
      </div>
    </div>
  );
};

export default GraficoPromedio;
