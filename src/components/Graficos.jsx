import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { jsPDF } from "jspdf";
import PropTypes from "prop-types";

// Registrar los componentes de Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Graficos = () => {
    const [data, setData] = useState([]);
    // Estado para el filtro de mes
    const [filtroMes, setFiltroMes] = useState("");

    //Obtenemos los datos desde la base de datos al cargar el componente
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/dadtos");
            const result = await response.json();
            setData(result);
            console.log("Datos cargados desde la base de datos: ", result);
        } catch (error) {
            console.error("Error al obtener los datos:", error);
        }
    };

    // Función para calcular el tiempo promedio por cliente
    const calcularTiempoPromedioPorCliente = () => {
        const clientes = data.reduce((acc, item) => {
            if (filtroMes && !item.fecha.startsWith(filtroMes)) return acc; // Filtrar por mes

            const tiempo = calcularDiferenciaTiempo(item.horaEntrada, item.horaSalida);
            if (!acc[item.clientes]) acc[item.clientes] = { totalTiempo: 0, count: 0 };
            acc[item.clientes].totalTiempo += tiempo;
            acc[item.clientes].count++;
            return acc;
        }, {});

        return Object.keys(clientes).map(cliente => ({
            cliente,
            tiempoPromedio: clientes[cliente].totalTiempo / clientes[cliente].count,
        }));
    };

    // Función para calcular el tiempo promedio por conductor
    const calcularTiempoPromedioPorConductor = () => {
        const conductores = data.reduce((acc, item) => {
            if (filtroMes && !item.fecha.startsWith(filtroMes)) return acc; // Filtrar por mes

            const tiempo = calcularDiferenciaTiempo(item.horaEntrada, item.horaSalida);
            if (!acc[item.conductor]) acc[item.conductor] = { totalTiempo: 0, count: 0 };
            acc[item.conductor].totalTiempo += tiempo;
            acc[item.conductor].count++;
            return acc;
        }, {});

        return Object.keys(conductores).map(conductor => ({
            conductor,
            tiempoPromedio: conductores[conductor].totalTiempo / conductores[conductor].count,
        }));
    };

    // Función para calcular la diferencia de tiempo en minutos (mismo cálculo que en Tabla)
    const calcularDiferenciaTiempo = (horaEntrada, horaSalida) => {
        if (!horaEntrada || !horaSalida) return 0; // Evitar errores si los valores son null

        const [hEntrada, mEntrada] = horaEntrada.split(":").map(Number);
        const [hSalida, mSalida] = horaSalida.split(":").map(Number);

        // Convertir las horas a minutos
        const minutosEntrada = hEntrada * 60 + mEntrada;
        const minutosSalida = hSalida * 60 + mSalida;

        // Calcular la diferencia en minutos
        const diferencia = minutosSalida - minutosEntrada;

        return diferencia > 0 ? diferencia : 0; // Asegurar que no sea negativo
    };

    // Crear el gráfico de barras para el cliente más rentable (con el tiempo promedio más bajo)
    const clienteData = calcularTiempoPromedioPorCliente().sort((a, b) => a.tiempoPromedio - b.tiempoPromedio);
    const clienteLabels = clienteData.map(item => item.cliente);
    const clienteTimes = clienteData.map(item => item.tiempoPromedio);

    // Crear el gráfico de barras para el conductor más rentable (con el tiempo promedio más bajo)
    const conductorData = calcularTiempoPromedioPorConductor().sort((a, b) => a.tiempoPromedio - b.tiempoPromedio);
    const conductorLabels = conductorData.map(item => item.conductor);
    const conductorTimes = conductorData.map(item => item.tiempoPromedio);

    // Crear el gráfico de evolución de los clientes por mes
    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const clientesPorMes = meses.map((mes, index) => {
        const clientesMes = data.filter(item => item.fecha.startsWith(`2025-${(index + 1).toString().padStart(2, '0')}`));
        return clientesMes.length;
    });

    // Función para exportar los gráficos a PDF
    const exportarAPdf = (graphId) => {
        const doc = new jsPDF();
        doc.text("Gráfico de Conductores más Rentables", 10, 10);
        doc.addImage(document.getElementById(graphId), "JPEG", 10, 20, 180, 90);
        doc.save("grafico.pdf");
    };

    return (
        <div className="graficos-container">
            {/* Filtro por mes */}
            <div className="filtro-mes">
                <label>Selecciona un mes: </label>
                <select onChange={(e) => setFiltroMes(e.target.value)} value={filtroMes}>
                    <option value="">Todos los meses</option>
                    {meses.map((mes, i) => {
                        const mesFormateado = (i + 1).toString().padStart(2, '0');
                        const mesAnio = `2025-${mesFormateado}`;
                        return (
                            <option key={i} value={mesAnio}>
                                {mes}
                            </option>
                        );
                    })}
                </select>
            </div>

            {/* Gráfico de Clientes más Rentables */}
            <div className="grafico">
                <h3>Clientes</h3>
                <Bar
                    id="cliente-graph"
                    data={{
                        labels: clienteLabels, // Un label por cada cliente
                        datasets: [
                            {
                                label: "Tiempo Promedio (min)",
                                data: clienteTimes, // Los tiempos promedio de cada cliente
                                backgroundColor: "rgba(75, 192, 192, 0.5)",
                                borderColor: "rgba(75, 192, 192, 1)",
                                borderWidth: 1,
                            },
                        ],
                    }}
                    options={{
                        responsive: true,
                        plugins: {
                            tooltip: {
                                callbacks: {
                                    label: (tooltipItem) => {
                                        return `${tooltipItem.raw} min`;
                                    },
                                },
                            },
                        },
                    }}
                />
                <button onClick={() => exportarAPdf("cliente-graph")} className="btn-exportar-pdf">
                    Exportar a PDF
                </button>
            </div>

            {/* Gráfico de Conductores más Rentables */}
            <div className="grafico">
                <h3>Conductores</h3>
                <Bar
                    id="conductor-graph"
                    data={{
                        labels: conductorLabels, // Un label por cada conductor
                        datasets: [
                            {
                                label: "Tiempo Promedio (min)",
                                data: conductorTimes, // Los tiempos promedio de cada conductor
                                backgroundColor: "rgba(255, 99, 132, 0.5)",
                                borderColor: "rgba(255, 99, 132, 1)",
                                borderWidth: 1,
                            },
                        ],
                    }}
                    options={{
                        responsive: true,
                        plugins: {
                            tooltip: {
                                callbacks: {
                                    label: (tooltipItem) => {
                                        return `${tooltipItem.raw} min`;
                                    },
                                },
                            },
                        },
                    }}
                />
                <button onClick={() => exportarAPdf("conductor-graph")} className="btn-exportar-pdf">
                    Exportar a PDF
                </button>
            </div>

            {/* Gráfico de Evolución de Clientes */}
            <div className="grafico">
                <h3>Evolución de los Clientes a lo largo del Año</h3>
                <Bar
                    id="clientes-evolucion"
                    data={{
                        labels: meses,
                        datasets: [
                            {
                                label: "Número de Clientes",
                                data: clientesPorMes,
                                backgroundColor: "rgba(153, 102, 255, 0.5)",
                                borderColor: "rgba(153, 102, 255, 1)",
                                borderWidth: 1,
                            },
                        ],
                    }}
                    options={{
                        responsive: true,
                        plugins: {
                            tooltip: {
                                callbacks: {
                                    label: (tooltipItem) => {
                                        return `${tooltipItem.raw} clientes`;
                                    },
                                },
                            },
                        },
                    }}
                />
                <button onClick={() => exportarAPdf("clientes-evolucion")} className="btn-exportar-pdf">
                    Exportar a PDF
                </button>
            </div>
        </div>
    );
};

// PropTypes
Graficos.propTypes = {
    data: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            fecha: PropTypes.string.isRequired,
            ruta: PropTypes.string.isRequired,
            conductor: PropTypes.string.isRequired,
            matricula: PropTypes.string.isRequired,
            clientes: PropTypes.string.isRequired,
            horaEntrada: PropTypes.string.isRequired,
            horaSalida: PropTypes.string.isRequired
        })
    ).isRequired
};

export default Graficos;
