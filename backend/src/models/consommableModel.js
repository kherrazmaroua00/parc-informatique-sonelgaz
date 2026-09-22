const pool = require('../config/db');

// Get all consommables
async function getAll() {
  const [rows] = await pool.query(`SELECT * FROM Consommable`);
  return rows;
}

// Get one consommable by id
async function getById(id_consommable) {
  const [rows] = await pool.query(
    `SELECT * FROM Consommable WHERE id_consommable = ?`,
    [id_consommable]
  );
  return rows[0];
}

// Create a new consommable
async function create(data) {
  const { designation, type_consommable, quantite_stock } = data;
  const [result] = await pool.query(
    `INSERT INTO Consommable (designation, type_consommable, quantite_stock) VALUES (?, ?, ?)`,
    [designation, type_consommable, quantite_stock || 0]
  );
  return getById(result.insertId);
}

// Update a consommable
async function update(id_consommable, data) {
  const { designation, type_consommable, quantite_stock } = data;
  await pool.query(
    `UPDATE Consommable SET designation = ?, type_consommable = ?, quantite_stock = ? WHERE id_consommable = ?`,
    [designation, type_consommable, quantite_stock, id_consommable]
  );
  return getById(id_consommable);
}

// Delete a consommable
async function remove(id_consommable) {
  await pool.query(`DELETE FROM Consommable WHERE id_consommable = ?`, [id_consommable]);
}

module.exports = { getAll, getById, create, update, remove };