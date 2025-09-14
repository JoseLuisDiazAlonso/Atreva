 // middleware/auth.js
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    console.log('🔒 Token no proporcionado');
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    console.log('❌ Token inválido:', err.message);
    return res.status(403).json({ message: 'Token inválido' });
  }
};

module.exports = authMiddleware;
