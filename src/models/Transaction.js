const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['receita', 'despesa'],
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Montante e obrigatorio'],
    min: [0.01, 'Montante deve ser positivo']
  },
  category: {
    type: String,
    required: [true, 'Categoria e obrigatoria'],
    enum: [
      'alimentacao', 'habitacao', 'transportes', 'saude', 'educacao',
      'lazer', 'roupa', 'divida', 'investimento', 'poupanca',
      'salario', 'freelance', 'outro_rendimento', 'outro_gasto',
      'emprestimo_dado', 'emprestimo_recebido', 'pagamento_divida'
    ]
  },
  description: {
    type: String,
    required: [true, 'Descricao e obrigatoria'],
    trim: true,
    maxlength: 200
  },
  jar: {
    type: String,
    enum: ['necessities', 'freedom', 'savings', 'education', 'play', 'give', null],
    default: null
  },
  date: {
    type: Date,
    default: Date.now
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringFrequency: {
    type: String,
    enum: ['weekly', 'biweekly', 'monthly', 'yearly', null],
    default: null
  },
  nextOccurrence: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'completed'],
    default: 'active'
  },
  tags: [{
    type: String,
    trim: true
  }],
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, category: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
