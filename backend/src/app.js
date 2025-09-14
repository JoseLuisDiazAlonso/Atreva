const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const authRoutes = require("./routes/authRoutes");
const rutasRoutes = require("./routes/rutasRoutes");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

app.use('/auth', authRoutes);
app.use('/rutas', rutasRoutes);  

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

module.exports = app;
