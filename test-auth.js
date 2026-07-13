const authService = require('./src/services/authService');
console.log(authService.generateToken({ id: 'asesor0@empresa.com', rol: 'admin', asesor: 'Admin' }));
