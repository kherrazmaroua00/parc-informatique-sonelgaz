const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('../config/db');
const utilisateurModel = require('../models/utilisateurModel');

async function login(req, res) {
  const { login, password } = req.body;

  if (!login || !password) {
    return res.status(400).json({ message: 'Login et mot de passe requis' });
  }

  try {
    const [rows] = await pool.query(
      `SELECT u.*, s.nom_structure
       FROM Utilisateur u
       LEFT JOIN Structure s ON s.id_structure = u.id_structure
       WHERE u.login = ?`,
      [login]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    const user = rows[0];
    const passwordMatch = await bcrypt.compare(password, user.mot_de_passe);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    const token = jwt.sign(
      {
        id_utilisateur: user.id_utilisateur,
        role: user.role,
        id_structure: user.id_structure,
        nom_structure: user.nom_structure
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      user: {
        id_utilisateur: user.id_utilisateur,
        nom: user.nom,
        login: user.login,
        role: user.role,
        id_structure: user.id_structure,
        nom_structure: user.nom_structure
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

async function setPassword(req, res) {
  const { token, password } = req.body;
  if (!token || typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({ message: 'Lien invalide ou mot de passe trop court (8 caracteres minimum)' });
  }

  try {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const user = await utilisateurModel.getByInvitationToken(tokenHash);
    if (!user) return res.status(400).json({ message: 'Lien invalide ou expire. Demandez une nouvelle invitation.' });

    const passwordHash = await bcrypt.hash(password, 10);
    const updated = await utilisateurModel.setPasswordWithInvitation(user.id_utilisateur, tokenHash, passwordHash);
    if (!updated) return res.status(400).json({ message: 'Lien deja utilise ou expire. Demandez une nouvelle invitation.' });

    res.json({ login: user.login });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

module.exports = { login, setPassword };