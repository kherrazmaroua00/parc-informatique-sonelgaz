const express = require('express');
const router = express.Router();
const historiqueController = require('../controllers/historiqueController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

router.use(verifyToken, requireAdmin);
router.get('/', historiqueController.getAll);

module.exports = router;