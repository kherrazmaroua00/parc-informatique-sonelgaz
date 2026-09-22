const pool = require('../config/db');

// Get all demandes (optionally filtered by structure), with their lines
async function getAll(id_structure = null) {
  let query = `
    SELECT d.*, u.nom AS nom_utilisateur, s.nom_structure
    FROM Demande d
    JOIN Utilisateur u ON d.id_utilisateur = u.id_utilisateur
    JOIN Structure s ON d.id_structure = s.id_structure
  `;
  const params = [];

  if (id_structure) {
    query += ` WHERE d.id_structure = ?`;
    params.push(id_structure);
  }

  query += ` ORDER BY d.date_demande DESC`;

  const [rows] = await pool.query(query, params);
  return rows;
}

// Get one demande by id, including its lines (consommables requested)
async function getById(id_demande) {
  const [demandeRows] = await pool.query(
    `SELECT d.*, u.nom AS nom_utilisateur, s.nom_structure
     FROM Demande d
     JOIN Utilisateur u ON d.id_utilisateur = u.id_utilisateur
     JOIN Structure s ON d.id_structure = s.id_structure
     WHERE d.id_demande = ?`,
    [id_demande]
  );

  const demande = demandeRows[0];
  if (!demande) return null;

  const [lignes] = await pool.query(
    `SELECT l.*, c.designation, c.type_consommable
     FROM LigneDemande l
     JOIN Consommable c ON l.id_consommable = c.id_consommable
     WHERE l.id_demande = ?`,
    [id_demande]
  );

  demande.lignes = lignes;
  return demande;
}

// Create a demande with its lines (e.g. [{ id_consommable: 1, quantite: 2 }, ...])
async function create({ objet, nom_agent, id_utilisateur, id_structure, lignes }) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.query(
      `INSERT INTO Demande (objet, date_demande, nom_agent, etat_demande, id_utilisateur, id_structure)
       VALUES (?, CURDATE(), ?, 'en_attente', ?, ?)`,
      [objet, nom_agent, id_utilisateur, id_structure]
    );
    const id_demande = result.insertId;

    for (const ligne of lignes) {
      await conn.query(
        `INSERT INTO LigneDemande (id_demande, id_consommable, quantite) VALUES (?, ?, ?)`,
        [id_demande, ligne.id_consommable, ligne.quantite]
      );
    }

    await conn.commit();
    return getById(id_demande);
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

// Validate a demande: decrement stock, log movements, mark as 'servie'
async function valider(id_demande, id_utilisateur_admin) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [lignes] = await conn.query(
      `SELECT id_consommable, quantite FROM LigneDemande WHERE id_demande = ?`,
      [id_demande]
    );

    if (lignes.length === 0) {
      throw new Error('Cette demande ne contient aucune ligne');
    }

    for (const ligne of lignes) {
      const [updateResult] = await conn.query(
        `UPDATE Consommable
         SET quantite_stock = quantite_stock - ?
         WHERE id_consommable = ? AND quantite_stock >= ?`,
        [ligne.quantite, ligne.id_consommable, ligne.quantite]
      );

      // If no row was updated, stock was insufficient -> abort everything
      if (updateResult.affectedRows === 0) {
        throw new Error(`Stock insuffisant pour le consommable id ${ligne.id_consommable}`);
      }

      await conn.query(
        `INSERT INTO Mouvement (date_mouvement, type_mouvement, quantite, id_consommable, id_utilisateur, id_demande)
         VALUES (NOW(), 'remise_consommable', ?, ?, ?, ?)`,
        [ligne.quantite, ligne.id_consommable, id_utilisateur_admin, id_demande]
      );
    }

    await conn.query(
      `UPDATE Demande SET etat_demande = 'servie' WHERE id_demande = ?`,
      [id_demande]
    );

    await conn.commit();
    return getById(id_demande);
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

// Refuse a demande (no stock impact)
async function refuser(id_demande) {
  await pool.query(
    `UPDATE Demande SET etat_demande = 'refusee' WHERE id_demande = ?`,
    [id_demande]
  );
  return getById(id_demande);
}

module.exports = { getAll, getById, create, valider, refuser };