const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nome e obrigatorio'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email e obrigatorio'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Palavra-passe e obrigatoria'],
    minlength: 6,
    select: false,
  },
  avatar: {
    type: String,
    default: '',
  },
  income: {
    type: Number,
    default: 0,
  },
  poupMoedas: {
    type: Number,
    default: 50,
  },
  streak: {
    type: Number,
    default: 0,
  },
  level: {
    type: Number,
    default: 1,
  },
  xp: {
    type: Number,
    default: 0,
  },
  trophies: {
    type: [String],
    default: [],
  },
  plan: {
    type: String,
    enum: ['free', 'premium'],
    default: 'free',
  },
  coachName: {
    type: String,
    default: 'Ricardo',
  },
  coachGender: {
    type: String,
    enum: ['m', 'f', 'n'],
    default: 'n',
  },
  coachPersonality: {
    type: String,
    enum: ['disciplinado', 'amigavel', 'estrategico', 'espiritual'],
    default: 'amigavel',
  },
  financialMode: {
    type: String,
    enum: ['sobrevivencia', 'recuperacao', 'estabilidade', 'crescimento', 'prosperidade'],
    default: 'sobrevivencia',
  },
  jarPercentages: {
    necessidades: { type: Number, default: 50 },
    liberdade: { type: Number, default: 10 },
    poupanca: { type: Number, default: 10 },
    educacao: { type: Number, default: 10 },
    lazer: { type: Number, default: 10 },
    doar: { type: Number, default: 10 },
  },
  googleId: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastLogin: {
    type: Date,
  },
});

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.matchPassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
