const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Nome do ativo e obrigatorio'],
    trim: true
  },
  type: {
    type: String,
    enum: ['stock', 'etf', 'fund', 'crypto', 'real_estate', 'ppr', 'other'],
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  avgPrice: {
    type: Number,
    required: true,
    min: 0
  },
  currentPrice: {
    type: Number,
    default: 0,
    min: 0
  },
  dividends: {
    type: Number,
    default: 0,
    min: 0
  },
  platform: {
    type: String,
    default: ''
  },
  currency: {
    type: String,
    default: 'EUR',
    enum: ['EUR', 'USD', 'GBP']
  },
  buyDate: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

investmentSchema.virtual('totalInvested').get(function() {
  return this.quantity * this.avgPrice;
});

investmentSchema.virtual('currentValue').get(function() {
  return this.quantity * (this.currentPrice || this.avgPrice);
});

investmentSchema.virtual('profitLoss').get(function() {
  return this.currentValue - this.totalInvested;
});

investmentSchema.virtual('profitLossPercent').get(function() {
  if (this.totalInvested === 0) return 0;
  return ((this.currentValue - this.totalInvested) / this.totalInvested * 100).toFixed(2);
});

investmentSchema.set('toJSON', { virtuals: true });
investmentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Investment', investmentSchema);
