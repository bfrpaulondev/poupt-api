const Notification = require('../models/Notification');

const notifyDebtOverdue = async (userId, debt) => {
  await Notification.create({
    userId,
    type: 'divida_vencida',
    title: 'Divida vencida',
    message: `A divida a ${debt.creditorName} venceu. Montante em divida: ${debt.amount - debt.amountPaid}€. Toma medidas para evitar juros adicionais.`,
    priority: 'critica',
    relatedId: debt._id,
    actionUrl: '/dividas'
  });
};

const notifyModeTransition = async (userId, oldMode, newMode) => {
  const modoLabels = {
    sobrevivencia: 'Sobrevivencia',
    recuperacao: 'Recuperacao',
    estabilidade: 'Estabilidade',
    crescimento: 'Crescimento',
    prosperidade: 'Prosperidade'
  };

  await Notification.create({
    userId,
    type: 'transicao_modo',
    title: 'Modo financeiro atualizado',
    message: `O teu modo passou de ${modoLabels[oldMode] || oldMode} para ${modoLabels[newMode] || newMode}. Continua no bom caminho!`,
    priority: 'media',
    actionUrl: '/perfil'
  });
};

const notifyGoalReached = async (userId, goal) => {
  await Notification.create({
    userId,
    type: 'meta_atingida',
    title: 'Meta atingida!',
    message: `Parabens! Atingiste a meta "${goal.name}" com ${goal.targetAmount}€. Ganhas-te 50 PoupMoedas!`,
    priority: 'alta',
    relatedId: goal._id,
    actionUrl: '/metas'
  });
};

const notifyStreakBroken = async (userId) => {
  await Notification.create({
    userId,
    type: 'streak_quebrado',
    title: 'Sequencia quebrada',
    message: 'A tua sequencia de logins diarios foi quebrada. Nao desanimes, recomeca hoje!',
    priority: 'baixa',
    actionUrl: '/perfil'
  });
};

const notifyDebtPaid = async (userId, debt) => {
  await Notification.create({
    userId,
    type: 'divida_vencida',
    title: 'Divida paga!',
    message: `A divida a ${debt.creditorName} foi completamente paga. Liberta o teu oramento! Ganhas-te 30 PoupMoedas.`,
    priority: 'alta',
    relatedId: debt._id,
    actionUrl: '/dividas'
  });
};

const notifyDailyLogin = async (userId) => {
  await Notification.create({
    userId,
    type: 'sistema',
    title: 'Bem-vindo de volta!',
    message: 'Continua a gerir as tuas financas. Cada dia conta para a tua liberdade financeira!',
    priority: 'baixa',
    actionUrl: '/dashboard'
  });
};

module.exports = {
  notifyDebtOverdue,
  notifyModeTransition,
  notifyGoalReached,
  notifyStreakBroken,
  notifyDebtPaid,
  notifyDailyLogin
};
