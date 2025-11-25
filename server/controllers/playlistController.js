// server/controllers/playlistController.js

const db = require('../config/db');

// Listar todas as playlists
exports.getAllPlaylists = async (req, res) => {
  try {
    const playlists = await db.query('SELECT * FROM playlists ORDER BY name ASC');
    res.status(200).json(playlists.rows);
  } catch (error) {
    console.error('Erro ao buscar playlists:', error);
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};

// Criar uma nova playlist
exports.createPlaylist = async (req, res) => {
  const { name } = req.body;
  const createdBy = req.user.id; // Vem do middleware 'protect'

  if (!name) {
    return res.status(400).json({ message: 'O nome da playlist é obrigatório.' });
  }

  try {
    const newPlaylist = await db.query(
      'INSERT INTO playlists (name, created_by) VALUES ($1, $2) RETURNING *',
      [name, createdBy]
    );
    res.status(201).json(newPlaylist.rows[0]);
  } catch (error) {
    console.error('Erro ao criar playlist:', error);
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};

// NOVA FUNÇÃO: Buscar uma playlist e seus itens
exports.getPlaylistById = async (req, res) => {
  const { id } = req.params; // Pega o ID da playlist da URL

  try {
    // 1. Busca os dados da playlist (o nome)
    const playlistRes = await db.query('SELECT * FROM playlists WHERE id = $1', [id]);
    if (playlistRes.rows.length === 0) {
      return res.status(404).json({ message: 'Playlist não encontrada.' });
    }

    // 2. Busca os itens da playlist (as mídias)
    // Usamos um JOIN para pegar as informações das mídias (como o file_path)
    // --- QUERY CORRIGIDA: agora inclui pi.start_at e pi.end_at ---
    const itemsRes = await db.query(
      `SELECT 
         pi.id, 
         pi.position,
         pi.duration_seconds AS item_duration,
         pi.start_at,
         pi.end_at,
         mi.id AS media_item_id,
         mi.file_path,
         mi.title,
         mi.type,
         mi.duration_seconds AS media_duration
       FROM playlist_items pi
       JOIN media_items mi ON pi.media_item_id = mi.id
       WHERE pi.playlist_id = $1
       ORDER BY pi.position ASC`,
      [id]
    );

    // 3. Monta a resposta final
    const playlist = playlistRes.rows[0];
    playlist.items = itemsRes.rows; // Anexa os itens à playlist

    res.status(200).json(playlist);

  } catch (error) {
    console.error('Erro ao buscar detalhes da playlist:', error);
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};

// NOVA FUNÇÃO: Adicionar uma mídia a uma playlist
exports.addMediaToPlaylist = async (req, res) => {
  const { id } = req.params; // ID da Playlist
  // NOVO: Agora recebemos também 'duration' do corpo da requisição
  const { media_item_id, duration } = req.body;

  if (!media_item_id) {
    return res.status(400).json({ message: 'ID da mídia é obrigatório.' });
  }

  try {
    // 1. Verifica duplicatas (igual a antes)
    const exists = await db.query(
      'SELECT * FROM playlist_items WHERE playlist_id = $1 AND media_item_id = $2',
      [id, media_item_id]
    );
    if (exists.rows.length > 0) {
      return res.status(400).json({ message: 'Esta mídia já está na playlist.' });
    }

    // 2. Descobre a próxima posição (igual a antes)
    const positionRes = await db.query(
      'SELECT MAX(position) as max_pos FROM playlist_items WHERE playlist_id = $1',
      [id]
    );
    const newPosition = (positionRes.rows[0].max_pos === null) ? 0 : positionRes.rows[0].max_pos + 1;

    // 3. Insere o novo item COM A DURAÇÃO CUSTOMIZADA
    // Se o usuário não mandou duração, usamos NULL (o banco usará o padrão da mídia ou 10s)
    const durationValue = duration ? parseInt(duration) : null;

    const newItem = await db.query(
      'INSERT INTO playlist_items (playlist_id, media_item_id, position, duration_seconds) VALUES ($1, $2, $3, $4) RETURNING *',
      [id, media_item_id, newPosition, durationValue]
    );

    res.status(201).json(newItem.rows[0]);
  } catch (error) {
    console.error('Erro ao adicionar mídia à playlist:', error);
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};

// FUNÇÃO: Excluir uma playlist
exports.deletePlaylist = async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Desvincula a playlist de qualquer monitor
    await db.query('DELETE FROM monitor_playlists WHERE playlist_id = $1', [id]);

    // 2. Exclui a playlist
    // Graças ao "ON DELETE CASCADE", todos os 'playlist_items' serão excluídos.
    await db.query('DELETE FROM playlists WHERE id = $1', [id]);

    res.status(200).json({ message: 'Playlist excluída com sucesso.' });
  } catch (error) {
    console.error('Erro ao excluir playlist:', error);
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};

// FUNÇÃO PARA ATIVAR UMA PLAYLIST EM UM MONITOR
exports.activatePlaylist = async (req, res) => {
  const { id } = req.params; // ID da Playlist
  const { monitor_id } = req.body; // ID do Monitor (ex: 1)

  try {
    // 1. Desativa qualquer outra playlist ativa nesse monitor
    await db.query(
      'UPDATE monitor_playlists SET active = false WHERE monitor_id = $1',
      [monitor_id]
    );

    // 2. Ativa a nova playlist para este monitor
    await db.query(
      'INSERT INTO monitor_playlists (monitor_id, playlist_id, active) VALUES ($1, $2, true)',
      [monitor_id, id]
    );

    res.status(200).json({ message: 'Playlist ativada com sucesso!' });
  } catch (error) {
    console.error('Erro ao ativar playlist:', error);
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};

// FUNÇÃO PÚBLICA QUE O RASPBERRY PI USARÁ
exports.getDisplayPlaylist = async (req, res) => {
  const { monitorIdentifier } = req.params;

  try {
    const monitorRes = await db.query('SELECT id FROM monitors WHERE identifier = $1', [monitorIdentifier]);
    if (monitorRes.rows.length === 0) {
      return res.status(404).json({ message: 'Monitor não encontrado.' });
    }
    const monitorId = monitorRes.rows[0].id;

    const activePlaylistRes = await db.query(
      'SELECT playlist_id FROM monitor_playlists WHERE monitor_id = $1 AND active = true',
      [monitorId]
    );
    if (activePlaylistRes.rows.length === 0) {
      return res.status(200).json([]);
    }
    const playlistId = activePlaylistRes.rows[0].playlist_id;

    // --- SQL ATUALIZADO ---
    // Adicionamos a lógica de filtro de data e hora (NOW())
    const itemsRes = await db.query(
      `SELECT
         mi.file_path,
         mi.type,
         COALESCE(pi.duration_seconds, mi.duration_seconds) AS duration_seconds,
         mi.text_content,
         mi.text_overlay_position
       FROM playlist_items pi
       JOIN media_items mi ON pi.media_item_id = mi.id
       WHERE pi.playlist_id = $1
         AND (pi.start_at IS NULL OR pi.start_at <= NOW()) -- Só mostra se a data de início passou
         AND (pi.end_at IS NULL OR pi.end_at >= NOW())     -- Só mostra se a data de fim ainda não chegou
       ORDER BY pi.position ASC`,
      [playlistId]
    );
    // --- FIM DA ATUALIZAÇÃO ---

    res.status(200).json(itemsRes.rows);
  } catch (error) {
    console.error('Erro ao buscar playlist do display:', error);
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};

// NOVA FUNÇÃO: Remover um item (relação) da playlist
exports.removeItemFromPlaylist = async (req, res) => {
  const { id, itemId } = req.params; // id = playlist_id, itemId = id em playlist_items

  try {
    // Tenta deletar o item garantindo que pertence à playlist
    const delRes = await db.query(
      'DELETE FROM playlist_items WHERE id = $1 AND playlist_id = $2 RETURNING *',
      [itemId, id]
    );

    if (delRes.rows.length === 0) {
      return res.status(404).json({ message: 'Item da playlist não encontrado.' });
    }

    res.status(200).json({ message: 'Item removido com sucesso.' });
  } catch (error) {
    console.error('Erro ao remover item da playlist:', error);
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};

// Renomeamos para 'updatePlaylistItemSettings' para ficar mais claro
exports.updatePlaylistItemSettings = async (req, res) => {
  const { id, itemId } = req.params;
  const { duration_seconds, start_at, end_at } = req.body;

  try {
    // Primeiro, buscamos os valores atuais
    const currentRes = await db.query('SELECT * FROM playlist_items WHERE id = $1 AND playlist_id = $2', [itemId, id]);
    if (currentRes.rows.length === 0) {
      return res.status(404).json({ message: 'Item não encontrado.' });
    }

    const current = currentRes.rows[0];

    // Atualizamos os valores: usa o novo valor se ele foi enviado, senão, mantém o antigo
    const newDuration = duration_seconds || current.duration_seconds;
    const newStartAt = start_at || current.start_at;
    const newEndAt = end_at || current.end_at;

    const result = await db.query(
      `UPDATE playlist_items 
       SET duration_seconds = $1, start_at = $2, end_at = $3 
       WHERE id = $4 
       RETURNING *`,
      [newDuration, newStartAt, newEndAt, itemId]
    );

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar item:', error);
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};