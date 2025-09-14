const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db'); // tu conexión a MySQL/Postgres

const router = express.Router();

router.post('/login', async (req, res) => {
  const { usuario, password } = req.body;

  if (!usuario || !password) {
    return res.status(400).json({ message: 'Por favor ingresa usuario y contraseña' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE usuario = ?', [usuario]);

    if (rows.length === 0) return res.status(401).json({ message: 'Usuario no encontrado' });

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) return res.status(401).json({ message: 'Contraseña incorrecta' });

    const token = jwt.sign({ id: user.id, usuario: user.usuario }, process.env.SECRET_KEY || 'clave_secreta', { expiresIn: '1h' });

    res.json({ message: 'Login exitoso', token });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

module.exports = router;
