const express = require('express');
const router = express.Router();
const structureController = require('../controllers/structureController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/stats', structureController.getStats);
router.get('/', structureController.getAll);
router.get('/:id', structureController.getOne);

router.post('/', requireAdmin, structureController.create);
router.put('/:id', requireAdmin, structureController.update);
router.delete('/:id', requireAdmin, structureController.remove);

module.exports = router;