const mongoose = require('mongoose');

const DebtSchema = new mongoose.Schema({
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
  interestRate: {
    type: Number,
    default: 0,
  },
  minimumPayment: {
    type: Number,
    default: 0,
  },
  dueDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['ativo', 'em_atraso', 'pago', 'negociado'],
    default: 'ativo',
  },
  type: {
    type: String,
    enum: ['cartao_credito', 'emprestimo_pessoal', 'emprestimo_habitacao', 'automovel', 'outro'],
    default: 'outro',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Debt', DebtSchema);
