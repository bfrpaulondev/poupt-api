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
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

exports.createInteraction = async (req, res) => {
  try {
    const interaction = await CreditorInteraction.create({
      ...req.body,
      userId: req.user.id
    });

    res.status(201).json({
      success: true,
      data: { interaction }
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

exports.updateInteraction = async (req, res) => {
  try {
    const interaction = await CreditorInteraction.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
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
    res.status(400).json({
      success: false,
      error: err.message
    });
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
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};
