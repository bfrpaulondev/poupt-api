const mongoose = require('mongoose');

const chatLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  messages: [{
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  mode: {
    type: String,
    enum: ['sobrevivencia', 'recuperacao', 'estabilidade', 'crescimento', 'prosperidade']
  }
}, {
  timestamps: true
});

chatLogSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('ChatLog', chatLogSchema);
