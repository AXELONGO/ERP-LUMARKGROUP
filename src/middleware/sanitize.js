/**
 * Middleware para prevenir Inyección de Fórmulas en Google Sheets
 * Elimina cualquier carácter inicial que pueda interpretar la celda como fórmula (=, +, -, @)
 */
function sanitizeInput(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        let val = req.body[key].trim();
        // Prevenir CSV Injection / Formula Injection
        if (/^[=+\-@]/.test(val)) {
          val = "'" + val; // Escapar con comilla simple para forzar texto plano en sheets
        }
        req.body[key] = val;
      }
    }
  }
  next();
}

module.exports = { sanitizeInput };
