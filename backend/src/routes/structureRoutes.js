const express = require('express');
const router = express.Router();
const structureController = require('../controllers/structureController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

// Must be logged in for all structure routes
router.use(verifyToken);

// Both roles can read
router.get('/', structureController.getAll);
router.get('/:id', structureController.getOne);

// Only admin can create, update, delete
router.post('/', requireAdmin, structureController.create);
router.put('/:id', requireAdmin, structureController.update);
router.delete('/:id', requireAdmin, structureController.remove);

module.exports = router;