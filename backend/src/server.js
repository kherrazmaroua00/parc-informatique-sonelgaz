const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const equipementRoutes = require('./routes/equipementRoutes');
const structureRoutes = require('./routes/structureRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/equipements', equipementRoutes);
app.use('/api/structures', structureRoutes);

// Simple test route
app.get('/', (req, res) => {
  res.json({ message: 'API Parc Informatique - Sonelgaz Distribution Saida' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});