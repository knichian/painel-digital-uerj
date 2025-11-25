// server/routes/monitorRoutes.js
const express = require('express');
const router = express.Router();
const monitorController = require('../controllers/monitorController');
const { protect } = require('../middleware/authMiddleware'); // Rota protegida

// GET /api/monitors/:monitorIdentifier/active
router.get('/:monitorIdentifier/active', protect, monitorController.getActivePlaylist);

module.exports = router;