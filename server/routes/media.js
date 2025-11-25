// server/routes/media.js

const express = require('express');
const router = express.Router();
const multer = require('multer');
const mediaController = require('../controllers/mediaController');
const { protect } = require('../middleware/authMiddleware');

// Configuração do Multer:
// Vamos usar 'memoryStorage' para que o arquivo seja mantido na memória
// antes de ser processado pelo 'sharp'. Isso é mais eficiente.
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// A rota de upload: POST /api/media/upload
// 1. 'protect': Garante que o usuário está logado.
// 2. 'upload.single('image')': Processa um único arquivo que virá no campo 'image'.
// 3. 'mediaController.uploadMedia': Nossa função que redimensiona e salva (agora suporta vídeo).
router.post('/upload', protect, upload.single('image'), mediaController.uploadMedia);


// NOVA ROTA PARA LISTAR TODAS AS MÍDIAS
// Ela também usa o middleware 'protect' para garantir que apenas usuários logados possam acessá-la.
router.get('/', protect, mediaController.getAllMedia);

// NOVA ROTA: Excluir uma mídia
router.delete('/:id', protect, mediaController.deleteMediaItem);

module.exports = router;