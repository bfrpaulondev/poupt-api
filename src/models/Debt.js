const mongoose = require('mongoose');

const debtSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['formal', 'informal'],
    required: true
  },
  creditorName: {
    type: String,
    required: [true, 'Nome do credor e obrigatorio'],
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Montante e obrigatorio'],
    min: [0.01, 'Montante deve ser positivo']
  },
  amountPaid: {
    type: Number,
    default: 0,
    min: 0
  },
  interestRate: {
    type: Number,
    default: 0,
    min: 0
  },
  minimumPayment: {
    type: Number,
    default: 0,
    min: 0
  },
  dueDate: {
    type: Date
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pendente', 'parcial', 'pago', 'em_atraso'],
    default: 'pendente'
  },
  relationshipType: {
    type: String,
    enum: ['banco', 'cobranca', 'amigo', 'familia', 'senhorio', 'outro'],
    default: 'outro'
  },
  contactInfo: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  },
  payments: [{
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    notes: String
  }],
  snowballPriority: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

debtSchema.virtual('remainingAmount').get(function() {
  return Math.max(0, this.amount - this.amountPaid);
});

debtSchema.virtual('daysOverdue').get(function() {
  if (!this.dueDate || this.status === 'pago') return 0;
  const diff = Date.now() - this.dueDate.getTime();
  return diff > 0 ? Math.floor(diff / (1000 * 60 * 60 * 24)) : 0;
});

debtSchema.set('toJSON', { virtuals: true });
debtSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Debt', debtSchema);
