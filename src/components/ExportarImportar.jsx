import PropTypes from 'prop-types';
import * as XLSX from 'xlsx';

const ExportarImportar = ({ data, setData }) => {
    const exportarExcell = () => {
        if (!data || data.length === 0) {
            alert("No hay datos para exportar.");
            return;
        }
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Rutas");
        XLSX.writeFile(wb, "control_rutas.xlsx");
    };

    const importarExcell = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const workbook = XLSX.read(e.target.result, { type: "binary" });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const importedData = XLSX.utils.sheet_to_json(sheet);
            setData(importedData);
            localStorage.setItem("rutas", JSON.stringify(importedData));
        };
        reader.readAsBinaryString(file);
    };

    return (
        <div>
            <button className='export-button' onClick={exportarExcell}>Exportar a Excel</button>
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
