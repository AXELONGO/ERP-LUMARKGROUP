const env = require('./src/config/env');
const { reportBug } = require('./src/services/bugReporter');

// Uncaught Exception / Unhandled Rejection Handlers
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  reportBug({ level: 'critical', message: 'Uncaught Exception: ' + err.message, error: err })
    .finally(() => process.exit(1));
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  reportBug({ level: 'critical', message: 'Unhandled Rejection: ' + (reason?.message || reason), error: reason });
});



const app = require('./src/app');
const PORT = env.PORT;

app.listen(PORT, () => console.log(`\n🚀 ERP LUMARK → http://localhost:${PORT}\n`));
