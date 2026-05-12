const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');
const debtRoutes = require('./routes/debts');
const goalRoutes = require('./routes/goals');
const coachRoutes = require('./routes/coach');
const investmentRoutes = require('./routes/investments');
const moedaRoutes = require('./routes/moedas');
const notificationRoutes = require('./routes/notifications');
const reportRoutes = require('./routes/reports');
const { protect } = require('./middleware/auth');

const app = express();

connectDB();

app.use(helmet());

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: {
    success: false,
    error: 'Muitos pedidos. Tenta novamente mais tarde.'
  }
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'PoupPT API operacional',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/transactions', protect, transactionRoutes);
app.use('/api/debts', protect, debtRoutes);
app.use('/api/goals', protect, goalRoutes);
app.use('/api/coach', protect, coachRoutes);
app.use('/api/investments', protect, investmentRoutes);
app.use('/api/moedas', protect, moedaRoutes);
app.use('/api/notifications', protect, notificationRoutes);
app.use('/api/reports', protect, reportRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production'
      ? 'Erro interno do servidor'
      : err.message
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`PoupPT API a correr na porta ${PORT} [${process.env.NODE_ENV}]`);
});

module.exports = app;
