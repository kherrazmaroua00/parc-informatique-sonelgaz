const consommableModel = require('../models/consommableModel');

async function getAll(req, res) {
  try {
    const consommables = await consommableModel.getAll();
    res.json(consommables);
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

module.exports = { getAll, getOne, create, update, remove };