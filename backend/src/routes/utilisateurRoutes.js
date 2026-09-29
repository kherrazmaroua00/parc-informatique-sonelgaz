const express = require('express');
const router = express.Router();
const utilisateurController = require('../controllers/utilisateurController');
const { verifyToken, requireAdmin, requireRole } = require('../middleware/authMiddleware');
const requireAppUser = requireRole('admin', 'consultation', 'chef_structure');

router.use(verifyToken);
router.get('/stats', requireAppUser, utilisateurController.getStats);
router.get('/', requireAppUser, utilisateurController.getAll);
router.post('/', requireAdmin, utilisateurController.create);
router.post('/:id/invitation', requireAdmin, utilisateurController.sendInvitation);
router.put('/:id', requireAdmin, utilisateurController.update);
router.delete('/:id', requireAdmin, utilisateurController.remove);

module.exports = router;