const express = require('express');
const router = express.Router();
const demandeController = require('../controllers/demandeController');
const { verifyToken, requireOperateur, requireRole } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/stats', requireRole('admin', 'operateur'), demandeController.getStats);
router.get('/', demandeController.getAll);
router.get('/:id', demandeController.getOne);

router.post('/', requireRole('admin', 'consultation', 'chef_structure'), demandeController.create);
router.patch('/:id/accorder', requireOperateur, demandeController.accorder);
router.patch('/:id/remettre', requireOperateur, demandeController.marquerRemis);
router.patch('/:id/refuser', requireOperateur, demandeController.refuser);

module.exports = router;