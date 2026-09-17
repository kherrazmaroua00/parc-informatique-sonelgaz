const pool = require('../config/db');

// Get all structures
async function getAll() {
  const [rows] = await pool.query(`SELECT * FROM Structure`);
  return rows;
}

// Get one structure by id
async function getById(id_structure) {
  const [rows] = await pool.query(
    `SELECT * FROM Structure WHERE id_structure = ?`,
    [id_structure]
  );
  return rows[0];
}

// Create a new structure
async function create(data) {
  const { nom_structure, chef_structure } = data;
  const [result] = await pool.query(
    `INSERT INTO Structure (nom_structure, chef_structure) VALUES (?, ?)`,
    [nom_structure, chef_structure]
  );
  return getById(result.insertId);
}

// Update a structure
async function update(id_structure, data) {
  const { nom_structure, chef_structure } = data;
  await pool.query(
    `UPDATE Structure SET nom_structure = ?, chef_structure = ? WHERE id_structure = ?`,
    [nom_structure, chef_structure, id_structure]
  );
  return getById(id_structure);
}

// Delete a structure
async function remove(id_structure) {
  await pool.query(`DELETE FROM Structure WHERE id_structure = ?`, [id_structure]);
}

module.exports = { getAll, getById, create, update, remove };