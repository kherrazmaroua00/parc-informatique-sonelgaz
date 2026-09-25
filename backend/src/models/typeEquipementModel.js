const pool = require('../config/db');

async function getAll() {
  const [rows] = await pool.query(`SELECT * FROM TypeEquipement ORDER BY nom_type`);
  return rows;
}

module.exports = { getAll };