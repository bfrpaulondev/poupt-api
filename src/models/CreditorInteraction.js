const mongoose = require('mongoose');

const CreditorInteractionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  creditorName: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['formal', 'informal'],
    required: true,
  },
  contactInfo: {
    type: String,
  },
  negotiationStatus: {
    type: String,
    enum: ['pendente', 'em_negociacao', 'acordado', 'recusado'],
    default: 'pendente',
  },
  interactionHistory: [
    {
      date: { type: Date },
      type: {
        type: String,
        enum: ['telefone', 'email', 'carta', 'presencial'],
      },
      notes: { type: String },
      outcome: { type: String },
    },
  ],
  amountOwed: {
    type: Number,
    default: 0,
  },
  amountPaid: {
    type: Number,
    default: 0,
  },
  dueDate: {
    type: Date,
  },
  relationshipType: {
    type: String,
    enum: ['bank', 'collection', 'friend', 'family', 'landlord'],
    default: 'bank',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('CreditorInteraction', CreditorInteractionSchema);
