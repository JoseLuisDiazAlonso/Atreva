// server.js
const express = require('express');
require('dotenv').config();
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./src/routes/authRoutes');
const rutasRoutes = require('./src/routes/rutasRoutes');

const app = express();

// Necesario para rate-limit detrás de Nginx
app.set('trust proxy', 1);

// Configuración CORS
const whitelist = [
  'https://controldatarutas.com',
  'https://www.controldatarutas.com',
];
const corsOptions = {
  origin: (origin, callback) => {
    // Permite requests sin origin (Postman, servidor interno)
    if (!origin || whitelist.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS blocked:', origin);
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Responder correctamente a preflight requests
app.options('*', cors(corsOptions));

// Seguridad HTTP headers
app.use(helmet());

// Parse JSON
app.use(express.json());

// Rate-limit básico
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: 'Demasiadas solicitudes desde esta IP, intenta más tarde',
}));

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/rutas', rutasRoutes);

// Puerto
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend corriendo en puerto ${PORT}`));
