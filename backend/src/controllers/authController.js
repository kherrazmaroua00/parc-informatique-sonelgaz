const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

async function login(req, res) {
  const { login, password } = req.body;

  if (!login || !password) {
    return res.status(400).json({ message: 'Login et mot de passe requis' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT * FROM Utilisateur WHERE login = ?',
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
        id_structure: user.id_structure
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
        id_structure: user.id_structure
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

module.exports = { login };