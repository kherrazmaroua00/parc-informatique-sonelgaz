const bcrypt = require('bcrypt');
const pool = require('./config/db');

async function seed() {
  try {
    // 1. Insert a structure
    const [structResult] = await pool.query(
      `INSERT INTO Structure (nom_structure, chef_structure) VALUES (?, ?)`,
      ['DTE', 'Chef DTE']
    );
    const idStructure = structResult.insertId;
    console.log('✅ Structure created with id:', idStructure);

    // 2. Hash a password for the admin account
    const plainPassword = 'admin123'; // you will log in with this
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // 3. Insert the admin user
    const [userResult] = await pool.query(
      `INSERT INTO Utilisateur (nom, login, mot_de_passe, role, id_structure) VALUES (?, ?, ?, ?, ?)`,
      ['Admin Principal', 'admin', hashedPassword, 'admin', idStructure]
    );
    console.log('✅ Admin user created with id:', userResult.insertId);
    console.log('👉 Login with: login = admin | password = admin123');

  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
  } finally {
    process.exit();
  }
}

seed();