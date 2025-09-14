 import React, { useState } from 'react';
import api from '../api'; // Ajusta la ruta según tu proyecto

const Formulario = ({ setDatos }) => {
  const [formData, setFormData] = useState({
    fecha: '',
    conductor: '',
    ruta: '',
    matricula: '',
    cliente: '',
    hora_llegada: '',
    hora_salida: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const soloTexto = (str) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(str);
  const validarMatricula = (str) => /^[A-Z0-9-]{4,10}$/i.test(str);
  const validarRuta = (str) => /^[\w\s-]{2,50}$/.test(str);

  const handleChange = (e) => {
    const { id, name, value } = e.target;
    const key = id || name;
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const { fecha, conductor, ruta, matricula, cliente, hora_llegada, hora_salida } = formData;

    const hoy = new Date();
    const fechaSeleccionada = new Date(fecha);

    // Validaciones
    if (!fecha || !conductor || !ruta || !matricula || !cliente || !hora_llegada || !hora_salida) {
      setError("Todos los campos son obligatorios");
      return;
    }

    if (isNaN(fechaSeleccionada.getTime()) || fechaSeleccionada > hoy) {
      setError("La fecha no puede ser inválida ni futura");
      return;
    }

    if (![conductor, cliente].every(soloTexto)) {
      setError("Conductor y Cliente solo pueden contener texto")
      return;
    }

    if (!validarMatricula(matricula) || !validarRuta(ruta)) {
      setError("La mátricula no es válida")
      return;
    }

    const [hLlegada, mLlegada] = hora_llegada.split(':').map(Number);
    const [hSalida, mSalida] = hora_salida.split(':').map(Number);
    const minutosLlegada = hLlegada * 60 + mLlegada;
    const minutosSalida = hSalida * 60 + mSalida;

    if (minutosSalida < minutosLlegada) {
      setError("La hora de salida no puede ser anterior a la hora de llegada");
      return;
    }

    setSuccess('');

    try {
      const response = await api.post('/rutas/guardar', [formData]);

      setSuccess('Datos enviados correctamente');

      if (response.data?.datos && typeof setDatos === 'function') {
        setDatos(prev => [...prev, ...response.data.datos]);
      }

      // Limpia el formulario
      setFormData({
        fecha: '',
        conductor: '',
        ruta: '',
        matricula: '',
        cliente: '',
        hora_llegada: '',
        hora_salida: '',
      });
    } catch (err) {
      console.error('Error al guardar (catch):', err); // Solo en consola
      setError('Error al enviar datos al servidor');
    }
  };

  return (
    <form className="formulario" onSubmit={handleSubmit}>
      <h1>DATOS RUTAS</h1>

      {/* No se muestra error visual */}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      {error && <p style={{color: 'red'}}>{error}</p>}

      <label htmlFor="fecha">Fecha</label>
      <input type="date" id="fecha" value={formData.fecha} onChange={handleChange} />

      <label htmlFor="conductor">Conductor</label>
      <input type="text" id="conductor" placeholder="Conductor" value={formData.conductor} onChange={handleChange} />

      <label htmlFor="ruta">Ruta</label>
      <input type="text" id="ruta" placeholder="Ruta" value={formData.ruta} onChange={handleChange} />

      <label htmlFor="matricula">Matrícula</label>
      <input type="text" id="matricula" placeholder="Matrícula" value={formData.matricula} onChange={handleChange} />

      <label htmlFor="cliente">Cliente</label>
      <input type="text" id="cliente" placeholder="Cliente" value={formData.cliente} onChange={handleChange} />

      <label htmlFor="hora_llegada">Hora de Llegada</label>
      <input type="time" id="hora_llegada" value={formData.hora_llegada} onChange={handleChange} step="60" />

      <label htmlFor="hora_salida">Hora de Salida</label>
      <input type="time" id="hora_salida" value={formData.hora_salida} onChange={handleChange} step="60" />

      <button type="submit">Enviar</button>
    </form>
  );
};

export default Formulario;
