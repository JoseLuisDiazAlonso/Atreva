import { useNavigate } from "react-router-dom";
import Formulario from "../components/Formulario";
import Tabla from "../components/Tabla";
import Graficos from "../components/Graficos";
import ExportarImportar from "../components/ExportarImportar";
import { useEffect, useState, useCallback } from "react";


const Home = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [error, setError] = useState("");

  //Función para obtener los datos de la API protegida
  const fetchData = useCallback( async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("No estás autenticado. Inicia Sesión");
      navigate("/Login");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/datos", {
        method:"GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type":"application/json",
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Error al obtener los datos");
      }
      setData(data);
    }catch (error) {
      setError(error.message);
    }
  }, [navigate]);

  useEffect(() => {
    fetchData();
  },[fetchData]);

  //Función para agregar datos a la base de datos

  const addData = async (entry) => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("No estás autenticado.Inicia sesión.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/datos", {
        method: "POST",
        headers: {
          "Authorization": `Bearer${token}`,
          "Content-Type": "application/json",
        },
        body:JSON.stringify(entry),
      });
      const newData = await response.json();

      if (!response.ok) {
        throw new Error(newData.error || "Error al guardar datos");
      }
      setData([...data, {id: newData.id, ...entry}]); //Agregar un nuevo dato al estado
    } catch (error) {
      setError(error.message);
    }
  };

  //useEffect para cargar los datos al iniciar
  useEffect(() => {
    fetchData();
  }, []);

  //Función para cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem("token"); //Eliminamos el token
    navigate("/Login")
  };

  return (
    <div className="container">
      <aside className="sidebar">
        <Formulario onSubmit={addData} />
      </aside>
      <main className="content">
        {error && <p style ={{color:"red"}}>error</p>}
        {/* Solo el componente ExportarImportar debajo de la tabla */}
        <div className="tabla-container">
          <Tabla data={data} eliminarFila={(id) => setData(data.filter((item) => item.id !== id))} />
          <ExportarImportar data={data} setData={setData} />
        </div>

        {/* Componente de gráficos */}
        <Graficos data={data} />

        {/* Botón para cerrar sesión */}
        <button className="logout-button" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </main>
    </div>
  );
};

export default Home;