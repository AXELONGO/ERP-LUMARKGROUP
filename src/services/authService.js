const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const sheetsService = require('./sheetsService');

const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);

/**
 * Verifica el token de Google y busca al usuario en la base de datos (Google Sheets)
 * @param {string} token - Google ID Token
 */
async function loginWithGoogle(token) {
  if (!env.GOOGLE_CLIENT_ID) {
    // Si no hay client ID (ej. dev local), podemos hacer un bypass solo en desarrollo
    if (env.NODE_ENV !== 'production' && token === 'dev_bypass_token') {
      return { 
        token: jwt.sign({ id: 'dev123', email: 'dev@test.com', name: 'Dev User', role: 'Admin' }, env.JWT_SECRET, { expiresIn: '7d' }),
        user: { email: 'dev@test.com', name: 'Dev User', role: 'Admin' }
      };
    }
    throw new Error('Servidor mal configurado: Falta GOOGLE_CLIENT_ID');
  }

  // 1. Verificar firma del token con Google
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: env.GOOGLE_CLIENT_ID,
  });
  
  const payload = ticket.getPayload();
  const { email, name, picture } = payload;

  // 2. Buscar si el usuario existe en Google Sheets
  // Utilizaremos la pestaña "Asesores" como base de datos de usuarios
  const asesores = await sheetsService.getPublicData('Asesores');
  
  const user = asesores.find(u => (u['Correo'] || '').toLowerCase() === email.toLowerCase());
  
  if (!user) {
    throw new Error('No tienes acceso al sistema. Pide a un administrador que registre tu correo.');
  }

  // Si hubiera columna Estado, lo validaríamos aquí. Por ahora asumimos activo.
  if (user['Estado'] && user['Estado'].toLowerCase() !== 'activo') {
    throw new Error('Tu cuenta está inactiva.');
  }

  // 3. Generar JWT propio
  const jwtPayload = {
    id: user['ID Asesores'] || email,
    email: email,
    name: name || user['Nombre del Asesor'],
    role: user['Rol'] || 'Asesor',
    picture: picture
  };

  const authToken = jwt.sign(jwtPayload, env.JWT_SECRET, { expiresIn: '7d' });

  return { token: authToken, user: jwtPayload };
}

/**
 * Verifica usuario y contraseña (útil como fallback o alternativa a Google)
 * @param {string} email - Correo del usuario
 * @param {string} password - Contraseña plana
 */
async function loginWithCredentials(email, password) {
  // Buscar en la hoja "Asesores"
  const asesores = await sheetsService.getPublicData('Asesores');
  console.log("Asesores headers sample:", Object.keys(asesores[0] || {}));
  console.log(`Intentando login para: ${email}`);

  const user = asesores.find(u => (u['Correo'] || '').trim().toLowerCase() === email.toLowerCase());
  
  if (!user) {
    console.log("Usuario no encontrado. Correos disponibles:", asesores.map(a => a['Correo']));
    throw new Error('Credenciales inválidas o usuario no existe.');
  }

  // Verifica la contraseña en la columna "Contraseña" de la hoja
  if (user['Contraseña'] !== password) {
    // Si eres tú (admin/dev) y la columna contraseña no existe, damos acceso de emergencia
    if (!user['Contraseña'] && env.NODE_ENV === 'development') {
        console.warn('Login sin contraseña aceptado por entorno de desarrollo');
    } else {
        throw new Error('Contraseña incorrecta.');
    }
  }

  if (user['Estado'] && user['Estado'].toLowerCase() !== 'activo') {
    throw new Error('Tu cuenta está inactiva.');
  }

  const jwtPayload = {
    id: user['ID Asesores'] || email,
    email: email,
    name: user['Nombre del Asesor'],
    role: user['Rol'] || 'Asesor'
  };

  const authToken = jwt.sign(jwtPayload, env.JWT_SECRET, { expiresIn: '7d' });

  return { token: authToken, user: jwtPayload };
}

module.exports = {
  loginWithGoogle,
  loginWithCredentials
};
