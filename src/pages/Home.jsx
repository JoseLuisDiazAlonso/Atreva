import { useNavigate } from "react-router-dom";
import Formulario from "../components/Formulario";
import Tabla from "../components/Tabla";
import Graficos from "../components/Graficos";
import ExportarImportar from "../components/ExportarImportar";
import { useEffect, useState } from "react";
import axios from "axios"; // Importamos axios

// eslint-disable-next-line no-unused-vars
const Home = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]); // Inicializamos el estado vacío

  // Función para obtener los datos desde la base de datos
  const obtenerDatos = async () => {
    try {
      const response = await axios.get("https://controldatarutas.com"); // Reemplaza con la URL de tu API
      setData(response.data); // Guardamos los datos recibidos en el estado
    } catch (error) {
      console.error("Error al obtener los datos:", error);
    }
  };

  // Función para guardar los datos modificados en la base de datos
  const guardarDatos = async (nuevoDato) => {
    try {
      await axios.post("https://controldatarutas.com", nuevoDato); // Reemplaza con la URL de tu API
      setData((prevData) => [...prevData, nuevoDato]); // Agregamos el nuevo dato al estado
    } catch (error) {
      console.error("Error al guardar los datos:", error);
    }
  };

  // Función para eliminar una fila
  const eliminarFila = async (id) => {
    try {
      await axios.delete(`https://controldatarutas.com/${id}`); // Reemplaza con la URL de tu API
      setData(data.filter((item) => item.id !== id)); // Eliminamos el dato del estado
    } catch (error) {
      console.error("Error al eliminar los datos:", error);
    }
  };

  // Llamamos a obtenerDatos al montar el componente
  useEffect(() => {
    obtenerDatos();
  }, []);

  // Función para cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("password");
    navigate("/");
  };

  return (
    <div className="container">
      <aside className="sidebar">
        <Formulario
          onSubmit={(entry) => {
            const nuevoDato = { id: Date.now(), ...entry }; // Creamos un nuevo dato
            guardarDatos(nuevoDato); // Guardamos el dato en la base de datos
          }}
        />
      </aside>
      <main className="content">
        {/* Tabla con los datos */}
        <div className="tabla-container">
          <Tabla data={data} eliminarFila={eliminarFila} />
          <ExportarImportar data={data} setData={setData} />
        </div>

        {/* Gráficos */}
        <Graficos data={data} />

        {/* Botón de cierre de sesión */}
        <button className="logout-button" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </main>
    </div>
  );
};

export default Home;
