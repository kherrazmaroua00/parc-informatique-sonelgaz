const express = require('express');
const router = express.Router();
const consommableController = require('../controllers/consommableController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/', consommableController.getAll);
router.get('/:id', consommableController.getOne);

router.post('/', requireAdmin, consommableController.create);
router.put('/:id', requireAdmin, consommableController.update);
router.delete('/:id', requireAdmin, consommableController.remove);

module.exports = router;