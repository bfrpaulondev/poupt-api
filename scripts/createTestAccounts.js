require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('../src/models/User');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI;

async function createTestAccounts() {
  try {
    console.log('Conectando ao MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
      maxPoolSize: 5
    });
    console.log('Conectado com sucesso!');

    // =============================================
    // CONTA SUPREMA — Premium + Moedas Ilimitadas
    // =============================================
    const supremeEmail = 'supreme@poupt.pt';
    const supremePassword = 'PoupT2024!';

    // Delete if exists
    await User.deleteOne({ email: supremeEmail });
    console.log('Conta suprema anterior removida (se existia)');

    const supremeUser = await User.create({
      name: 'Tester Supremo',
      email: supremeEmail,
      password: supremePassword,
      avatar: '👑',
      income: 3500,
      incomeFrequency: 'mensal',
      poupMoedas: 999999,
      streak: 30,
      level: 50,
      xp: 15000,
      plan: 'premium',
      coachName: 'Ricardo',
      coachGender: 'm',
      coachPersonality: 'estrategico',
      financialMode: 'prosperidade',
      jarPercentages: {
        necessities: 50,
        freedom: 10,
        savings: 10,
        education: 10,
        play: 10,
        give: 10
      },
      theme: 'darkGold',
      currency: 'EUR',
      language: 'pt',
      notificationSettings: {
        debtReminders: true,
        goalAlerts: true,
        coachTips: true,
        weeklyReports: true
      },
      privacySettings: {
        analytics: true,
        personalizedTips: true
      },
      onboardingComplete: true,
      lastLoginDate: new Date(),
      trophies: [
        { name: 'Primeiro Passo', icon: '🎯', earnedAt: new Date() },
        { name: 'Economista', icon: '💰', earnedAt: new Date() },
        { name: 'Mestre dos Frascos', icon: '🏆', earnedAt: new Date() }
      ]
    });

    console.log('\n✅ CONTA SUPREMA CRIADA:');
    console.log('   Email:', supremeEmail);
    console.log('   Password:', supremePassword);
    console.log('   Plano: PREMIUM');
    console.log('   PoupMoedas: 999.999');
    console.log('   Nível: 50');
    console.log('   XP: 15.000');
    console.log('   Renda: 3.500€');
    console.log('   Troféus: 3');
    console.log('   ID:', supremeUser._id);

    // =============================================
    // CONTA REGULAR — Free, sem premium/moedas
    // =============================================
    const regularEmail = 'tester@poupt.pt';
    const regularPassword = 'PoupT2024!';

    // Delete if exists
    await User.deleteOne({ email: regularEmail });
    console.log('\nConta regular anterior removida (se existia)');

    const regularUser = await User.create({
      name: 'Tester Regular',
      email: regularEmail,
      password: regularPassword,
      avatar: '',
      income: 0,
      incomeFrequency: 'mensal',
      poupMoedas: 50, // 50 moedas iniciais (default do registro)
      streak: 1,
      level: 1,
      xp: 0,
      plan: 'free',
      coachName: 'Ricardo',
      coachGender: 'm',
      coachPersonality: 'disciplinado',
      financialMode: 'sobrevivencia',
      jarPercentages: {
        necessities: 50,
        freedom: 10,
        savings: 10,
        education: 10,
        play: 10,
        give: 10
      },
      theme: 'darkGold',
      currency: 'EUR',
      language: 'pt',
      notificationSettings: {
        debtReminders: true,
        goalAlerts: true,
        coachTips: true,
        weeklyReports: true
      },
      privacySettings: {
        analytics: true,
        personalizedTips: true
      },
      onboardingComplete: false, // Precisa fazer onboarding
      lastLoginDate: new Date()
    });

    console.log('\n✅ CONTA REGULAR CRIADA:');
    console.log('   Email:', regularEmail);
    console.log('   Password:', regularPassword);
    console.log('   Plano: FREE');
    console.log('   PoupMoedas: 50 (inicial)');
    console.log('   Nível: 1');
    console.log('   XP: 0');
    console.log('   Renda: 0€ (precisa configurar)');
    console.log('   Onboarding: Pendente');
    console.log('   ID:', regularUser._id);

    console.log('\n============================================');
    console.log('RESUMO DAS CREDENCIAIS DE TESTE:');
    console.log('============================================');
    console.log('');
    console.log('👑 CONTA SUPREMA (Premium + Moedas Ilimitadas):');
    console.log('   Email: supreme@poupt.pt');
    console.log('   Password: PoupT2024!');
    console.log('');
    console.log('👤 CONTA REGULAR (Free):');
    console.log('   Email: tester@poupt.pt');
    console.log('   Password: PoupT2024!');
    console.log('');
    console.log('============================================');

    await mongoose.disconnect();
    console.log('\nDesconectado do MongoDB. Contas prontas para teste!');

  } catch (err) {
    console.error('Erro:', err.message);
    if (err.errors) {
      Object.keys(err.errors).forEach(key => {
        console.error(`  ${key}: ${err.errors[key].message}`);
      });
    }
    process.exit(1);
  }
}

createTestAccounts();
