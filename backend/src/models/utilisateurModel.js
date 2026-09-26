const bcrypt = require('bcrypt');
const pool = require('../config/db');

async function getAll() {
  const [rows] = await pool.query(`
    SELECT u.id_utilisateur, u.nom, u.login, u.email, u.role, u.id_structure,
           s.nom_structure
    FROM Utilisateur u
    LEFT JOIN Structure s ON s.id_structure = u.id_structure
    WHERE u.role = 'consultation'
    ORDER BY u.role ASC, u.nom ASC
  `);
  return rows;
}

async function getById(id_utilisateur) {
  const [rows] = await pool.query(
    `SELECT u.id_utilisateur, u.nom, u.login, u.email, u.role, u.id_structure,
            s.nom_structure
     FROM Utilisateur u
     LEFT JOIN Structure s ON s.id_structure = u.id_structure
     WHERE u.id_utilisateur = ?`,
    [id_utilisateur]
  );
  return rows[0];
}

async function getStats() {
  const [[total]] = await pool.query(`SELECT COUNT(*) AS total_utilisateurs FROM Utilisateur WHERE role = 'consultation'`);
  const [[admin]] = await pool.query(`SELECT COUNT(*) AS total_admins FROM Utilisateur WHERE role = 'admin'`);
  const [[consultation]] = await pool.query(`SELECT COUNT(*) AS total_consultation FROM Utilisateur WHERE role = 'consultation'`);
  const [[assigned]] = await pool.query(`
    SELECT COUNT(*) AS utilisateurs_affectes
    FROM Utilisateur u
    INNER JOIN Structure s ON s.id_structure = u.id_structure
    WHERE u.role = 'consultation'
  `);

  return { ...total, ...admin, ...consultation, ...assigned };
}

async function create(data, invitationTokenHash, invitationExpiresAt) {
  const { nom, login, email, password, id_structure } = data;
  const hashedPassword = await bcrypt.hash(password, 10);
  const [result] = await pool.query(
    `INSERT INTO Utilisateur
     (nom, login, email, mot_de_passe, invitation_token_hash, invitation_expires_at, role, id_structure)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [nom, login, email, hashedPassword, invitationTokenHash, invitationExpiresAt, 'consultation', id_structure]
  );
  return getById(result.insertId);
}

async function update(id_utilisateur, data) {
  const { nom, login, email, password, id_structure } = data;
  if (password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      `UPDATE Utilisateur
         SET nom = ?, login = ?, email = ?, mot_de_passe = ?, invitation_token_hash = NULL,
           invitation_expires_at = NULL, role = ?, id_structure = ?
       WHERE id_utilisateur = ?`,
      [nom, login, email, hashedPassword, 'consultation', id_structure, id_utilisateur]
    );
  } else {
    await pool.query(
      `UPDATE Utilisateur
         SET nom = ?, login = ?, email = ?, invitation_token_hash = NULL,
           invitation_expires_at = NULL, role = ?, id_structure = ?
       WHERE id_utilisateur = ?`,
      [nom, login, email, 'consultation', id_structure, id_utilisateur]
    );
  }
  return getById(id_utilisateur);
}

async function setInvitationToken(id_utilisateur, tokenHash, expiresAt) {
  await pool.query(
    `UPDATE Utilisateur SET invitation_token_hash = ?, invitation_expires_at = ? WHERE id_utilisateur = ?`,
    [tokenHash, expiresAt, id_utilisateur]
  );
}

async function getByInvitationToken(tokenHash) {
  const [rows] = await pool.query(
    `SELECT id_utilisateur, nom, login, email
     FROM Utilisateur
     WHERE invitation_token_hash = ? AND invitation_expires_at > NOW()`,
    [tokenHash]
  );
  return rows[0];
}

async function setPasswordWithInvitation(id_utilisateur, tokenHash, passwordHash) {
  const [result] = await pool.query(
    `UPDATE Utilisateur
     SET mot_de_passe = ?, invitation_token_hash = NULL, invitation_expires_at = NULL
     WHERE id_utilisateur = ? AND invitation_token_hash = ? AND invitation_expires_at > NOW()`,
    [passwordHash, id_utilisateur, tokenHash]
  );
  return result.affectedRows === 1;
}

async function remove(id_utilisateur) {
  await pool.query(`DELETE FROM Utilisateur WHERE id_utilisateur = ?`, [id_utilisateur]);
}

module.exports = {
  getAll,
  getById,
  getStats,
  create,
  update,
  setInvitationToken,
  getByInvitationToken,
  setPasswordWithInvitation,
  remove,
};