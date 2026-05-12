const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Nome da meta e obrigatorio'],
    trim: true,
    maxlength: 100
  },
  type: {
    type: String,
    enum: ['fundo_emergencia', 'poupanca', 'investimento', 'divida', 'compra', 'outro'],
    default: 'outro'
  },
  targetAmount: {
    type: Number,
    required: [true, 'Montante alvo e obrigatorio'],
    min: [1, 'Montante alvo deve ser positivo']
  },
  currentAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  deadline: {
    type: Date
  },
  monthlyContribution: {
    type: Number,
    default: 0,
    min: 0
  },
  icon: {
    type: String,
    default: 'target'
  },
  color: {
    type: String,
    default: '#10B981'
  },
  isCompleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

goalSchema.virtual('progressPercent').get(function() {
  if (this.targetAmount === 0) return 0;
  return Math.min(100, Math.round((this.currentAmount / this.targetAmount) * 100));
});

goalSchema.set('toJSON', { virtuals: true });
goalSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Goal', goalSchema);
