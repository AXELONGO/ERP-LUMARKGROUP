const nodemailer = require('nodemailer');

const env = require('../config/env');

const SLACK_TOKEN = env.SLACK_TOKEN;
const DESTINATION_EMAIL = env.NOTIFICATION_EMAIL;

// Configurar Nodemailer para Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: env.NOTIFICATION_EMAIL, // El mismo correo se usará de remitente
    pass: env.SMTP_PASS || '' // Necesitarán configurar esto
  }
});

// Función interna para enviar mensaje a Slack
async function postToSlack(text, channel) {
  try {
    const res = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SLACK_TOKEN}`
      },
      body: JSON.stringify({
        channel: channel,
        text: text
      })
    });
    const data = await res.json();
    if (!data.ok) {
      console.error('Slack API Error:', data.error);
    }
  } catch (error) {
    console.error('Error enviando a Slack:', error);
  }
}

// Función interna para enviar correo electrónico
async function sendEmail(subject, htmlBody) {
  if (!process.env.SMTP_PASS) {
    console.warn('Omitiendo correo: SMTP_PASS no está configurado.');
    return;
  }
  try {
    await transporter.sendMail({
      from: `"ERP LUMARK Notificaciones" <${process.env.NOTIFICATION_EMAIL}>`,
      to: DESTINATION_EMAIL,
      subject: subject,
      html: htmlBody
    });
  } catch (error) {
    console.error('Error enviando correo:', error);
  }
}

/**
 * Notifica sobre un evento CRUD del ERP.
 * @param {string} action 'CREATE', 'UPDATE', 'DELETE'
 * @param {string} moduleName ej. 'Clientes', 'Proyectos', 'Citas'
 * @param {string} recordId El ID del registro (ej. CLI-001)
 * @param {object|string} extraData Datos adicionales para contexto
 */
async function notifyEvent(action, moduleName, recordId, extraData = '') {
  const emojis = {
    'CREATE': '✨',
    'UPDATE': '✏️',
    'DELETE': '🗑️'
  };
  const verbs = {
    'CREATE': 'Nuevo registro creado',
    'UPDATE': 'Registro actualizado',
    'DELETE': 'Registro eliminado'
  };

  const actionText = verbs[action] || action;
  const emoji = emojis[action] || '🔔';

  // Formatear datos extra para Slack y Correo
  let extraTextSlack = '';
  let extraHtmlEmail = '';
  
  if (typeof extraData === 'object') {
    // Es un objeto (ej. body de un request)
    const cleanData = { ...extraData };
    delete cleanData.token; // No enviar tokens sensibles
    
    extraTextSlack = '\n```\n' + JSON.stringify(cleanData, null, 2) + '\n```';
    
    extraHtmlEmail = '<ul>';
    for (const [k, v] of Object.entries(cleanData)) {
      extraHtmlEmail += `<li><strong>${k}:</strong> ${v}</li>`;
    }
    extraHtmlEmail += '</ul>';
  } else if (extraData) {
    extraTextSlack = `\n_${extraData}_`;
    extraHtmlEmail = `<p><em>${extraData}</em></p>`;
  }

  // 1. Mensaje para Slack
  const slackMessage = `${emoji} *${actionText} en ${moduleName}*\n*ID:* ${recordId}${extraTextSlack}`;
  
  // 2. Cuerpo del correo
  const emailSubject = `${emoji} [ERP] ${actionText} - ${moduleName} (${recordId})`;
  const emailHtml = `
    <h2>${actionText} en el módulo <b>${moduleName}</b></h2>
    <p><strong>ID del Registro:</strong> ${recordId}</p>
    <hr />
    <h3>Detalles:</h3>
    ${extraHtmlEmail}
    <br/>
    <p><small>Enviado automáticamente por ERP LUMARK.</small></p>
  `;

  // Enviar de forma asíncrona sin bloquear el hilo
  Promise.all([
    postToSlack(slackMessage, 'todo-lumark'),
    sendEmail(emailSubject, emailHtml)
  ]).catch(err => console.error('Error en notificaciones globales:', err));
}

/**
 * Notifica sobre un error o bug del sistema.
 */
async function notifyBug(errorMessage, contextData) {
  const slackMessage = `🚨 *ERROR EN EL SISTEMA* 🚨\n*Mensaje:* ${errorMessage}\n*Contexto:* \`\`\`${JSON.stringify(contextData, null, 2)}\`\`\``;
  const emailSubject = `🚨 [ERP] Error del Sistema`;
  const emailHtml = `
    <h2>Se ha detectado un Error en el ERP</h2>
    <p><strong>Mensaje:</strong> ${errorMessage}</p>
    <hr/>
    <pre>${JSON.stringify(contextData, null, 2)}</pre>
  `;

  Promise.all([
    postToSlack(slackMessage, 'todo-lumark'),
    sendEmail(emailSubject, emailHtml)
  ]).catch(err => console.error('Error enviando notificación de bug:', err));
}

async function reportBug(errorMsg, context = {}) {
  const url = process.env.N8N_BUGS_WEBHOOK_URL;
  if (!url) {
    console.warn('[Bugs] Webhook URL no configurado, omitiendo reporte');
    return;
  }
  
  try {
    const payload = {
      timestamp: new Date().toISOString(),
      error: errorMsg,
      context: context
    };
    
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    console.log(`[Bugs] Bug reportado exitosamente a ${url}`);
  } catch (err) {
    console.error('[Bugs] Error reportando el bug al webhook:', err);
  }
}

module.exports = {
  notifyEvent,
  notifyBug,
  sendEmail,
  reportBug
};
