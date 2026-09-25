const pool = require('../config/db');

// Get all equipements (optionally filtered by structure)
// Get equipements with filters, search, and pagination
async function getAll({ id_structure = null, search = '', id_type = null, etat = null, filter_structure = null, page = 1, limit = 10 } = {}) {
  let query = `
    SELECT e.*, t.nom_type, s.nom_structure
    FROM Equipement e
    JOIN TypeEquipement t ON e.id_type = t.id_type
    JOIN Structure s ON e.id_structure = s.id_structure
    WHERE 1=1
  `;
  const params = [];

  // Role-based restriction (consultation users locked to their own structure)
  if (id_structure) {
    query += ` AND e.id_structure = ?`;
    params.push(id_structure);
  }

  // Admin-chosen structure filter (only applies if not already locked by role)
  if (!id_structure && filter_structure) {
    query += ` AND e.id_structure = ?`;
    params.push(filter_structure);
  }

  if (search) {
    query += ` AND (e.code_barre LIKE ? OR e.numero_serie LIKE ? OR e.designation LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (id_type) {
    query += ` AND e.id_type = ?`;
    params.push(id_type);
  }

  if (etat) {
    query += ` AND e.etat = ?`;
    params.push(etat);
  }

  // Count total matching rows (for pagination UI), before applying LIMIT
  const countQuery = query.replace(
    'SELECT e.*, t.nom_type, s.nom_structure',
    'SELECT COUNT(*) AS total'
  );
  const [[{ total }]] = await pool.query(countQuery, params);

  // Apply pagination
  const offset = (page - 1) * limit;
  query += ` ORDER BY e.code_barre LIMIT ? OFFSET ?`;
  params.push(Number(limit), Number(offset));

  const [rows] = await pool.query(query, params);

  return { data: rows, total, page: Number(page), limit: Number(limit) };
}

// Get one equipement by its code_barre
async function getByCodeBarre(code_barre) {
  const [rows] = await pool.query(
    `SELECT e.*, t.nom_type, s.nom_structure
     FROM Equipement e
     JOIN TypeEquipement t ON e.id_type = t.id_type
     JOIN Structure s ON e.id_structure = s.id_structure
     WHERE e.code_barre = ?`,
    [code_barre]
  );
  const equipement = rows[0];
  if (!equipement) return null;

  const [caracteristiques] = await pool.query(
    `SELECT id_caracteristique, nom_caracteristique, valeur FROM Caracteristique WHERE code_barre = ?`,
    [code_barre]
  );
  equipement.caracteristiques = caracteristiques;

  return equipement;
}

// Create a new equipement
async function create(data) {
  const { code_barre, numero_serie, designation, marque, reference, annee_mise_en_service, etat, id_type, id_structure, caracteristiques } = data;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(
      `INSERT INTO Equipement (code_barre, numero_serie, designation, marque, reference, annee_mise_en_service, etat, id_type, id_structure)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [code_barre, numero_serie, designation, marque, reference, annee_mise_en_service, etat || 'actif', id_type, id_structure]
    );

    if (Array.isArray(caracteristiques)) {
      for (const c of caracteristiques) {
        if (!c.nom_caracteristique || !c.valeur) continue;
        await conn.query(
          `INSERT INTO Caracteristique (nom_caracteristique, valeur, code_barre) VALUES (?, ?, ?)`,
          [c.nom_caracteristique, c.valeur, code_barre]
        );
      }
    }

    await conn.commit();
    return getByCodeBarre(code_barre);
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

// Update an existing equipement
async function update(code_barre, data) {
  const { numero_serie, designation, marque, reference, annee_mise_en_service, etat, id_type, id_structure, caracteristiques } = data;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(
      `UPDATE Equipement
       SET numero_serie = ?, designation = ?, marque = ?, reference = ?, annee_mise_en_service = ?, etat = ?, id_type = ?, id_structure = ?
       WHERE code_barre = ?`,
      [numero_serie, designation, marque, reference, annee_mise_en_service, etat, id_type, id_structure, code_barre]
    );

    if (Array.isArray(caracteristiques)) {
      await conn.query(`DELETE FROM Caracteristique WHERE code_barre = ?`, [code_barre]);
      for (const c of caracteristiques) {
        if (!c.nom_caracteristique || !c.valeur) continue;
        await conn.query(
          `INSERT INTO Caracteristique (nom_caracteristique, valeur, code_barre) VALUES (?, ?, ?)`,
          [c.nom_caracteristique, c.valeur, code_barre]
        );
      }
    }

    await conn.commit();
    return getByCodeBarre(code_barre);
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

// Delete an equipement
async function remove(code_barre) {
  await pool.query(`DELETE FROM Equipement WHERE code_barre = ?`, [code_barre]);
}
// Count equipements by etat, for the stat cards
async function getStats(id_structure = null) {
  const params = id_structure ? [id_structure] : [];
  const where = id_structure ? ' WHERE id_structure = ?' : '';
  const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM Equipement${where}`, params);
  const [rows] = await pool.query(
    `SELECT etat, COUNT(*) AS count FROM Equipement${where} GROUP BY etat`,
    params
  );

  const counts = { actif: 0, en_panne: 0, defectueux: 0, reforme: 0 };
  rows.forEach((r) => { counts[r.etat] = r.count; });

  return { total, ...counts };
}

module.exports = { getAll, getByCodeBarre, create, update, remove, getStats };