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

async function assignChef(connection, id_structure, chefUtilisateurId, previousChefName) {
  const [[chef]] = await connection.query(
    `SELECT id_utilisateur, nom
     FROM Utilisateur
     WHERE id_utilisateur = ? AND role = 'consultation'`,
    [chefUtilisateurId]
  );

  if (!chef) {
    const error = new Error('Le chef doit etre un utilisateur de consultation valide');
    error.code = 'INVALID_CHEF';
    throw error;
  }

  if (previousChefName && previousChefName !== chef.nom) {
    await connection.query(
      `UPDATE Utilisateur SET role = 'consultation' WHERE nom = ? AND id_structure = ? AND role = 'chef_structure'`,
      [previousChefName, id_structure]
    );
  }

  await connection.query(
    `UPDATE Utilisateur SET role = 'chef_structure', id_structure = ? WHERE id_utilisateur = ?`,
    [id_structure, chefUtilisateurId]
  );
}

// Create a new structure
async function create(data) {
  const { nom_structure, typologie, site, chef_structure, chef_utilisateur_id, poste_chef } = data;
  const connection = await pool.getConnection();
  let result;
  try {
    await connection.beginTransaction();
    [result] = await connection.query(
      `INSERT INTO Structure (nom_structure, typologie, site, chef_structure, poste_chef) VALUES (?, ?, ?, ?, ?)`,
      [nom_structure, typologie, site, chef_structure, poste_chef]
    );
    await assignChef(connection, result.insertId, chef_utilisateur_id, null);
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
  return getById(result.insertId);
}

// Update a structure
async function update(id_structure, data) {
  const { nom_structure, typologie, site, chef_structure, chef_utilisateur_id, poste_chef } = data;
  const existing = await getById(id_structure);
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query(
      `UPDATE Structure SET nom_structure = ?, typologie = ?, site = ?, chef_structure = ?, poste_chef = ? WHERE id_structure = ?`,
      [nom_structure, typologie, site, chef_structure, poste_chef, id_structure]
    );
    await assignChef(connection, id_structure, chef_utilisateur_id, existing.chef_structure);
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
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