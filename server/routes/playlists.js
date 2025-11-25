// server/routes/playlists.js

const express = require('express');
const router = express.Router();
const playlistController = require('../controllers/playlistController');
const { protect } = require('../middleware/authMiddleware');

// ROTA PÚBLICA: O Pi acessará a playlist ativa para um monitor
// Não usamos 'protect' aqui pois o Pi não faz login
router.get('/display/:monitorIdentifier', playlistController.getDisplayPlaylist);

// Todas as rotas abaixo exigem autenticação
router.use(protect);

// GET /api/playlists - Listar todas as playlists
router.get('/', playlistController.getAllPlaylists);

// POST /api/playlists - Criar uma nova playlist
router.post('/', playlistController.createPlaylist);

// NOVA ROTA: GET /api/playlists/:id - Buscar detalhes de uma playlist
router.get('/:id', playlistController.getPlaylistById);

// NOVA ROTA: POST /api/playlists/:id/items - Adicionar mídia a uma playlist
router.post('/:id/items', playlistController.addMediaToPlaylist);

// NOVA ROTA: PATCH /api/playlists/:id/items/:itemId
// ATUALIZE ESTA LINHA:
// De 'playlistController.updatePlaylistItem' para 'playlistController.updatePlaylistItemSettings'
router.patch('/:id/items/:itemId', protect, playlistController.updatePlaylistItemSettings);

// --- VERIFIQUE SE ESTA LINHA ABAIXO ESTÁ PRESENTE ---
router.delete('/:id/items/:itemId', protect, playlistController.removeItemFromPlaylist);
// ----------------------------------------------------

// NOVA ROTA: Ativar uma playlist em um monitor
router.post('/:id/activate', playlistController.activatePlaylist);

// NOVA ROTA: Excluir uma playlist
router.delete('/:id', playlistController.deletePlaylist);

module.exports = router;