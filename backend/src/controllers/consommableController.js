const consommableModel = require('../models/consommableModel');

async function getAll(req, res) {
  try {
    const result = await consommableModel.getAll({
      search: req.query.search || '',
      type_consommable: req.query.type || null,
      niveau: req.query.niveau || null,
      page: req.query.page || 1,
      limit: req.query.limit || 10,
    });
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

async function getStats(req, res) {
  try {
    const stats = await consommableModel.getStats();
    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

async function getOne(req, res) {
  try {
    const consommable = await consommableModel.getById(req.params.id);
    if (!consommable) {
      return res.status(404).json({ message: 'Consommable non trouve' });
    }
    res.json(consommable);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

async function create(req, res) {
  try {
    const newConsommable = await consommableModel.create(req.body);
    res.status(201).json(newConsommable);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

async function update(req, res) {
  try {
    const existing = await consommableModel.getById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Consommable non trouve' });
    }
    const updated = await consommableModel.update(req.params.id, req.body);
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

async function remove(req, res) {
  try {
    const existing = await consommableModel.getById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Consommable non trouve' });
    }
    await consommableModel.remove(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

async function validateBatch(req, res) {
  try {
    const { rows } = req.body;
    if (!Array.isArray(rows)) {
      return res.status(400).json({ message: 'Le champ rows doit etre un tableau' });
    }
    const result = await consommableModel.validateBatch(rows);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

async function importBatch(req, res) {
  try {
    const { rows } = req.body;
    if (!Array.isArray(rows)) {
      return res.status(400).json({ message: 'Le champ rows doit etre un tableau' });
    }
    const result = await consommableModel.importBatch(rows);
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

module.exports = { getAll, getStats, getOne, create, update, remove, validateBatch, importBatch };