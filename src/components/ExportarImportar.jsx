import PropTypes from 'prop-types';
import * as XLSX from 'xlsx';
import {useState} from "react";

const ExportarImportar = ({setData }) => {
    const [isLoading, setIsLoading] = useState(false);

    //Función para exportar datos a excell desde la base de datos.
    const exportarExcell = async () => {
        setIsLoading(true);
        try {
            //Obtenemos datos desde el backend
            const response = await fetch("http://localhost:5000/api/datos");
            if (!response.ok) throw new Error("Error al obtener datos");
            const result = await response.json();

            //Convertimos los datos a una hoja de Excell
            const ws = XLSX.utils.json_to_sheet(result);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Rutas");

            //Descargamos el archivo excell
            XLSX.writeFile(wb, "control_rutas.xlsx");
        } catch (error) {
            console.error("Error al exportar datos:", error);
            alert("Hubo un problema al exportar los datos");
        }finally {
            setIsLoading(false);
        }
        
    };

    //Función para importar datos desde Excell y guardar en la base de datos.

    const importarExcell = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            const workbook = XLSX.read(e.target.result, { type: "binary" });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const importedData = XLSX.utils.sheet_to_json(sheet);
            setData(importedData);

            try {
                //Enviar datos al backend para guardarlos en la base de datos
                const response = await fetch("http://localhost:5000/api/datos/importar", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body:JSON.stringify(importedData),
                });
                if (response.ok) {
                    alert("Datos imoprtados correctamente a la base de datos");
                } else {
                    throw new Error ("Error al importar Datos");
                }
            } catch (error) {
                console.error("Error al importar datos:", error);
                alert("No se pudieron guardar los datos en la base de datos.");
            }
        };
        reader.readAsBinaryString(file);
    };

    return (
        <div>
            <button className='export-button' onClick={exportarExcell} disabled={isLoading}>{isLoading? "Exportando...": "Exportar a Excell" }</button>
            <input type="file" accept=".xlsx, .xls" onChange={importarExcell} />
        </div>
    );
};

// Agregar validaciones con PropTypes
ExportarImportar.propTypes = {
    data: PropTypes.array.isRequired,
    setData: PropTypes.func.isRequired
};

export default ExportarImportar;
