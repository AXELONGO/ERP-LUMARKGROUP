const jwt = require('jsonwebtoken');
const env = require('../config/env');

function authMiddleware(req, res, next) {
  // En desarrollo, podemos tener un bypass si lo necesitamos
  if (env.NODE_ENV === 'development' && req.headers['x-bypass-auth']) {
    req.user = { id: 'dev123', email: 'dev@test.com', role: 'Admin' };
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Falta el token de autorización' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = decoded; // ej: { id, email, role }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado, por favor inicia sesión nuevamente' });
    }
    return res.status(401).json({ error: 'Token inválido' });
  }
}

/**
 * Middleware opcional para verificar roles
 */
function requireRole(rolesArray) {
  return (req, res, next) => {
    if (!req.user || !rolesArray.includes(req.user.role)) {
      return res.status(403).json({ error: 'No tienes permisos suficientes para esta acción' });
    }
    next();
  };
}

module.exports = { authMiddleware, requireRole };
