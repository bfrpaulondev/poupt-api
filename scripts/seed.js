require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');
const Transaction = require('../src/models/Transaction');
const Debt = require('../src/models/Debt');
const Goal = require('../src/models/Goal');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Ligado ao MongoDB');

    await User.deleteMany();
    await Transaction.deleteMany();
    await Debt.deleteMany();
    await Goal.deleteMany();

    const hashedPassword = await bcrypt.hash('123456', 12);

    const ana = await User.create({
      name: 'Ana Silva',
      email: 'ana@exemplo.pt',
      password: hashedPassword,
      income: 1100,
      incomeFrequency: 'mensal',
      financialMode: 'sobrevivencia',
      coachName: 'Ricardo',
      coachGender: 'm',
      coachPersonality: 'disciplinado',
      poupMoedas: 390,
      streak: 12,
      level: 5,
      xp: 450,
      onboardingComplete: true,
      trophies: [
        { name: 'Primeira Transacao', icon: '🎯', earnedAt: new Date() },
        { name: '7 Dias Seguidos', icon: '🔥', earnedAt: new Date() },
        { name: 'Divida Eliminada', icon: '🏆', earnedAt: new Date() }
      ],
      jarPercentages: {
        necessities: 50,
        freedom: 10,
        savings: 10,
        education: 10,
        play: 10,
        give: 5
      }
    });

    console.log(`Utilizadora criada: ${ana.name} (${ana.email})`);

    const transactions = await Transaction.insertMany([
      { userId: ana._id, type: 'receita', amount: 1100, category: 'salario', description: 'Salario mensal', jar: 'necessities', date: new Date('2026-05-01') },
      { userId: ana._id, type: 'despesa', amount: 550, category: 'habitacao', description: 'Renda negociada', jar: 'necessities', date: new Date('2026-05-02') },
      { userId: ana._id, type: 'despesa', amount: 180, category: 'alimentacao', description: 'Supermercado semana 1', jar: 'necessities', date: new Date('2026-05-03') },
      { userId: ana._id, type: 'despesa', amount: 45, category: 'transportes', description: 'Metro passe mensal', jar: 'necessities', date: new Date('2026-05-01') },
      { userId: ana._id, type: 'despesa', amount: 250, category: 'pagamento_divida', description: 'Pagamento WiZink', date: new Date('2026-05-05') },
      { userId: ana._id, type: 'despesa', amount: 100, category: 'pagamento_divida', description: 'Pagamento ao Joao', date: new Date('2026-05-05') },
      { userId: ana._id, type: 'despesa', amount: 85, category: 'alimentacao', description: 'Supermercado semana 2', jar: 'necessities', date: new Date('2026-05-10') },
      { userId: ana._id, type: 'receita', amount: 200, category: 'freelance', description: 'Horas extra loja', date: new Date('2026-05-15') },
      { userId: ana._id, type: 'despesa', amount: 35, category: 'educacao', description: 'Curso online Excel', jar: 'education', date: new Date('2026-05-08') },
      { userId: ana._id, type: 'poupanca', amount: 50, category: 'poupanca', description: 'Fundo emergencia', jar: 'savings', date: new Date('2026-05-14') }
    ]);

    console.log(`${transactions.length} transacoes criadas`);

    const debts = await Debt.insertMany([
      {
        userId: ana._id, type: 'formal', creditorName: 'WiZink',
        amount: 2847, amountPaid: 750, minimumPayment: 85,
        interestRate: 14.9, status: 'pendente',
        relationshipType: 'banco', dueDate: new Date('2026-06-15'),
        notes: 'Cartao de credito em atraso'
      },
      {
        userId: ana._id, type: 'formal', creditorName: 'Cofidis',
        amount: 3890, amountPaid: 1200, minimumPayment: 120,
        interestRate: 8.5, status: 'pendente',
        relationshipType: 'banco', dueDate: new Date('2026-12-01'),
        notes: 'Emprestimo pessoal dentro do prazo'
      },
      {
        userId: ana._id, type: 'informal', creditorName: 'Joao',
        amount: 300, amountPaid: 200,
        status: 'parcial', relationshipType: 'amigo',
        startDate: new Date('2026-02-01'),
        dueDate: new Date('2026-06-01'),
        notes: 'Emprestimo do amigo Joao para pagar renda'
      },
      {
        userId: ana._id, type: 'formal', creditorName: 'Intrum',
        amount: 487, amountPaid: 487,
        status: 'pago', relationshipType: 'cobranca',
        notes: 'Divida da Intrum paga no dia 10'
      }
    ]);

    console.log(`${debts.length} dividas criadas`);

    const goals = await Goal.insertMany([
      {
        userId: ana._id, name: 'Fundo de Emergencia',
        type: 'fundo_emergencia', targetAmount: 6600,
        currentAmount: 350, monthlyContribution: 50,
        icon: 'shield', color: '#10B981'
      },
      {
        userId: ana._id, name: 'Eliminar WiZink',
        type: 'divida', targetAmount: 2097,
        currentAmount: 750, monthlyContribution: 250,
        icon: 'flame', color: '#EF4444'
      }
    ]);

    console.log(`${goals.length} metas criadas`);
    console.log('\nSeed completo! Login: ana@exemplo.pt / 123456');

    process.exit(0);
  } catch (err) {
    console.error('Erro no seed:', err);
    process.exit(1);
  }
};

seedData();
