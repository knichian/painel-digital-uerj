// server/controllers/monitorController.js
const db = require('../config/db');

exports.getActivePlaylist = async (req, res) => {
  const { monitorIdentifier } = req.params;
  try {
    // Busca a playlist ativa mais recente para este monitor
    const activePlaylistRes = await db.query(
      `SELECT mp.playlist_id
       FROM monitor_playlists mp
       JOIN monitors m ON mp.monitor_id = m.id
       WHERE m.identifier = $1 AND mp.active = true
       ORDER BY mp.created_at DESC LIMIT 1`,
      [monitorIdentifier]
    );

    if (activePlaylistRes.rows.length === 0) {
      // Se não houver nenhuma ativa, retorna null
      return res.status(200).json({ activePlaylistId: null });
    }

    res.status(200).json({ activePlaylistId: activePlaylistRes.rows[0].playlist_id });
  } catch (error) {
    console.error('Erro ao buscar playlist ativa:', error);
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};