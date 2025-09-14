import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { Modal, Box, Button, TextField } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Configuración Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const styleModal = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'white',
  border: '2px solid #1976d2',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

const Tabla = ({ datos }) => {
  const [filtros, setFiltros] = useState({
    cliente: 'Todos',
    conductor: 'Todos',
    ruta: 'Todos',
    fechaInicio: '',
    fechaFin: '',
  });
  const [datosTabla, setDatosTabla] = useState([]);
  const [datosFiltrados, setDatosFiltrados] = useState([]);
  const [promedioTiempo, setPromedioTiempo] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [, setEditIndex] = useState(null);
  const [filaEditada, setFilaEditada] = useState({
    id: '',
    fecha: '',
    cliente: '',
    conductor: '',
    ruta: '',
    matricula: '',
    hora_llegada: '',
    hora_salida: '',
  });
  const [mostrarGrafica, setMostrarGrafica] = useState(false);

  useEffect(() => {
    setDatosTabla(ordenarPorFecha(datos));
  }, [datos]);

  const ordenarPorFecha = (datos) => [...datos].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

  const calcularTiempo = (llegada, salida) => {
    if (!llegada || !salida) return 0;
    const [h1, m1] = llegada.split(':').map(Number);
    const [h2, m2] = salida.split(':').map(Number);
    const totalMin = h2 * 60 + m2 - (h1 * 60 + m1);
    return totalMin < 0 ? 0 : totalMin;
  };

  const calcularPromedioTiempo = (datos) => {
    let totalMinutos = 0;
    let count = 0;
    datos.forEach(({ hora_llegada, hora_salida }) => {
      if (hora_llegada && hora_salida) {
        const tiempo = calcularTiempo(hora_llegada, hora_salida);
        if (tiempo > 0) {
          totalMinutos += tiempo;
          count++;
        }
      }
    });
    if (count === 0) return '';
    const promedioMinutos = Math.floor(totalMinutos / count);
    const horas = String(Math.floor(promedioMinutos / 60)).padStart(2, '0');
    const minutos = String(promedioMinutos % 60).padStart(2, '0');
    return `${horas}:${minutos}:00`;
  };

  const obtenerValoresUnicos = (campo) => [...new Set(datos.map((d) => d[campo]))];

  const filtrarDatos = useCallback(() => {
    let filtrado = [...datosTabla];
    if (filtros.cliente !== 'Todos') filtrado = filtrado.filter((d) => d.cliente === filtros.cliente);
    if (filtros.conductor !== 'Todos') filtrado = filtrado.filter((d) => d.conductor === filtros.conductor);
    if (filtros.ruta !== 'Todos') filtrado = filtrado.filter((d) => d.ruta === filtros.ruta);
    if (filtros.fechaInicio) filtrado = filtrado.filter((d) => new Date(d.fecha) >= new Date(filtros.fechaInicio));
    if (filtros.fechaFin) filtrado = filtrado.filter((d) => new Date(d.fecha) <= new Date(filtros.fechaFin));
    setDatosFiltrados(ordenarPorFecha(filtrado));
  }, [datosTabla, filtros]);

  useEffect(() => filtrarDatos(), [filtrarDatos]);
  useEffect(() => setPromedioTiempo(calcularPromedioTiempo(datosFiltrados)), [datosFiltrados]);

  const handleChange = (e) => setFiltros({ ...filtros, [e.target.name]: e.target.value });

  const openEditarModal = (index) => {
    setEditIndex(index);
    setFilaEditada(datosFiltrados[index]);
    setOpenModal(true);
  };

  const handleGuardarEdicion = async () => {
    try {
      const token = localStorage.getItem('token');
      const tiempo_en_clientes = calcularTiempo(filaEditada.hora_llegada, filaEditada.hora_salida);
      const payload = { ...filaEditada, tiempo_en_clientes };

      await axios.put(
        `https://api.controldatarutas.com/api/rutas/${filaEditada.id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );

      const nuevosDatos = [...datosTabla];
      const indexGlobal = nuevosDatos.findIndex((d) => d.id === filaEditada.id);
      if (indexGlobal !== -1) nuevosDatos[indexGlobal] = filaEditada;
      setDatosTabla(ordenarPorFecha(nuevosDatos));
      setOpenModal(false);
    } catch (error) {
      console.error('Error al actualizar:', error.response?.data || error.message);
      alert('Error al actualizar los datos');
    }
  };

  const eliminarFila = async (index) => {
    try {
      const token = localStorage.getItem('token');
      const idEliminar = datosFiltrados[index].id;
      await axios.delete(`https://api.controldatarutas.com/api/rutas/${idEliminar}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDatosTabla(datosTabla.filter((item) => item.id !== idEliminar));
    } catch (error) {
      console.error('Error al eliminar:', error.response?.data || error.message);
      alert('Error al eliminar el registro');
    }
  };

  const exportarExcel = () => {
    const ws = XLSX.utils.json_to_sheet(datosFiltrados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Datos');
    XLSX.writeFile(wb, 'datos.xlsx');
  };

  const importarExcel = (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const wb = XLSX.read(event.target.result, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const datosLeidos = XLSX.utils.sheet_to_json(ws);
      const camposRequeridos = ['id','fecha','cliente','conductor','ruta','matricula','hora_llegada','hora_salida'];
      setDatosTabla(ordenarPorFecha(datosLeidos.filter(d => camposRequeridos.every(c => d[c]))));
    };
    reader.readAsArrayBuffer(archivo);
    e.target.value = null;
  };

  const generarColorAleatorio = () => {
    const getColor = () => Math.floor(Math.random() * 256);
    return `rgb(${getColor()}, ${getColor()}, ${getColor()})`;
  };

  const datosGrafica = {
    labels: datosFiltrados.map((item) => item.cliente),
    datasets: [{
      label: 'Tiempo en minutos',
      data: datosFiltrados.map((item) => calcularTiempo(item.hora_llegada, item.hora_salida)),
      backgroundColor: datosFiltrados.map(() => generarColorAleatorio()),
    }],
  };

  return (
    <div>
      {/* Filtros y botones */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
        {['cliente', 'conductor', 'ruta'].map((campo) => (
          <label key={campo}>
            {campo.charAt(0).toUpperCase() + campo.slice(1)}:
            <select name={campo} value={filtros[campo]} onChange={handleChange}>
              <option value="Todos">Todos</option>
              {obtenerValoresUnicos(campo).map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </label>
        ))}
        <label>Fecha Inicio:<input type="date" name="fechaInicio" value={filtros.fechaInicio} onChange={handleChange} /></label>
        <label>Fecha Fin:<input type="date" name="fechaFin" value={filtros.fechaFin} onChange={handleChange} /></label>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <Button variant="outlined" onClick={exportarExcel}>Exportar Excel</Button>
        <input type="file" accept=".xlsx" onChange={importarExcel} style={{ marginLeft: '10px' }} />
        <Button variant="outlined" onClick={() => setMostrarGrafica(!mostrarGrafica)} style={{ marginLeft: '10px' }}>
          {mostrarGrafica ? 'Ocultar Gráfica' : 'Mostrar Gráfica'}
        </Button>
      </div>

      {mostrarGrafica && <div style={{ marginBottom: '1rem' }}><Bar data={datosGrafica} /></div>}

      <div style={{ marginBottom: '1rem' }}>
        <label>Tiempo promedio:<input type="text" value={promedioTiempo} readOnly style={{ marginLeft: '10px' }} /></label>
      </div>

      <table border="1" width="100%">
        <thead>
          <tr style={{ backgroundColor: '#007BFF', color: 'white' }}>
            <th>Fecha</th><th>Cliente</th><th>Conductor</th><th>Ruta</th>
            <th>Matrícula</th><th>Hora Llegada</th><th>Hora Salida</th>
            <th>Tiempo</th><th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {datosFiltrados.map((item,i) => (
            <tr key={item.id || i} style={{ backgroundColor: i%2===0 ? '#f0f8ff':'#e6f2ff' }}>
                            <td>{item.fecha?.substring(0, 10)}</td>
              <td>{item.cliente}</td>
              <td>{item.conductor}</td>
              <td>{item.ruta}</td>
              <td>{item.matricula}</td>
              <td>{item.hora_llegada}</td>
              <td>{item.hora_salida}</td>
              <td>{calcularTiempo(item.hora_llegada, item.hora_salida)}</td>
              <td>
                <Button size="small" onClick={() => openEditarModal(i)}>Editar</Button>
                <Button size="small" color="error" onClick={() => eliminarFila(i)}>Eliminar</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal de edición */}
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box sx={styleModal}>
          <h3>Editar fila</h3>
          {Object.entries(filaEditada).map(([key, val]) =>
            key !== 'id' && (
              <TextField
                key={key}
                fullWidth
                margin="dense"
                label={key}
                value={val}
                onChange={(e) => setFilaEditada({ ...filaEditada, [key]: e.target.value })}
              />
            )
          )}
          <Button variant="contained" onClick={handleGuardarEdicion} sx={{ mt: 2 }}>Guardar</Button>
        </Box>
      </Modal>
    </div>
  );
};

export default Tabla;

