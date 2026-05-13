const mongoose = require('mongoose');

const InformalDebtSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  creditorName: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  amountPaid: {
    type: Number,
    default: 0,
  },
  loanDate: {
    type: Date,
    required: true,
  },
  returnDate: {
    type: Date,
  },
  interestRate: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['pendente', 'parcial', 'pago'],
    default: 'pendente',
  },
  notes: {
    type: String,
  },
  payments: [
    {
      amount: { type: Number },
      date: { type: Date },
      note: { type: String },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('InformalDebt', InformalDebtSchema);
