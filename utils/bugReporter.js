// utils/bugReporter.js
const WEBHOOK_URL = 'https://demian405-n8n-free.hf.space/webhook/BUGS';

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
      environment: process.env.NODE_ENV || 'development',
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

  return payload;
}

module.exports = { reportBug };
