const equipementModel = require('../models/equipementModel');

// GET /api/equipements
async function getAll(req, res) {
  try {
    // Role-based filtering: 'consultation' users only see their own structure
    const id_structure = req.user.role === 'consultation' ? req.user.id_structure : null;
    const equipements = await equipementModel.getAll(id_structure);
    res.json(equipements);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

// GET /api/equipements/:code_barre
async function getOne(req, res) {
  try {
    const equipement = await equipementModel.getByCodeBarre(req.params.code_barre);

    if (!equipement) {
      return res.status(404).json({ message: 'Equipement non trouve' });
    }

    // A 'consultation' user can only view equipment from their own structure
    if (req.user.role === 'consultation' && equipement.id_structure !== req.user.id_structure) {
      return res.status(403).json({ message: 'Acces refuse a cet equipement' });
    }

    res.json(equipement);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

// POST /api/equipements
async function create(req, res) {
  try {
    const newEquipement = await equipementModel.create(req.body);
    res.status(201).json(newEquipement);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

// PUT /api/equipements/:code_barre
async function update(req, res) {
  try {
    const existing = await equipementModel.getByCodeBarre(req.params.code_barre);
    if (!existing) {
      return res.status(404).json({ message: 'Equipement non trouve' });
    }

    const updated = await equipementModel.update(req.params.code_barre, req.body);
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

// DELETE /api/equipements/:code_barre
async function remove(req, res) {
  try {
    const existing = await equipementModel.getByCodeBarre(req.params.code_barre);
    if (!existing) {
      return res.status(404).json({ message: 'Equipement non trouve' });
    }

    await equipementModel.remove(req.params.code_barre);
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

module.exports = { getAll, getOne, create, update, remove };