import express from 'express';
import cors from 'cors';
import db from './db';
import process from 'process';
import jwt from 'jsonwebtoken';

const app = express();
app.use(cors());
app.use(express.json());  // Para que Express pueda leer datos en formato JSON

//Creamos las Tablas si no existen
const createTables = () => {
    const query = `CREATE TABLE IF NOT EXISTS usuarios(
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL);
    
    CREATE TABLE IF NOT EXISTS registros(
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha DATE NOT NULL,
    ruta VARCHAR(255) NOT NULL,
    conductor VARCHAR(100) NOT NULL,
    matricula VARCHAR(20) NOT NULL,
    clientes VARCHAR(20) NOT NULL,
    horaEntrada TIME NOT NULL,
    horaSalida TIME NOT NULL);
    `;
    db.query(query, (err) =>{
        if(err) {
            console.error("Error al crear las tablas", err);
            return;
        }
        console.log("Tablas verificadas correctamente");
    });
};

//Llamamos a la función para asegurarnos que las Tablas existen
createTables();


// Conexión con la base de datos MySQL
db.connect(err => {
    if (err) {
        console.error('❌ Error conectando a la base de datos:', err);
        return;
    }
    console.log('✅ Conectado a MySQL');
});

//Función para generar un token JWT
const generateToken = (user) => {
    return jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

//Endpoint de Login (validando las credenciales fijas.)
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    if (username === process.env.ADMIN_USER && password === process.env.ADMIN_PASSWORD) {
        const token = generateToken(username);
        res.json({ message: "Login exitoso", token });
    } else {
        res.status(401).json({ error: "Usuario o contraseña incorrectos" });
    }
});

//Midleware para verificar el token
const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization?.split("")[1];
    if (!token) return res.status(403).json({ error: "Acceso denegado, token requerido" });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: "Token inválido" });

        req.user = user;
        next();
    });
};



//ruta para obtener datos
app.get('/api/datos', authenticateToken, (req, res) => {
    db.query('SELECT * from registros', (err, rows) => {
        if (err) throw err

        res.send(rows)
    })
});

// Endpoint para guardar los datos
app.post('/api/datos', authenticateToken, (req, res) => {
    const { fecha, ruta, conductor, matricula, clientes, horaEntrada, horaSalida } = req.body;
    const sql = `INSERT INTO registros (fecha, ruta, conductor, matricula, clientes, horaEntrada, horaSalida) VALUES ("${req.body.fecha}", "${req.body.ruta}", "${req.body.conductor}", "${req.body.matricula}", "${req.body.clientes}", "${req.body.horaEntrada}", "${req.body.horaSalida}")`;

    db.query(sql, [fecha, ruta, conductor, matricula, clientes, horaEntrada, horaSalida], (err, result) => {
        if (err) {
            console.error('❌ Error al guardar datos:', err);
            res.status(500).json({ error: "Error al guardar datos en la base de datos" });
        } else {
            res.status(201).json({ message: "✅ Datos guardados correctamente", id: result.insertId });
        }
    });
});

// Configuración del puerto
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
