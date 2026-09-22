const pool = require('../config/db');

// Get all structures, each with its equipment count
async function getAll() {
  const [rows] = await pool.query(`
    SELECT s.*, COUNT(e.code_barre) AS nb_equipements
    FROM Structure s
    LEFT JOIN Equipement e ON e.id_structure = s.id_structure
    GROUP BY s.id_structure
    ORDER BY nb_equipements DESC
  `);
  return rows;
}

// Get one structure by id, with its equipment count
async function getById(id_structure) {
  const [rows] = await pool.query(
    `SELECT s.*, COUNT(e.code_barre) AS nb_equipements
     FROM Structure s
     LEFT JOIN Equipement e ON e.id_structure = s.id_structure
     WHERE s.id_structure = ?
     GROUP BY s.id_structure`,
    [id_structure]
  );
  return rows[0];
}

// Global summary stats used by the Structures page header cards
async function getStats() {
  const [[{ total_structures }]] = await pool.query(
    `SELECT COUNT(*) AS total_structures FROM Structure`
  );
  const [[{ total_equipements }]] = await pool.query(
    `SELECT COUNT(*) AS total_equipements FROM Equipement`
  );
  const [[{ total_chefs }]] = await pool.query(
    `SELECT COUNT(*) AS total_chefs FROM Structure WHERE chef_structure IS NOT NULL AND chef_structure != ''`
  );

  return { total_structures, total_equipements, total_chefs };
}

// Create a new structure
async function create(data) {
  const { nom_structure, typologie, site, chef_structure, poste_chef } = data;
  const [result] = await pool.query(
    `INSERT INTO Structure (nom_structure, typologie, site, chef_structure, poste_chef) VALUES (?, ?, ?, ?, ?)`,
    [nom_structure, typologie, site, chef_structure, poste_chef]
  );
  return getById(result.insertId);
}

// Update a structure
async function update(id_structure, data) {
  const { nom_structure, typologie, site, chef_structure, poste_chef } = data;
  await pool.query(
    `UPDATE Structure SET nom_structure = ?, typologie = ?, site = ?, chef_structure = ?, poste_chef = ? WHERE id_structure = ?`,
    [nom_structure, typologie, site, chef_structure, poste_chef, id_structure]
  );
  return getById(id_structure);
}

// Delete a structure (blocked if equipment is still attached)
async function remove(id_structure) {
  const [[{ nb }]] = await pool.query(
    `SELECT COUNT(*) AS nb FROM Equipement WHERE id_structure = ?`,
    [id_structure]
  );

  if (nb > 0) {
    const error = new Error('Impossible de supprimer : des equipements sont rattaches a cette structure');
    error.code = 'STRUCTURE_NOT_EMPTY';
    throw error;
  }

  await pool.query(`DELETE FROM Structure WHERE id_structure = ?`, [id_structure]);
}

module.exports = { getAll, getById, getStats, create, update, remove };