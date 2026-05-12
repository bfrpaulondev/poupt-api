const mongoose = require('mongoose');

const InvestmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['stock', 'etf', 'fund', 'crypto', 'real_estate', 'ppr', 'other'],
    required: true,
  },
  quantity: {
    type: Number,
    default: 0,
  },
  avgPrice: {
    type: Number,
    default: 0,
  },
  currentPrice: {
    type: Number,
    default: 0,
  },
  dividends: {
    type: Number,
    default: 0,
  },
  platform: {
    type: String,
  },
  buyDate: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Investment', InvestmentSchema);
