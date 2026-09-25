const bcrypt = require('bcrypt');
const pool = require('./config/db');

const structures = [
  { name: 'DSI', chef: 'Karim Benali', chefLogin: 'k.benali' },
  { name: 'DTE', chef: 'Kaddour Bouziane', chefLogin: 'k.bouziane' },
  { name: 'DRC', chef: 'Mohamed Brahimi', chefLogin: 'm.brahimi' },
  { name: 'DAG', chef: 'Nadia Benaissa', chefLogin: 'n.benaissa' },
  { name: 'DRH', chef: 'Youcef Belhadj', chefLogin: 'y.belhadj' },
  { name: 'DFC', chef: 'Fatima Zohra Mansouri', chefLogin: 'fz.mansouri' },
];

const users = [
  { nom: 'Admin Principal', login: 'admin', role: 'admin', structure: 'DSI', password: 'admin123' },
  { nom: 'Karim Benali', login: 'k.benali', role: 'consultation', structure: 'DSI', type: 'chef' },
  { nom: 'Kaddour Bouziane', login: 'k.bouziane', role: 'consultation', structure: 'DTE', type: 'chef' },
  { nom: 'Mohamed Brahimi', login: 'm.brahimi', role: 'consultation', structure: 'DRC', type: 'chef' },
  { nom: 'Abdelkader Mansour', login: 'a.mansour', role: 'consultation', structure: 'DTE' },
  { nom: 'Rachid Benali', login: 'r.benali', role: 'consultation', structure: 'DRC' },
  { nom: 'Fatima Zohra Mansouri', login: 'fz.mansouri', role: 'consultation', structure: 'DFC', type: 'chef' },
  { nom: 'Youcef Belhadj', login: 'y.belhadj', role: 'consultation', structure: 'DRH', type: 'chef' },
  { nom: 'Mustapha Larbi', login: 'm.larbi', role: 'consultation', structure: 'DSI' },
  { nom: 'Nadia Benaissa', login: 'n.benaissa', role: 'consultation', structure: 'DAG', type: 'chef' },
  { nom: 'Samir Haddad', login: 's.haddad', role: 'consultation', structure: 'DAG' },
  { nom: 'Amina Saidi', login: 'a.saidi', role: 'consultation', structure: 'DRH' },
];

const dsiEquipements = [
  { code: 'SNL-DSI-PC-0001', serie: 'HP-PRO-DSI-001', designation: 'PC bureau DSI', marque: 'HP', reference: 'ProDesk 400 G9', annee: 2024, etat: 'actif', type: 'PC' },
  { code: 'SNL-DSI-IMP-0001', serie: 'HP-IMP-DSI-001', designation: 'Imprimante réseau DSI', marque: 'HP', reference: 'LaserJet Pro M404', annee: 2023, etat: 'actif', type: 'Imprimante' },
  { code: 'SNL-DSI-OND-0001', serie: 'APC-DSI-001', designation: 'Onduleur baie réseau', marque: 'APC', reference: 'Smart-UPS 1000VA', annee: 2022, etat: 'actif', type: 'Onduleur' },
  { code: 'SNL-DSI-SRV-0001', serie: 'DELL-DSI-001', designation: 'Serveur applicatif', marque: 'Dell', reference: 'PowerEdge T150', annee: 2024, etat: 'actif', type: 'Serveur' },
  { code: 'SNL-DSI-SWT-0001', serie: 'CISCO-DSI-001', designation: 'Switch réseau principal', marque: 'Cisco', reference: 'CBS350-24T', annee: 2023, etat: 'en_panne', type: 'Switch' },
  { code: 'SNL-DSI-SCN-0001', serie: 'CANON-DSI-001', designation: 'Scanner documents DSI', marque: 'Canon', reference: 'ScanFront 400', annee: 2021, etat: 'defectueux', type: 'Scanner' },
];

async function getOrCreateStructure(name, chef) {
  const [rows] = await pool.query('SELECT id_structure FROM Structure WHERE nom_structure = ?', [name]);
  if (rows[0]) {
    await pool.query('UPDATE Structure SET chef_structure = ? WHERE id_structure = ?', [chef, rows[0].id_structure]);
    return rows[0].id_structure;
  }
  const [result] = await pool.query(
    'INSERT INTO Structure (nom_structure, chef_structure) VALUES (?, ?)',
    [name, chef]
  );
  return result.insertId;
}

async function ensureEveryStructureHasChef() {
  const [rows] = await pool.query(
    `SELECT id_structure, nom_structure
     FROM Structure
     WHERE chef_structure IS NULL OR TRIM(chef_structure) = ''`
  );

  for (const structure of rows) {
    await pool.query(
      'UPDATE Structure SET chef_structure = ? WHERE id_structure = ?',
      [`Chef ${structure.nom_structure}`, structure.id_structure]
    );
  }
}

async function seedDsiEquipements(idStructure) {
  for (const equipment of dsiEquipements) {
    const [existing] = await pool.query(
      'SELECT code_barre FROM Equipement WHERE code_barre = ?',
      [equipment.code]
    );
    if (existing[0]) continue;

    const [types] = await pool.query(
      'SELECT id_type FROM TypeEquipement WHERE nom_type = ?',
      [equipment.type]
    );
    if (!types[0]) continue;

    await pool.query(
      `INSERT INTO Equipement
       (code_barre, numero_serie, designation, marque, reference,
        annee_mise_en_service, etat, id_type, id_structure)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [equipment.code, equipment.serie, equipment.designation, equipment.marque,
        equipment.reference, equipment.annee, equipment.etat, types[0].id_type, idStructure]
    );
    console.log(`Equipement cree: ${equipment.code}`);
  }
}

async function seed() {
  try {
    const structureIds = {};
    for (const structure of structures) {
      structureIds[structure.name] = await getOrCreateStructure(structure.name, structure.chef);
    }

    for (const user of users) {
      const [existing] = await pool.query('SELECT id_utilisateur FROM Utilisateur WHERE login = ?', [user.login]);
      if (existing[0]) continue;
      const password = await bcrypt.hash(user.password || 'sonelgaz123', 10);
      await pool.query(
        `INSERT INTO Utilisateur (nom, login, mot_de_passe, role, id_structure)
         VALUES (?, ?, ?, ?, ?)`,
        [user.nom, user.login, password, user.role, structureIds[user.structure]]
      );
      console.log(`Utilisateur cree: ${user.login}`);
    }
    await ensureEveryStructureHasChef();
    await seedDsiEquipements(structureIds.DSI);
    console.log('Seed utilisateurs termine. Mot de passe admin: admin123');
  } catch (error) {
    console.error('Seed echoue:', error.message);
  } finally {
    await pool.end();
  }
}

seed();
