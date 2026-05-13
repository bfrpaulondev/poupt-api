require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { connectDB, reconnectDB, isDBConnected } = require('./src/config/db');
const corsConfig = require('./src/config/cors');
const { rateLimiter } = require('./src/middleware/rateLimiter');
const errorHandler = require('./src/middleware/errorHandler');

const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
const transactionRoutes = require('./src/routes/transactions');
const jarRoutes = require('./src/routes/jars');
const debtRoutes = require('./src/routes/debts');
const informalDebtRoutes = require('./src/routes/informalDebts');
const goalRoutes = require('./src/routes/goals');
const coachRoutes = require('./src/routes/coach');
const investmentRoutes = require('./src/routes/investments');
const reportRoutes = require('./src/routes/reports');
const moedaRoutes = require('./src/routes/moedas');
const notificationRoutes = require('./src/routes/notifications');
const creditorRoutes = require('./src/routes/creditors');

const { processRecurringTransactions } = require('./src/services/recurringProcessor');

const app = express();

app.use(helmet());
app.use(corsConfig);
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(rateLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/jars', jarRoutes);
app.use('/api/debts', debtRoutes);
app.use('/api/informal-debts', informalDebtRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/coach', coachRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/moedas', moedaRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/creditors', creditorRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    db: isDBConnected() ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const iniciarServidor = async () => {
  const connected = await connectDB();

  if (!connected) {
    console.warn('MongoDB nao disponivel. Servidor a iniciar sem DB. A tentar reconectar...');
    reconnectDB();
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor PoupPT a correr na porta ${PORT}`);
  });

  // Process recurring transactions every hour
  setInterval(async () => {
    try {
      const count = await processRecurringTransactions();
      if (count > 0) console.log(`[Cron] Processed ${count} recurring transactions`);
    } catch (err) {
      console.error('[Cron] Error processing recurring transactions:', err.message);
    }
  }, 60 * 60 * 1000);
};

iniciarServidor();

module.exports = app;
