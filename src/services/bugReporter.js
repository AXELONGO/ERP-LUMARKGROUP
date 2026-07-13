const env = require('../config/env');
const WEBHOOK_URL = env.N8N_BUGS_WEBHOOK_URL;
const { notifyBug } = require('./notificationService');

async function reportBug({ 
  level = 'error',      // 'error' | 'warning' | 'critical' | 'info'
  message,              // Mensaje del error
  error = null,         // Objeto Error original
  context = {},         // Contexto adicional: { userId, route, method, body }
  stack = null          // Stack trace
}) {
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    message,
    stack: stack || (error?.stack) || null,
    context: {
      environment: env.NODE_ENV || 'development',
      nodeVersion: process.version,
      ...context
    },
    errorName: error?.name || null,
    errorCode: error?.code || null
  };

  try {
    // Native fetch (Node 18+) instead of axios
    await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000) // timeout: 5000
    });
  } catch (webhookError) {
    // Fail silently para no romper el flujo principal
    console.error('[BugReporter] No se pudo enviar al webhook:', webhookError.message);
  }

  // Enviar a Slack y Correo si es error o critical
  if (level === 'error' || level === 'critical') {
    notifyBug(message, payload.context).catch(e => console.error('Error enviando notifyBug:', e));
  }

  return payload;
}

module.exports = { reportBug };
