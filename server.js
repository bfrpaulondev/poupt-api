require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const connectDB = require('./src/config/db');
const corsConfig = require('./src/config/cors');
const rateLimiter = require('./src/middleware/rateLimiter');
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

const app = express();

connectDB();

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

app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor PoupPT a correr na porta ${PORT}`);
});

module.exports = app;
