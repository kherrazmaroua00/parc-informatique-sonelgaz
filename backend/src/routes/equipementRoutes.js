const express = require('express');
const router = express.Router();
const equipementController = require('../controllers/equipementController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

// All equipement routes require a valid token (must be logged in)
router.use(verifyToken);

// Both roles can read
router.get('/stats', equipementController.getStats);
router.get('/', equipementController.getAll);
router.get('/:code_barre', equipementController.getOne);

// Only admin can create, update, delete
router.post('/', requireAdmin, equipementController.create);
router.put('/:code_barre', requireAdmin, equipementController.update);
router.delete('/:code_barre', requireAdmin, equipementController.remove);

module.exports = router;