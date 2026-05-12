const ChatLog = require('../models/ChatLog');
const User = require('../models/User');
const { getSystemPrompt } = require('../utils/coachPrompts');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

exports.chat = async (req, res) => {
  try {
    const { message } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Utilizador nao encontrado'
      });
    }

    const now = new Date();
    const lastReset = user.lastCoachReset || new Date(0);
    const isSameDay = now.toDateString() === lastReset.toDateString();

    if (!isSameDay) {
      user.dailyCoachMessages = 0;
      user.lastCoachReset = now;
    }

    const maxMessages = user.plan === 'premium' ? 999 : 3;
    if (user.dailyCoachMessages >= maxMessages) {
      return res.status(403).json({
        success: false,
        error: 'Limite diario de mensagens atingido. Usa PoupMoedas para mais mensagens ou atualiza para Premium.',
        dailyLimit: maxMessages,
        dailyUsed: user.dailyCoachMessages
      });
    }

    let chatLog = await ChatLog.findOne({ userId: user.id }).sort('-createdAt');
    if (!chatLog) {
      chatLog = await ChatLog.create({
        userId: user.id,
        messages: [],
        mode: user.financialMode
      });
    }

    const systemPrompt = getSystemPrompt(user);

    const conversationMessages = [
      { role: 'system', content: systemPrompt },
      ...chatLog.messages.slice(-20).map(m => ({
        role: m.role,
        content: m.content
      })),
      { role: 'user', content: message }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: conversationMessages,
      max_tokens: 500,
      temperature: 0.7
    });

    const assistantMessage = completion.choices[0].message.content;

    chatLog.messages.push(
      { role: 'user', content: message },
      { role: 'assistant', content: assistantMessage }
    );

    if (chatLog.messages.length > 100) {
      chatLog.messages = chatLog.messages.slice(-80);
    }

    chatLog.mode = user.financialMode;
    await chatLog.save();

    user.dailyCoachMessages += 1;
    user.xp = (user.xp || 0) + 2;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      data: {
        reply: assistantMessage,
        dailyUsed: user.dailyCoachMessages,
        dailyLimit: maxMessages
      }
    });
  } catch (err) {
    console.error('Coach chat error:', err.message);
    res.status(500).json({
      success: false,
      error: 'Erro ao comunicar com o Coach. Tenta novamente.'
    });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const chatLog = await ChatLog.findOne({ userId: req.user.id }).sort('-createdAt');

    res.status(200).json({
      success: true,
      data: {
        messages: chatLog ? chatLog.messages : []
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

exports.clearHistory = async (req, res) => {
  try {
    await ChatLog.deleteMany({ userId: req.user.id });

    res.status(200).json({
      success: true,
      message: 'Historico limpo'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};
