import express from 'express';
import mysql from 'mysql2';
import dotenv from 'dotenv';
import process from 'process';

dotenv.config();

const app = express();
app.use(express.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Ruta para insertar datos en la base de datos
app.post('/api/datos', (req, res) => {
  const { fecha, ruta, conductor, matricula, clientes, horaEntrada, horaSalida } = req.body;

  // Consulta SQL para insertar los datos en la tabla 'registros'
  const query = `
    INSERT INTO registros (fecha, ruta, conductor, matricula, clientes, horaEntrada, horaSalida)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  db.query(query, [fecha, ruta, conductor, matricula, clientes, horaEntrada, horaSalida], (err, results) => {
    if (err) {
      console.error('Error al insertar los datos:', err);
      return res.status(500).json({ message: 'Error al guardar los datos' });
    }

    // Enviar la respuesta con el ID del registro insertado
    return res.status(201).json({ id: results.insertId });
  });
});

app.listen(5000, () => {
  console.log('Servidor corriendo en http://localhost:5000');
});
