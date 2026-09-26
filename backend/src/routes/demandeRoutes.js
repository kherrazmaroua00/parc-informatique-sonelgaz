const express = require('express');
const router = express.Router();
const demandeController = require('../controllers/demandeController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/stats', requireAdmin, demandeController.getStats);
router.get('/', demandeController.getAll);
router.get('/:id', demandeController.getOne);

router.post('/', demandeController.create);
router.patch('/:id/accorder', requireAdmin, demandeController.accorder);
router.patch('/:id/remettre', requireAdmin, demandeController.marquerRemis);
router.patch('/:id/refuser', requireAdmin, demandeController.refuser);

module.exports = router;