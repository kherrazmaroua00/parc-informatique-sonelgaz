const bcrypt = require('bcrypt');
const pool = require('../config/db');

async function getAll() {
  const [rows] = await pool.query(`
    SELECT u.id_utilisateur, u.nom, u.login, u.role, u.id_structure,
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
    `SELECT u.id_utilisateur, u.nom, u.login, u.role, u.id_structure,
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

async function create(data) {
  const { nom, login, password, id_structure } = data;
  const hashedPassword = await bcrypt.hash(password, 10);
  const [result] = await pool.query(
    `INSERT INTO Utilisateur (nom, login, mot_de_passe, role, id_structure)
     VALUES (?, ?, ?, ?, ?)`,
    [nom, login, hashedPassword, 'consultation', id_structure]
  );
  return getById(result.insertId);
}

async function update(id_utilisateur, data) {
  const { nom, login, password, id_structure } = data;
  if (password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      `UPDATE Utilisateur
       SET nom = ?, login = ?, mot_de_passe = ?, role = ?, id_structure = ?
       WHERE id_utilisateur = ?`,
      [nom, login, hashedPassword, 'consultation', id_structure, id_utilisateur]
    );
  } else {
    await pool.query(
      `UPDATE Utilisateur
       SET nom = ?, login = ?, role = ?, id_structure = ?
       WHERE id_utilisateur = ?`,
      [nom, login, 'consultation', id_structure, id_utilisateur]
    );
  }
  return getById(id_utilisateur);
}

async function remove(id_utilisateur) {
  await pool.query(`DELETE FROM Utilisateur WHERE id_utilisateur = ?`, [id_utilisateur]);
}

module.exports = { getAll, getById, getStats, create, update, remove };