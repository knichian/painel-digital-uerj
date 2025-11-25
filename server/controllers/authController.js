// server/controllers/authController.js

const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // Importe a biblioteca jsonwebtoken

exports.register = async (req, res) => {
  // 1. Pega os dados do corpo (body) da requisição
  const { name, email, password } = req.body;

  // 2. Validação simples para ver se todos os campos foram enviados
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Por favor, preencha todos os campos.' });
  }

  try {
    // 3. Verifica se o usuário já existe no banco de dados
    const userExists = await db.query('SELECT * FROM users WHERE email = $1', [email]);

    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'Este email já está em uso.' });
    }

    // 4. CRIPTOGRAFA A SENHA (Passo de segurança CRUCIAL)
    // O número 10 é o "custo" da criptografia, um valor padrão e seguro.
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 5. Insere o novo usuário no banco com a senha já criptografada
    const newUser = await db.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, email',
      [name, email, passwordHash]
    );

    // 6. Envia uma resposta de sucesso
    res.status(201).json({
      message: 'Usuário criado com sucesso!',
      userId: newUser.rows[0].id,
    });

  } catch (err) {
    console.error('Erro no registro:', err);
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};

// NOVA FUNÇÃO DE LOGIN
exports.login = async (req, res) => {
  // 1. Pega email e senha do corpo da requisição
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Por favor, forneça email e senha.' });
  }

  try {
    // 2. Procura o usuário no banco de dados pelo email
    const user = await db.query('SELECT * FROM users WHERE email = $1', [email]);

    // Se não encontrar nenhum usuário (array de rows vazio), a senha está errada.
    if (user.rows.length === 0) {
      return res.status(401).json({ message: 'Email ou senha inválidos.' }); // 401 = Não autorizado
    }

    // 3. Compara a senha enviada com a senha criptografada no banco
    // bcrypt.compare faz a mágica de forma segura
    const isPasswordCorrect = await bcrypt.compare(password, user.rows[0].password_hash);

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Email ou senha inválidos.' });
    }

    // --- NOVA VERIFICAÇÃO CORRETA ---
    // Esta verificação bloqueia tanto 'false' quanto 'null' (ou ausência da flag)
    if (user.rows[0].is_approved !== true) {
      return res.status(401).json({ 
        message: 'Sua conta foi registrada, mas ainda está aguardando aprovação de um administrador.' 
      });
    }
    // --- FIM DA VERIFICAÇÃO ---

    // 4. Se tudo deu certo, GERE O TOKEN JWT
    // O token contém o ID do usuário (payload) para sabermos quem ele é
    const token = jwt.sign(
      { id: user.rows[0].id, role: user.rows[0].role },
      process.env.JWT_SECRET, // Usa o segredo do .env
      { expiresIn: '8h' } // Define um tempo de expiração
    );

    // 5. Envia o token de volta para o cliente, incluindo a role do usuário
    res.status(200).json({ token, role: user.rows[0].role });

  } catch (err) {
    console.error('Erro no login:', err);
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};

// NOVA FUNÇÃO PROTEGIDA
exports.getMe = async (req, res) => {
  // Graças ao middleware, já temos o 'req.user' com os dados do token (id, role).
  // Podemos usar o ID para buscar o usuário completo no banco.
  try {
    const user = await db.query('SELECT id, name, email, role FROM users WHERE id = $1', [req.user.id]);

    if (user.rows.length > 0) {
      res.status(200).json(user.rows[0]);
    } else {
      res.status(404).json({ message: 'Usuário não encontrado.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};