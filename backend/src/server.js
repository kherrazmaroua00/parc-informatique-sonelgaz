const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const equipementRoutes = require('./routes/equipementRoutes');
const structureRoutes = require('./routes/structureRoutes');
const consommableRoutes = require('./routes/consommableRoutes');
const typeEquipementRoutes = require('./routes/typeEquipementRoutes');
const utilisateurRoutes = require('./routes/utilisateurRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/equipements', equipementRoutes);
app.use('/api/structures', structureRoutes);
app.use('/api/consommables', consommableRoutes);
app.use('/api/types', typeEquipementRoutes);
app.use('/api/utilisateurs', utilisateurRoutes);

// Simple test route
app.get('/', (req, res) => {
  res.json({ message: 'API Parc Informatique - Sonelgaz Distribution Saida' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});