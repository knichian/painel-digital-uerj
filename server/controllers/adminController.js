// server/controllers/adminController.js
const db = require('../config/db');

// Lista todos os usuários pendentes
exports.getPendingUsers = async (req, res) => {
  try {
    const users = await db.query(
      "SELECT id, name, email FROM users WHERE is_approved = false ORDER BY created_at ASC"
    );
    res.status(200).json(users.rows);
  } catch (err) {
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};

// Aprova um usuário
exports.approveUser = async (req, res) => {
  const { id } = req.params; // ID do usuário a ser aprovado
  try {
    await db.query("UPDATE users SET is_approved = true WHERE id = $1", [id]);
    res.status(200).json({ message: 'Usuário aprovado com sucesso.' });
  } catch (err) {
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};

// Nega (exclui) um usuário
exports.denyUser = async (req, res) => {
  const { id } = req.params; // ID do usuário a ser negado
  try {
    await db.query("DELETE FROM users WHERE id = $1 AND is_approved = false", [id]);
    res.status(200).json({ message: 'Usuário negado e excluído com sucesso.' });
  } catch (err) {
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};