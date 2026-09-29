const pool = require('../config/db');

function buildFilters({ search = '', type = '', id_structure = '', date_debut = '', date_fin = '' }) {
  let where = ' WHERE 1 = 1';
  const params = [];

  if (search) {
    where += ` AND (
      CAST(m.id_mouvement AS CHAR) LIKE ? OR
      e.code_barre LIKE ? OR e.numero_serie LIKE ? OR e.designation LIKE ? OR
      c.reference LIKE ? OR c.designation LIKE ? OR
      d.nom_agent LIKE ? OR op.nom LIKE ? OR op.login LIKE ? OR s.nom_structure LIKE ?
    )`;
    const term = `%${search}%`;
    params.push(...Array(10).fill(term));
  }
  if (type) {
    where += ' AND m.type_mouvement = ?';
    params.push(type);
  }
  if (id_structure) {
    where += ' AND COALESCE(m.id_structure, d.id_structure, e.id_structure) = ?';
    params.push(id_structure);
  }
  if (date_debut) {
    where += ' AND m.date_mouvement >= ?';
    params.push(`${date_debut} 00:00:00`);
  }
  if (date_fin) {
    where += ' AND m.date_mouvement < DATE_ADD(?, INTERVAL 1 DAY)';
    params.push(date_fin);
  }

  return { where, params };
}

const movementJoins = `
  FROM Mouvement m
  LEFT JOIN Equipement e ON e.code_barre = m.code_barre
  LEFT JOIN Consommable c ON c.id_consommable = m.id_consommable
  LEFT JOIN Utilisateur op ON op.id_utilisateur = m.id_utilisateur
  LEFT JOIN Demande d ON d.id_demande = m.id_demande
  LEFT JOIN Structure s ON s.id_structure = COALESCE(m.id_structure, d.id_structure, e.id_structure)
`;

async function getAll({ search, type, id_structure, date_debut, date_fin, page = 1, limit = 10 } = {}) {
  const safePage = Math.max(1, Number.parseInt(page, 10) || 1);
  const safeLimit = Math.min(100, Math.max(1, Number.parseInt(limit, 10) || 10));
  const { where, params } = buildFilters({ search, type, id_structure, date_debut, date_fin });

  const [[summary]] = await pool.query(
    `SELECT COUNT(*) AS total,
            COALESCE(SUM(m.type_mouvement = 'remise_consommable'), 0) AS remises,
            COALESCE(SUM(m.type_mouvement = 'affectation'), 0) AS affectations,
            COALESCE(SUM(m.type_mouvement = 'changement_etat'), 0) AS changements
     ${movementJoins}${where}`,
    params
  );

  const [data] = await pool.query(
    `SELECT m.id_mouvement, m.date_mouvement, m.type_mouvement, m.quantite,
            m.code_barre, m.id_consommable, m.id_demande, m.details,
            COALESCE(e.designation, c.designation) AS designation,
            e.numero_serie, c.reference AS reference_consommable,
            d.nom_agent AS agent_beneficiaire,
            CONCAT('DPS-', YEAR(d.date_demande), '-', LPAD(d.id_demande, 3, '0')) AS reference_demande,
            op.nom AS operateur, op.login AS login_operateur,
            s.id_structure, s.nom_structure
     ${movementJoins}${where}
     ORDER BY m.date_mouvement DESC, m.id_mouvement DESC
     LIMIT ? OFFSET ?`,
    [...params, safeLimit, (safePage - 1) * safeLimit]
  );

  return {
    data,
    stats: {
      total: Number(summary.total),
      remises: Number(summary.remises),
      affectations: Number(summary.affectations),
      changements: Number(summary.changements),
    },
    page: safePage,
    limit: safeLimit,
  };
}

module.exports = { getAll };