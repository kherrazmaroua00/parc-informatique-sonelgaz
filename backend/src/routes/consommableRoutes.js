const express = require('express');
const router = express.Router();
const consommableController = require('../controllers/consommableController');
const { verifyToken, requireAdmin, requireRole } = require('../middleware/authMiddleware');
const requireAppUser = requireRole('admin', 'consultation', 'chef_structure');

router.use(verifyToken);

router.get('/stats', requireAppUser, consommableController.getStats);
router.post('/batch/validate', requireAdmin, consommableController.validateBatch);
router.post('/batch/import', requireAdmin, consommableController.importBatch);
router.get('/', requireAppUser, consommableController.getAll);
router.get('/:id', requireAppUser, consommableController.getOne);

router.post('/', requireAdmin, consommableController.create);
router.put('/:id', requireAdmin, consommableController.update);
router.delete('/:id', requireAdmin, consommableController.remove);

module.exports = router;