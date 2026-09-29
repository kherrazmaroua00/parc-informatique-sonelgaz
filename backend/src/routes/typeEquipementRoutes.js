const express = require('express');
const router = express.Router();
const typeEquipementController = require('../controllers/typeEquipementController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const requireAppUser = requireRole('admin', 'consultation', 'chef_structure');

router.use(verifyToken);
router.get('/', requireAppUser, typeEquipementController.getAll);

module.exports = router;