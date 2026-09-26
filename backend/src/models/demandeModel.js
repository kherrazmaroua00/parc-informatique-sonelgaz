const pool = require('../config/db');

const CADENCE_JOURS = 90; // below this many days since the agent's last request for the same item, flag it

// Get all demandes (optionally filtered by structure/etat/search), each with its lines + alerts
async function getAll({ id_structure = null, etat = null, search = '' } = {}) {
  let query = `
    SELECT d.*, u.nom AS nom_utilisateur, s.nom_structure
    FROM Demande d
    JOIN Utilisateur u ON d.id_utilisateur = u.id_utilisateur
    JOIN Structure s ON d.id_structure = s.id_structure
    WHERE 1=1
  `;
  const params = [];

  if (id_structure) {
    query += ` AND d.id_structure = ?`;
    params.push(id_structure);
  }
  if (etat) {
    query += ` AND d.etat_demande = ?`;
    params.push(etat);
  }
  if (search) {
    query += ` AND (d.nom_agent LIKE ? OR d.objet LIKE ? OR d.id_demande LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  query += ` ORDER BY d.date_demande DESC, d.id_demande DESC`;

  const [demandes] = await pool.query(query, params);

  // Attach lines + alerts to each demande
  for (const demande of demandes) {
    demande.lignes = await getLignesWithAlerts(demande.id_demande, demande.nom_agent);
  }

  return demandes;
}

async function getLignesWithAlerts(id_demande, nom_agent) {
  const [lignes] = await pool.query(
    `SELECT l.id_consommable, l.quantite, c.designation, c.type_consommable, c.quantite_stock
     FROM LigneDemande l
     JOIN Consommable c ON l.id_consommable = c.id_consommable
     WHERE l.id_demande = ?`,
    [id_demande]
  );

  for (const ligne of lignes) {
    // Stock alert: is there enough stock to satisfy this line right now?
    if (ligne.quantite_stock === 0) {
      ligne.alerte_stock = 'rupture';
    } else if (ligne.quantite_stock < ligne.quantite) {
      ligne.alerte_stock = 'insuffisant';
    } else {
      ligne.alerte_stock = null;
    }

    // Cadence alert: has this same agent received this same consommable recently?
    const [[lastMovement]] = await pool.query(
      `SELECT m.date_mouvement, COUNT(*) OVER() AS nb_fois
       FROM Mouvement m
       JOIN Demande d2 ON m.id_demande = d2.id_demande
       WHERE d2.nom_agent = ? AND m.id_consommable = ? AND m.type_mouvement = 'remise_consommable'
       ORDER BY m.date_mouvement DESC
       LIMIT 1`,
      [nom_agent, ligne.id_consommable]
    );

    if (lastMovement) {
      const joursEcoules = Math.floor((Date.now() - new Date(lastMovement.date_mouvement)) / (1000 * 60 * 60 * 24));
      ligne.derniere_dotation_jours = joursEcoules;
      ligne.alerte_cadence = joursEcoules < CADENCE_JOURS;
      ligne.nb_dotations_precedentes = lastMovement.nb_fois;
    } else {
      ligne.derniere_dotation_jours = null;
      ligne.alerte_cadence = false;
      ligne.nb_dotations_precedentes = 0;
    }
  }

  return lignes;
}

async function getById(id_demande) {
  const [rows] = await pool.query(
    `SELECT d.*, u.nom AS nom_utilisateur, s.nom_structure
     FROM Demande d
     JOIN Utilisateur u ON d.id_utilisateur = u.id_utilisateur
     JOIN Structure s ON d.id_structure = s.id_structure
     WHERE d.id_demande = ?`,
    [id_demande]
  );
  const demande = rows[0];
  if (!demande) return null;
  demande.lignes = await getLignesWithAlerts(id_demande, demande.nom_agent);
  return demande;
}

// Stats for the four top cards
async function getStats() {
  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM Demande WHERE MONTH(date_demande) = MONTH(CURDATE()) AND YEAR(date_demande) = YEAR(CURDATE())`
  );
  const [[{ en_attente }]] = await pool.query(
    `SELECT COUNT(*) AS en_attente FROM Demande WHERE etat_demande = 'en_attente'`
  );
  const [[{ accordee }]] = await pool.query(
    `SELECT COUNT(*) AS accordee FROM Demande WHERE etat_demande = 'accordee'`
  );
  const [[{ servie }]] = await pool.query(
    `SELECT COUNT(*) AS servie FROM Demande WHERE etat_demande = 'servie'`
  );
  return { total, en_attente, accordee, servie };
}

// Create a demande with its lines
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

// Step 1: admin approves the request (does NOT touch stock yet — just marks it ready for pickup)
async function accorder(id_demande) {
  await pool.query(`UPDATE Demande SET etat_demande = 'accordee' WHERE id_demande = ?`, [id_demande]);
  return getById(id_demande);
}

// Step 2: mark as physically handed out — THIS decrements stock and logs the Mouvement
async function marquerRemis(id_demande, id_utilisateur_admin) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [lignes] = await conn.query(
      `SELECT id_consommable, quantite FROM LigneDemande WHERE id_demande = ?`,
      [id_demande]
    );
    if (lignes.length === 0) throw new Error('Cette demande ne contient aucune ligne');

    for (const ligne of lignes) {
      const [updateResult] = await conn.query(
        `UPDATE Consommable SET quantite_stock = quantite_stock - ? WHERE id_consommable = ? AND quantite_stock >= ?`,
        [ligne.quantite, ligne.id_consommable, ligne.quantite]
      );
      if (updateResult.affectedRows === 0) {
        throw new Error(`Stock insuffisant pour le consommable id ${ligne.id_consommable}`);
      }
      await conn.query(
        `INSERT INTO Mouvement (date_mouvement, type_mouvement, quantite, id_consommable, id_utilisateur, id_demande)
         VALUES (NOW(), 'remise_consommable', ?, ?, ?, ?)`,
        [ligne.quantite, ligne.id_consommable, id_utilisateur_admin, id_demande]
      );
    }

    await conn.query(`UPDATE Demande SET etat_demande = 'servie' WHERE id_demande = ?`, [id_demande]);
    await conn.commit();
    return getById(id_demande);
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

async function refuser(id_demande) {
  await pool.query(`UPDATE Demande SET etat_demande = 'refusee' WHERE id_demande = ?`, [id_demande]);
  return getById(id_demande);
}

module.exports = { getAll, getById, getStats, create, accorder, marquerRemis, refuser };