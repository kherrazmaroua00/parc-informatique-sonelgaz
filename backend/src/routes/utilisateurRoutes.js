const express = require('express');
const router = express.Router();
const utilisateurController = require('../controllers/utilisateurController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

router.use(verifyToken);
router.get('/stats', utilisateurController.getStats);
router.get('/', utilisateurController.getAll);
router.post('/', requireAdmin, utilisateurController.create);
router.post('/:id/invitation', requireAdmin, utilisateurController.sendInvitation);
router.put('/:id', requireAdmin, utilisateurController.update);
router.delete('/:id', requireAdmin, utilisateurController.remove);

module.exports = router;