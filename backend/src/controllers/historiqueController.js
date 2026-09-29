const historiqueModel = require('../models/historiqueModel');

async function getAll(req, res) {
  try {
    const { type, id_structure, date_debut, date_fin } = req.query;
    const result = await historiqueModel.getAll({
      search: req.query.search || '',
      type: ['affectation', 'remise_consommable', 'changement_etat'].includes(type) ? type : '',
      id_structure: id_structure || '',
      date_debut: /^\d{4}-\d{2}-\d{2}$/.test(date_debut || '') ? date_debut : '',
      date_fin: /^\d{4}-\d{2}-\d{2}$/.test(date_fin || '') ? date_fin : '',
      page: req.query.page,
      limit: req.query.limit,
    });
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

module.exports = { getAll };