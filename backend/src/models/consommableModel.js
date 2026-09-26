const pool = require('../config/db');

const SEUIL_FAIBLE = 5;

function withNiveau(row) {
  let niveau_stock;
  if (row.quantite_stock === 0) niveau_stock = 'rupture';
  else if (row.quantite_stock < SEUIL_FAIBLE) niveau_stock = 'faible';
  else niveau_stock = 'normal';
  return { ...row, niveau_stock };
}

// Get consommables with search, type filter, niveau filter, and pagination
async function getAll({ search = '', type_consommable = null, niveau = null, page = 1, limit = 10 } = {}) {
  let query = `SELECT * FROM Consommable WHERE 1=1`;
  const params = [];

  if (search) {
    query += ` AND (designation LIKE ? OR reference LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`);
  }

  if (type_consommable) {
    query += ` AND type_consommable = ?`;
    params.push(type_consommable);
  }

  if (niveau === 'rupture') {
    query += ` AND quantite_stock = 0`;
  } else if (niveau === 'faible') {
    query += ` AND quantite_stock > 0 AND quantite_stock < ${SEUIL_FAIBLE}`;
  } else if (niveau === 'normal') {
    query += ` AND quantite_stock >= ${SEUIL_FAIBLE}`;
  }

  const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) AS total');
  const [[{ total }]] = await pool.query(countQuery, params);

  const offset = (page - 1) * limit;
  query += ` ORDER BY quantite_stock ASC LIMIT ? OFFSET ?`;
  params.push(Number(limit), Number(offset));

  const [rows] = await pool.query(query, params);

  return { data: rows.map(withNiveau), total, page: Number(page), limit: Number(limit) };
}

// Get one consommable by id
async function getById(id_consommable) {
  const [rows] = await pool.query(
    `SELECT * FROM Consommable WHERE id_consommable = ?`,
    [id_consommable]
  );
  return rows[0] ? withNiveau(rows[0]) : null;
}

// Global stats: total references, rupture count, faible count, distinct types
async function getStats() {
  const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM Consommable`);
  const [[{ rupture }]] = await pool.query(
    `SELECT COUNT(*) AS rupture FROM Consommable WHERE quantite_stock = 0`
  );
  const [[{ faible }]] = await pool.query(
    `SELECT COUNT(*) AS faible FROM Consommable WHERE quantite_stock > 0 AND quantite_stock < ${SEUIL_FAIBLE}`
  );
  const [types] = await pool.query(
    `SELECT DISTINCT type_consommable FROM Consommable WHERE type_consommable IS NOT NULL ORDER BY type_consommable`
  );

  return { total, rupture, faible, alertes: rupture + faible, types: types.map((t) => t.type_consommable) };
}

// Create a new consommable
async function create(data) {
  const { designation, reference, type_consommable, quantite_stock, emplacement } = data;
  const [result] = await pool.query(
    `INSERT INTO Consommable (designation, reference, type_consommable, quantite_stock, emplacement) VALUES (?, ?, ?, ?, ?)`,
    [designation, reference, type_consommable, quantite_stock || 0, emplacement]
  );
  return getById(result.insertId);
}

// Update a consommable
async function update(id_consommable, data) {
  const { designation, reference, type_consommable, quantite_stock, emplacement } = data;
  await pool.query(
    `UPDATE Consommable SET designation = ?, reference = ?, type_consommable = ?, quantite_stock = ?, emplacement = ? WHERE id_consommable = ?`,
    [designation, reference, type_consommable, quantite_stock, emplacement, id_consommable]
  );
  return getById(id_consommable);
}

// Delete a consommable
async function remove(id_consommable) {
  await pool.query(`DELETE FROM Consommable WHERE id_consommable = ?`, [id_consommable]);
}
// Validate a batch of rows before import
async function validateBatch(rows) {
  const [existing] = await pool.query(`SELECT reference FROM Consommable WHERE reference IS NOT NULL`);
  const existingRefs = new Set(existing.map((e) => e.reference));
  const seenInFile = new Set();

  return rows.map((row) => {
    const issues = [];

    if (!row.designation) issues.push('Designation manquante');
    if (!row.type_consommable) issues.push('Type manquant');
    if (row.quantite_stock === '' || row.quantite_stock === undefined || isNaN(Number(row.quantite_stock))) {
      issues.push('Quantite invalide');
    }

    if (row.reference) {
      if (existingRefs.has(row.reference)) issues.push('Doublon reference (deja en base)');
      else if (seenInFile.has(row.reference)) issues.push('Doublon reference (dans le fichier)');
      seenInFile.add(row.reference);
    }

    return { ...row, valid: issues.length === 0, issues };
  });
}

// Import only the valid rows, in one transaction
async function importBatch(rows) {
  const validRows = rows.filter((r) => r.valid);
  if (validRows.length === 0) return { imported: 0 };

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    for (const row of validRows) {
      await conn.query(
        `INSERT INTO Consommable (designation, reference, type_consommable, quantite_stock, emplacement) VALUES (?, ?, ?, ?, ?)`,
        [row.designation, row.reference || null, row.type_consommable, Number(row.quantite_stock) || 0, row.emplacement || null]
      );
    }

    await conn.commit();
    return { imported: validRows.length };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

module.exports = { getAll, getById, getStats, create, update, remove, validateBatch, importBatch };