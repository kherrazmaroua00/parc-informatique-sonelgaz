const utilisateurModel = require('../models/utilisateurModel');
const crypto = require('crypto');
const emailService = require('../services/emailService');

function createInvitationToken() {
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return { token, tokenHash, expiresAt };
}

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
    const { nom, login, email, id_structure } = req.body;
    if (!nom || !login || !email || !id_structure) {
      return res.status(400).json({ message: 'Tous les champs obligatoires doivent etre renseignes' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Adresse email invalide' });
    }

    const { token, tokenHash, expiresAt } = createInvitationToken();
    const temporaryPassword = crypto.randomBytes(32).toString('base64url');
    const user = await utilisateurModel.create(
      { ...req.body, password: temporaryPassword },
      tokenHash,
      expiresAt
    );

    try {
      await emailService.sendInvitation({ email, nom, login, token });
      return res.status(201).json({ user, emailSent: true });
    } catch (mailError) {
      console.error('Invitation email failed:', mailError.message);
      return res.status(201).json({ user, emailSent: false });
    }
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Ce login ou cette adresse email est deja utilise' });
    }
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

async function sendInvitation(req, res) {
  try {
    const user = await utilisateurModel.getById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouve' });
    if (!user.email) return res.status(400).json({ message: 'Ajoutez une adresse email avant d envoyer une invitation' });

    const { token, tokenHash, expiresAt } = createInvitationToken();
    await utilisateurModel.setInvitationToken(user.id_utilisateur, tokenHash, expiresAt);
    await emailService.sendInvitation({ ...user, token });
    res.json({ emailSent: true });
  } catch (error) {
    console.error('Invitation email failed:', error.message);
    res.status(502).json({ message: 'Email non envoye. Verifiez la configuration SMTP du serveur.' });
  }
}

async function update(req, res) {
  try {
    const { nom, login, email, id_structure } = req.body;
    if (!nom || !login || !email || !id_structure || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Nom, login, email et structure valides sont obligatoires' });
    }

    const existing = await utilisateurModel.getById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Utilisateur non trouve' });
    res.json(await utilisateurModel.update(req.params.id, req.body));
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Ce login ou cette adresse email est deja utilise' });
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

module.exports = { getAll, getStats, create, update, remove, sendInvitation };