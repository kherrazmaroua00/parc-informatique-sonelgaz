const typeEquipementModel = require('../models/typeEquipementModel');

async function getAll(req, res) {
  try {
    const types = await typeEquipementModel.getAll();
    res.json(types);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

module.exports = { getAll };