const mongoose = require('mongoose');

const PoupMoedaSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  balance: {
    type: Number,
    default: 50,
  },
  transactions: [
    {
      type: {
        type: String,
        enum: ['ganho', 'gasto'],
        required: true,
      },
      amount: {
        type: Number,
        required: true,
      },
      reason: {
        type: String,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

PoupMoedaSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('PoupMoeda', PoupMoedaSchema);
