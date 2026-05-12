const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nome e obrigatorio'],
    trim: true,
    maxlength: 50
  },
  email: {
    type: String,
    required: [true, 'Email e obrigatorio'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Email invalido'
    }
  },
  password: {
    type: String,
    required: [true, 'Palavra-passe e obrigatoria'],
    minlength: 6,
    select: false
  },
  avatar: {
    type: String,
    default: ''
  },
  income: {
    type: Number,
    default: 0,
    min: 0
  },
  incomeFrequency: {
    type: String,
    enum: ['mensal', 'quinzenal', 'semanal'],
    default: 'mensal'
  },
  poupMoedas: {
    type: Number,
    default: 0,
    min: 0
  },
  streak: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1
  },
  xp: {
    type: Number,
    default: 0
  },
  trophies: [{
    name: String,
    icon: String,
    earnedAt: { type: Date, default: Date.now }
  }],
  plan: {
    type: String,
    enum: ['free', 'premium'],
    default: 'free'
  },
  coachName: {
    type: String,
    default: 'Ricardo'
  },
  coachGender: {
    type: String,
    enum: ['m', 'f', 'n'],
    default: 'm'
  },
  coachPersonality: {
    type: String,
    enum: ['disciplinado', 'amigavel', 'estrategico', 'espiritual'],
    default: 'disciplinado'
  },
  financialMode: {
    type: String,
    enum: ['sobrevivencia', 'recuperacao', 'estabilidade', 'crescimento', 'prosperidade'],
    default: 'sobrevivencia'
  },
  jarPercentages: {
    necessities: { type: Number, default: 50, min: 0, max: 100 },
    freedom: { type: Number, default: 10, min: 0, max: 100 },
    savings: { type: Number, default: 10, min: 0, max: 100 },
    education: { type: Number, default: 10, min: 0, max: 100 },
    play: { type: Number, default: 10, min: 0, max: 100 },
    give: { type: Number, default: 5, min: 0, max: 100 }
  },
  googleId: {
    type: String,
    default: null
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  dailyCoachMessages: {
    type: Number,
    default: 0
  },
  lastCoachReset: {
    type: Date,
    default: Date.now
  },
  lastLoginDate: {
    type: Date,
    default: null
  },
  onboardingComplete: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Hash da palavra-passe antes de guardar
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Comparar palavra-passe para login
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.virtual('jarAllocations').get(function() {
  if (!this.income) return {};
  return {
    necessities: +(this.income * this.jarPercentages.necessities / 100).toFixed(2),
    freedom: +(this.income * this.jarPercentages.freedom / 100).toFixed(2),
    savings: +(this.income * this.jarPercentages.savings / 100).toFixed(2),
    education: +(this.income * this.jarPercentages.education / 100).toFixed(2),
    play: +(this.income * this.jarPercentages.play / 100).toFixed(2),
    give: +(this.income * this.jarPercentages.give / 100).toFixed(2)
  };
});

module.exports = mongoose.model('User', userSchema);
