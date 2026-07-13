require('dotenv').config();

const env = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  SPREADSHEET_ID: process.env.SPREADSHEET_ID,
  CALENDLY_TOKEN: process.env.CALENDLY_TOKEN,
  GOOGLE_CREDENTIALS: process.env.GOOGLE_CREDENTIALS,
  SLACK_TOKEN: process.env.SLACK_TOKEN,
  NOTIFICATION_EMAIL: process.env.NOTIFICATION_EMAIL,
  SMTP_PASS: process.env.SMTP_PASS,
  N8N_BUGS_WEBHOOK_URL: process.env.N8N_BUGS_WEBHOOK_URL,
  N8N_CITAS_WEBHOOK_URL: process.env.N8N_CITAS_WEBHOOK_URL,
  N8N_TAREAS_WEBHOOK_URL: process.env.N8N_TAREAS_WEBHOOK_URL,
  N8N_PROYECTOS_WEBHOOK_URL: process.env.N8N_PROYECTOS_WEBHOOK_URL,
  N8N_PROSPECTOS_WEBHOOK_URL: process.env.N8N_PROSPECTOS_WEBHOOK_URL,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  JWT_SECRET: process.env.JWT_SECRET || 'fallback_secret_for_dev_only',
  APP_NAME: process.env.APP_NAME || 'LUMARK',
  APP_LOGO: process.env.APP_LOGO || 'https://www.tulink.com/wp-content/uploads/2024/09/Logo-Lumark.png'
};

// Validaciones críticas
if (!env.SPREADSHEET_ID) {
  console.error('FATAL: Falta SPREADSHEET_ID en las variables de entorno (.env)');
  process.exit(1);
}
if (!env.GOOGLE_CLIENT_ID && env.NODE_ENV === 'production') {
  console.warn('WARNING: Falta GOOGLE_CLIENT_ID en .env. El login fallará en producción.');
}

module.exports = env;
