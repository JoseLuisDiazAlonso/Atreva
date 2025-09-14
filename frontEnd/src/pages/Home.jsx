import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Formulario from '../components/formulario';
import Tabla from '../components/tabla';
import GraficoMeses from '../components/GraficaMes';
import '../css/home.css';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const Home = () => {
  const navigate = useNavigate();
  const [datos, setDatos] = useState([]);
  const [, setDatosFiltrados] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    //Usa la instancia 'api', que ya agrega el token automáticamente
    api.get('/rutas/obtener')
      .then(res => {
        setDatos(res.data);
      })
      .catch(err => {
        console.error("Error al cargar datos:", err);
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          localStorage.removeItem('token'); //Borra el token inválido
          navigate('/'); //Redirige al login
        }
      });
  }, [navigate]);

  const agregarDato = (nuevoDato) => {
    setDatos((prev) => [...prev, nuevoDato]);
  };

  return (
    <div className="contenedor">
      <h1>ATHENEA</h1>
      <div className="contenido">
        <Formulario onSubmit={agregarDato} />
        <div className="datos">
          <Tabla datos={datos} setDatosFiltrados={setDatosFiltrados} />
        </div>
      </div>
    </div>
  );
};

export default Home; 