// server/controllers/mediaController.js

const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs').promises; // <-- use promises API
const db = require('../config/db');

// Cria o diretório de uploads se ele não existir (usando API de promises)
const uploadDir = path.join(__dirname, '..', 'public', 'uploads');
fs.mkdir(uploadDir, { recursive: true }).catch(err => {
  console.error('Erro ao garantir diretório de uploads:', err);
});

// Renomeie a função para "uploadMedia" para fazer mais sentido
exports.uploadMedia = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Nenhum arquivo enviado.' });
  }

  const uploaderId = req.user.id;
  const file = req.file;
  const { text_content, text_overlay_position } = req.body;

  let fileExtension = '.webp'; // Padrão para imagens
  let mediaType = 'image';

  // --- LÓGICA DE VÍDEO vs IMAGEM ---
  if (file.mimetype.startsWith('video/')) {
    mediaType = 'video';
    fileExtension = path.extname(file.originalname); // Pega a extensão original (ex: .mp4)
  }

  const fileName = `${uuidv4()}${fileExtension}`;
  const filePath = path.join(__dirname, '..', 'public', 'uploads', fileName);

  try {
    if (mediaType === 'image') {
      // Se for IMAGEM, processa com sharp
      await sharp(file.buffer)
        .resize({ width: 2560, withoutEnlargement: true })
        .toFormat('webp', { quality: 90 })
        .toFile(filePath);
    } else {
      // Se for VÍDEO, apenas salva o arquivo original
      await fs.writeFile(filePath, file.buffer);
    }

    const relativePath = `/uploads/${fileName}`;
    const title = req.body.title || file.originalname; // Pega o título ou usa o nome do arquivo

    const insertQuery = `
      INSERT INTO media_items 
      (uploader_id, file_path, type, title, text_content, text_overlay_position) 
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const newItem = await db.query(insertQuery, [
      uploaderId, 
      relativePath, 
      mediaType, // Salva o tipo correto ('image' ou 'video')
      title,
      text_content || null,
      text_overlay_position || 'bottom'
    ]);

    res.status(201).json({
      message: 'Arquivo enviado e processado com sucesso!',
      media: newItem.rows[0]
    });

  } catch (error) {
    console.error("Erro ao processar o upload:", error);
    res.status(500).json({ message: 'Erro no servidor ao processar o arquivo.' });
  }
};

// NOVA FUNÇÃO PARA BUSCAR TODAS AS MÍDIAS
exports.getAllMedia = async (req, res) => {
  try {
    // 1. Executa uma query no banco para selecionar todos os itens da tabela 'media_items'
    // Ordenamos por 'created_at DESC' para que as imagens mais novas apareçam primeiro.
    const allMedia = await db.query('SELECT * FROM media_items ORDER BY created_at DESC');

    // 2. Envia a lista de mídias (que está em 'allMedia.rows') como resposta
    res.status(200).json(allMedia.rows);

  } catch (error) {
    console.error("Erro ao buscar mídias:", error);
    res.status(500).json({ message: 'Erro no servidor ao buscar as mídias.' });
  }
};

// Função para deletar um item de mídia (arquivo + registro DB)
exports.deleteMediaItem = async (req, res) => {
  const { id } = req.params;
  const uploaderId = req.user.id; // Futuramente podemos validar permissões

  try {
    // 1. Encontra o item no banco para pegar o caminho do arquivo
    const mediaRes = await db.query('SELECT file_path FROM media_items WHERE id = $1', [id]);
    if (mediaRes.rows.length === 0) {
      return res.status(404).json({ message: 'Mídia não encontrada.' });
    }
    const filePath = mediaRes.rows[0].file_path; // Ex: /uploads/arquivo.webp

    // 2. Deleta o item do banco de dados
    // Graças ao ON DELETE CASCADE, ele será removido de todas as playlists.
    await db.query('DELETE FROM media_items WHERE id = $1', [id]);

    // 3. Deleta o arquivo físico do servidor
    // O file_path no DB é relativo com leading slash; remova antes de usar path.join
    const relative = filePath.replace(/^\//, '');
    const fullPath = path.join(__dirname, '..', 'public', relative);
    try {
      await fs.unlink(fullPath);
    } catch (err) {
      console.error('Erro ao deletar arquivo físico:', err);
    }

    res.status(200).json({ message: 'Mídia excluída com sucesso.' });
  } catch (error) {
    console.error('Erro ao excluir mídia:', error);
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};