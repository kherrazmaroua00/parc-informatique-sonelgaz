const utilisateurModel = require('../models/utilisateurModel');

async function getAll(req, res) {
  try {
    res.json(await utilisateurModel.getAll());
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

async function getStats(req, res) {
  try {
    res.json(await utilisateurModel.getStats());
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

async function create(req, res) {
  try {
    const { nom, login, password, role, id_structure } = req.body;
    if (!nom || !login || !password || !role || !id_structure) {
      return res.status(400).json({ message: 'Tous les champs obligatoires doivent etre renseignes' });
    }
    res.status(201).json(await utilisateurModel.create(req.body));
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Ce login est deja utilise' });
    }
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

async function update(req, res) {
  try {
    const existing = await utilisateurModel.getById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Utilisateur non trouve' });
    res.json(await utilisateurModel.update(req.params.id, req.body));
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Ce login est deja utilise' });
    }
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

async function remove(req, res) {
  try {
    if (Number(req.params.id) === req.user.id_utilisateur) {
      return res.status(400).json({ message: 'Impossible de supprimer votre propre compte' });
    }
    const existing = await utilisateurModel.getById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Utilisateur non trouve' });
    await utilisateurModel.remove(req.params.id);
    res.status(204).send();
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({ message: 'Impossible de supprimer : cet utilisateur est lie a des demandes ou mouvements' });
    }
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

module.exports = { getAll, getStats, create, update, remove };