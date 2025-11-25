// server/routes/auth.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware'); // 1. IMPORTE O MIDDLEWARE

// Define que uma requisição POST para /register vai chamar a função 'register'
router.post('/register', authController.register);

// NOVA ROTA DE LOGIN
router.post('/login', authController.login);

// 2. ADICIONE A ROTA PROTEGIDA
// A requisição primeiro passa pelo 'protect'. Se ele autorizar (chamar next()),
// então a requisição chega no 'authController.getMe'.
router.get('/me', protect, authController.getMe);

module.exports = router;