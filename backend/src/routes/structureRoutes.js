const express = require('express');
const router = express.Router();
const structureController = require('../controllers/structureController');
const { verifyToken, requireAdmin, requireRole } = require('../middleware/authMiddleware');
const requireAppUser = requireRole('admin', 'consultation', 'chef_structure');

router.use(verifyToken);

router.get('/stats', requireAppUser, structureController.getStats);
router.get('/', requireAppUser, structureController.getAll);
router.get('/:id', requireAppUser, structureController.getOne);

router.post('/', requireAdmin, structureController.create);
router.put('/:id', requireAdmin, structureController.update);
router.delete('/:id', requireAdmin, structureController.remove);

module.exports = router;