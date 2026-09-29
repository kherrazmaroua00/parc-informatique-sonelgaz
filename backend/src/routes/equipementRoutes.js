const express = require('express');
const router = express.Router();
const equipementController = require('../controllers/equipementController');
const { verifyToken, requireAdmin, requireRole } = require('../middleware/authMiddleware');
const requireAppUser = requireRole('admin', 'consultation', 'chef_structure');

// All equipement routes require a valid token (must be logged in)
router.use(verifyToken);

// Both roles can read
router.get('/stats', requireAppUser, equipementController.getStats);
router.get('/', requireAppUser, equipementController.getAll);
router.get('/:code_barre', requireAppUser, equipementController.getOne);
router.post('/batch/validate', requireAdmin, equipementController.validateBatch);
router.post('/batch/import', requireAdmin, equipementController.importBatch);

// Only admin can create, update, delete
router.post('/', requireAdmin, equipementController.create);
router.put('/:code_barre', requireAdmin, equipementController.update);
router.delete('/:code_barre', requireAdmin, equipementController.remove);

module.exports = router;