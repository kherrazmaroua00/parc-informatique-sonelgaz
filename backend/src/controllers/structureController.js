const structureModel = require('../models/structureModel');

// GET /api/structures
async function getAll(req, res) {
  try {
    const structures = await structureModel.getAll();
    res.json(structures);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

// GET /api/structures/:id
async function getOne(req, res) {
  try {
    const structure = await structureModel.getById(req.params.id);
    if (!structure) {
      return res.status(404).json({ message: 'Structure non trouvee' });
    }
    res.json(structure);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

// POST /api/structures
async function create(req, res) {
  try {
    const newStructure = await structureModel.create(req.body);
    res.status(201).json(newStructure);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

// PUT /api/structures/:id
async function update(req, res) {
  try {
    const existing = await structureModel.getById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Structure non trouvee' });
    }
    const updated = await structureModel.update(req.params.id, req.body);
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

// DELETE /api/structures/:id
async function remove(req, res) {
  try {
    const existing = await structureModel.getById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Structure non trouvee' });
    }
    await structureModel.remove(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

module.exports = { getAll, getOne, create, update, remove };