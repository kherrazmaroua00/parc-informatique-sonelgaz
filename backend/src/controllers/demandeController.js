const demandeModel = require('../models/demandeModel');

// GET /api/demandes
async function getAll(req, res) {
  try {
    const id_structure = req.user.role !== 'admin' ? req.user.id_structure : (req.query.id_structure || null);
    const demandes = await demandeModel.getAll({
      id_structure,
      etat: req.query.etat || null,
      search: req.query.search || '',
    });
    res.json(demandes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

// GET /api/demandes/stats
async function getStats(req, res) {
  try {
    const stats = await demandeModel.getStats();
    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

// GET /api/demandes/:id
async function getOne(req, res) {
  try {
    const demande = await demandeModel.getById(req.params.id);
    if (!demande) return res.status(404).json({ message: 'Demande non trouvee' });
    res.json(demande);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

// POST /api/demandes
async function create(req, res) {
  try {
    const { objet, nom_agent, lignes } = req.body;
    const newDemande = await demandeModel.create({
      objet,
      nom_agent,
      lignes,
      id_utilisateur: req.user.id_utilisateur,
      id_structure: req.user.id_structure,
    });
    res.status(201).json(newDemande);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

// PATCH /api/demandes/:id/accorder
async function accorder(req, res) {
  try {
    const demande = await demandeModel.getById(req.params.id);
    if (!demande) return res.status(404).json({ message: 'Demande non trouvee' });
    if (demande.etat_demande !== 'en_attente') {
      return res.status(409).json({ message: 'Cette demande a deja ete traitee' });
    }
    const updated = await demandeModel.accorder(req.params.id);
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

// PATCH /api/demandes/:id/remettre
async function marquerRemis(req, res) {
  try {
    const demande = await demandeModel.getById(req.params.id);
    if (!demande) return res.status(404).json({ message: 'Demande non trouvee' });
    if (demande.etat_demande !== 'accordee') {
      return res.status(409).json({ message: 'Cette demande doit d\'abord etre accordee' });
    }
    const updated = await demandeModel.marquerRemis(req.params.id, req.user.id_utilisateur);
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(409).json({ message: error.message });
  }
}

// PATCH /api/demandes/:id/refuser
async function refuser(req, res) {
  try {
    const demande = await demandeModel.getById(req.params.id);
    if (!demande) return res.status(404).json({ message: 'Demande non trouvee' });
    if (demande.etat_demande === 'servie') {
      return res.status(409).json({ message: 'Cette demande a deja ete servie' });
    }
    const updated = await demandeModel.refuser(req.params.id);
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

module.exports = { getAll, getStats, getOne, create, accorder, marquerRemis, refuser };