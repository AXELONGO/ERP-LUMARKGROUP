const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const sheetsService = require('./sheetsService');

const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);

const EMAIL_KEYS = ['Correo', 'Email', 'Correo Electrónico', 'E-mail', 'MAIL', 'email', 'correo electronico'];
const PASSWORD_KEYS = ['Contraseña', 'Password', 'Clave', 'pass', 'password', 'contraseña'];
const NAME_KEYS = ['Nombre del Asesor', 'Nombre', 'name', 'Name', 'Asesor'];
const ROLE_KEYS = ['Rol', 'Role', 'rol', 'Puesto', 'Cargo'];
const STATUS_KEYS = ['Estado', 'Status', 'status', 'estado', 'Activo'];
const ID_KEYS = ['ID Asesores', 'id', 'ID', 'Id'];

function getValue(obj, keys) {
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== '') return obj[k];
  }
  return '';
}

async function loginWithGoogle(token) {
  if (!env.GOOGLE_CLIENT_ID) {
    if (env.NODE_ENV !== 'production' && token === 'dev_bypass_token') {
      return { 
        token: jwt.sign({ id: 'dev123', email: 'dev@test.com', name: 'Dev User', role: 'Admin' }, env.JWT_SECRET, { expiresIn: '7d' }),
        user: { email: 'dev@test.com', name: 'Dev User', role: 'Admin' }
      };
    }
    throw new Error('Servidor mal configurado: Falta GOOGLE_CLIENT_ID');
  }

  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: env.GOOGLE_CLIENT_ID,
  });
  
  const payload = ticket.getPayload();
  const { email, name, picture } = payload;

  const asesores = await sheetsService.getPublicData('Asesores');
  const user = asesores.find(u => getValue(u, EMAIL_KEYS).trim().toLowerCase() === email.trim().toLowerCase());
  
  if (!user) {
    throw new Error('No tienes acceso al sistema. Pide a un administrador que registre tu correo.');
  }

  const status = getValue(user, STATUS_KEYS).toLowerCase();
  if (status && status !== 'activo') {
    throw new Error('Tu cuenta está inactiva.');
  }

  const jwtPayload = {
    id: getValue(user, ID_KEYS) || email,
    email: email,
    name: name || getValue(user, NAME_KEYS),
    role: getValue(user, ROLE_KEYS) || 'Asesor',
    picture: picture
  };

  const authToken = jwt.sign(jwtPayload, env.JWT_SECRET, { expiresIn: '7d' });

  return { token: authToken, user: jwtPayload };
}

async function loginWithCredentials(email, password) {
  const asesores = await sheetsService.getPublicData('Asesores');
  const sampleHeaders = Object.keys(asesores[0] || {});
  console.log("Asesores headers detectados:", sampleHeaders);

  const user = asesores.find(u => getValue(u, EMAIL_KEYS).trim().toLowerCase() === email.trim().toLowerCase());
  
  if (!user) {
    console.log("Usuario no encontrado. Headers disponibles:", sampleHeaders);
    console.log("Primer registro:", JSON.stringify(asesores[0] || {}));
    throw new Error('Credenciales inválidas o usuario no existe.');
  }

  // Acceso sin contraseña — solo requiere email válido

  const status = getValue(user, STATUS_KEYS).toLowerCase();
  if (status && status !== 'activo') {
    throw new Error('Tu cuenta está inactiva.');
  }

  const jwtPayload = {
    id: getValue(user, ID_KEYS) || email,
    email: email,
    name: getValue(user, NAME_KEYS),
    role: getValue(user, ROLE_KEYS) || 'Asesor'
  };

  const authToken = jwt.sign(jwtPayload, env.JWT_SECRET, { expiresIn: '7d' });

  return { token: authToken, user: jwtPayload };
}

module.exports = {
  loginWithGoogle,
  loginWithCredentials
};
