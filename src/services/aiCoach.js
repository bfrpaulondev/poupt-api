const OpenAI = require('openai');
const ChatLog = require('../models/ChatLog');
const { obterPrincipios } = require('./wisdomEngine');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const construirPrompt = (utilizador) => {
  const principios = obterPrincipios(utilizador.financialMode);

  const generoMapa = { m: 'masculino', f: 'feminino', n: 'neutro' };
  const genero = generoMapa[utilizador.coachGender] || 'neutro';

  return `Tu es ${utilizador.coachName}, o alter ego financeiro bem-sucedido de ${utilizador.name}. Tu es a versao de ${utilizador.name} que ja alcancou liberdade financeira. Genero: ${genero}. Personalidade base: ${utilizador.coachPersonality}. Modo atual do utilizador: ${utilizador.financialMode}. Sabedoria que guia as tuas respostas: ${principios}. Regras: 1. Fala sempre em portugues de Portugal. 2. Adapta o tom ao modo atual. 3. Cita princípios dos livros quando relevante. 4. Nunca dizes 'como IA' - tu es ${utilizador.coachName}. 5. Referencia o nome do utilizador. 6. Da conselhos acionáveis. 7. Usa dados reais do utilizador. 8. Celebra vitórias. 9. Nunca julgas - orientas. 10. Mantem mensagens concisas mas impactantes.`;
};

const verificarLimiteGratis = async (userId) => {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const logsHoje = await ChatLog.aggregate([
    { $match: { userId: userId } },
    { $unwind: '$messages' },
    {
      $match: {
        'messages.role': 'user',
        'messages.timestamp': { $gte: hoje },
      },
    },
    { $count: 'total' },
  ]);

  return logsHoje.length > 0 ? logsHoje[0].total : 0;
};

const obterHistorico = async (userId) => {
  let chatLog = await ChatLog.findOne({ userId: userId });
  if (!chatLog) return [];

  return chatLog.messages.slice(-10);
};

const chat = async (userId, mensagem, utilizador) => {
  const historico = await obterHistorico(userId);
  const systemPrompt = construirPrompt(utilizador);

  const mensagens = [
    { role: 'system', content: systemPrompt },
    ...historico.map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: mensagem },
  ];

  const resposta = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: mensagens,
    max_tokens: 500,
    temperature: 0.7,
  });

  const respostaTexto = resposta.choices[0].message.content;

  let chatLog = await ChatLog.findOne({ userId: userId });
  if (!chatLog) {
    chatLog = await ChatLog.create({
      userId: userId,
      messages: [],
      mode: utilizador.financialMode,
    });
  }

  chatLog.messages.push(
    { role: 'user', content: mensagem, timestamp: new Date() },
    { role: 'assistant', content: respostaTexto, timestamp: new Date() }
  );
  chatLog.mode = utilizador.financialMode;
  await chatLog.save();

  return respostaTexto;
};

module.exports = { chat, verificarLimiteGratis, obterHistorico };
