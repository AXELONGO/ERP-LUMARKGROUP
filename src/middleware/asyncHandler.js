// utils/asyncHandler.js
const { reportBug } = require('../services/bugReporter');

// Wrapper para capturar errores async automáticamente
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(async (error) => {
    await reportBug({
      level: 'critical',
      message: `Error en controlador async: ${error.message}`,
      error,
      context: { route: req.path, method: req.method, userId: req.user?.id }
    });
    next(error);
  });
};

module.exports = asyncHandler;
