const { chat, verificarLimiteGratis, obterHistorico } = require('../services/aiCoach');
const ChatLog = require('../models/ChatLog');
const User = require('../models/User');

exports.enviarMensagem = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ success: false, error: 'Mensagem obrigatoria' });
    }

    const utilizador = await User.findById(req.user._id);

    if (utilizador.plan === 'free') {
      const mensagensHoje = await verificarLimiteGratis(req.user._id);
      if (mensagensHoje >= 3) {
        if (utilizador.poupMoedas >= 100) {
          utilizador.poupMoedas -= 100;
          await utilizador.save({ validateBeforeSave: false });
        } else {
          return res.status(403).json({
            success: false,
            error: 'Limite diario de 3 mensagens atingido. Necessitas de 100 PoupMoedas para mais uma pergunta.',
            moedasNecessarias: 100,
            moedasAtuais: utilizador.poupMoedas,
          });
        }
      }
    }

    const resposta = await chat(req.user._id, message, utilizador);

    utilizador.xp += 5;
    await utilizador.save({ validateBeforeSave: false });

    res.json({ success: true, data: { resposta } });
  } catch (erro) {
    if (erro.status === 429) {
      return res.status(429).json({
        success: false,
        error: 'Servico temporariamente indisponivel. Tenta novamente em breve.',
      });
    }
    next(erro);
  }
};

exports.obterHistorico = async (req, res, next) => {
  try {
    const chatLog = await ChatLog.findOne({ userId: req.user._id });

    if (!chatLog) {
      return res.json({ success: true, data: { messages: [] } });
    }

    res.json({ success: true, data: { messages: chatLog.messages } });
  } catch (erro) {
    next(erro);
  }
};
