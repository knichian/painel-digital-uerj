// server/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

// Protege TODAS as rotas deste arquivo:
// 1. Usuário precisa estar logado (protect)
// 2. Usuário precisa ser admin (adminOnly)
router.use(protect, adminOnly);

// GET /api/admin/pending
router.get('/pending', adminController.getPendingUsers);

// PATCH /api/admin/approve/:id
router.patch('/approve/:id', adminController.approveUser);

// DELETE /api/admin/deny/:id
router.delete('/deny/:id', adminController.denyUser);

module.exports = router;