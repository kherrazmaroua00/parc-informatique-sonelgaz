const express = require('express');
const router = express.Router();
const typeEquipementController = require('../controllers/typeEquipementController');
const { verifyToken } = require('../middleware/authMiddleware');

router.use(verifyToken);
router.get('/', typeEquipementController.getAll);

module.exports = router;