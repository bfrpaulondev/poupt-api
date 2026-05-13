const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: [
      'divida_vencida', 'pagamento_proximo', 'meta_atingida', 'transicao_modo',
      'streak_quebrado', 'conquista', 'lembrete_poupanca', 'divida_informal',
      'relatorio_semanal', 'dica_coach', 'sistema'
    ],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  actionUrl: {
    type: String,
    default: ''
  },
  priority: {
    type: String,
    enum: ['baixa', 'media', 'alta', 'critica'],
    default: 'media'
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  }
}, {
  timestamps: true
});

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
