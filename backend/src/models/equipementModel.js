const pool = require('../config/db');

// Get all equipements (optionally filtered by structure)
async function getAll(id_structure = null) {
  if (id_structure) {
    const [rows] = await pool.query(
      `SELECT e.*, t.nom_type, s.nom_structure
       FROM Equipement e
       JOIN TypeEquipement t ON e.id_type = t.id_type
       JOIN Structure s ON e.id_structure = s.id_structure
       WHERE e.id_structure = ?`,
      [id_structure]
    );
    return rows;
  }

  const [rows] = await pool.query(
    `SELECT e.*, t.nom_type, s.nom_structure
     FROM Equipement e
     JOIN TypeEquipement t ON e.id_type = t.id_type
     JOIN Structure s ON e.id_structure = s.id_structure`
  );
  return rows;
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
  return rows[0];
}

// Create a new equipement
async function create(data) {
  const { code_barre, numero_serie, designation, marque, reference, annee_mise_en_service, etat, id_type, id_structure } = data;
  await pool.query(
    `INSERT INTO Equipement (code_barre, numero_serie, designation, marque, reference, annee_mise_en_service, etat, id_type, id_structure)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [code_barre, numero_serie, designation, marque, reference, annee_mise_en_service, etat || 'actif', id_type, id_structure]
  );
  return getByCodeBarre(code_barre);
}

// Update an existing equipement
async function update(code_barre, data) {
  const { numero_serie, designation, marque, reference, annee_mise_en_service, etat, id_type, id_structure } = data;
  await pool.query(
    `UPDATE Equipement
     SET numero_serie = ?, designation = ?, marque = ?, reference = ?, annee_mise_en_service = ?, etat = ?, id_type = ?, id_structure = ?
     WHERE code_barre = ?`,
    [numero_serie, designation, marque, reference, annee_mise_en_service, etat, id_type, id_structure, code_barre]
  );
  return getByCodeBarre(code_barre);
}

// Delete an equipement
async function remove(code_barre) {
  await pool.query(`DELETE FROM Equipement WHERE code_barre = ?`, [code_barre]);
}

module.exports = { getAll, getByCodeBarre, create, update, remove };