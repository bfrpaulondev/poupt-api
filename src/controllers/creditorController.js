const CreditorInteraction = require('../models/CreditorInteraction');

exports.getInteractions = async (req, res) => {
  try {
    const { negotiationStatus, type } = req.query;
    const query = { userId: req.user.id };

    if (negotiationStatus) query.negotiationStatus = negotiationStatus;
    if (type) query.type = type;

    const interactions = await CreditorInteraction.find(query)
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: { interactions }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

exports.createInteraction = async (req, res) => {
  try {
    const { creditorName, debtId, type, negotiationStatus, outcome, nextAction, contactInfo, notes } = req.body;
    const interaction = await CreditorInteraction.create({
      creditorName, debtId, type, negotiationStatus, outcome, nextAction, contactInfo, notes,
      userId: req.user.id
    });

    res.status(201).json({
      success: true,
      data: { interaction }
    });
  } catch (err) {
    console.error(err);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ success: false, error: messages.join(', ') });
    }
    if (err.code === 11000) {
      return res.status(400).json({ success: false, error: 'Registo duplicado' });
    }
    res.status(400).json({ success: false, error: 'Erro ao processar pedido' });
  }
};

exports.updateInteraction = async (req, res) => {
  try {
    const { creditorName, type, negotiationStatus, outcome, nextAction, contactInfo, notes } = req.body;
    const updateData = { creditorName, type, negotiationStatus, outcome, nextAction, contactInfo, notes };
    // Remove undefined fields
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    const interaction = await CreditorInteraction.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!interaction) {
      return res.status(404).json({
        success: false,
        error: 'Interacao com credor nao encontrada'
      });
    }

    res.status(200).json({
      success: true,
      data: { interaction }
    });
  } catch (err) {
    console.error(err);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ success: false, error: messages.join(', ') });
    }
    if (err.code === 11000) {
      return res.status(400).json({ success: false, error: 'Registo duplicado' });
    }
    res.status(400).json({ success: false, error: 'Erro ao processar pedido' });
  }
};

exports.addHistoryEntry = async (req, res) => {
  try {
    const { date, type, notes, outcome } = req.body;

    if (!type || !notes) {
      return res.status(400).json({
        success: false,
        error: 'Tipo e notas sao obrigatorios'
      });
    }

    const interaction = await CreditorInteraction.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!interaction) {
      return res.status(404).json({
        success: false,
        error: 'Interacao com credor nao encontrada'
      });
    }

    interaction.interactionHistory.push({
      date: date || new Date(),
      type,
      notes,
      outcome: outcome || ''
    });

    await interaction.save();

    res.status(200).json({
      success: true,
      data: { interaction }
    });
  } catch (err) {
    console.error(err);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ success: false, error: messages.join(', ') });
    }
    if (err.code === 11000) {
      return res.status(400).json({ success: false, error: 'Registo duplicado' });
    }
    res.status(400).json({ success: false, error: 'Erro ao processar pedido' });
  }
};
