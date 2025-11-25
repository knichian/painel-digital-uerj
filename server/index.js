// server/index.js

// 1. Importa o framework Express
const express = require('express');
const cors = require('cors'); // Importe o cors
const path = require('path'); // Importe o módulo 'path' do Node

// Importa nossas novas rotas de autenticação
const authRoutes = require('./routes/auth');
const mediaRoutes = require('./routes/media'); // 1. IMPORTE AS NOVAS ROTAS
const playlistRoutes = require('./routes/playlists'); // 1. IMPORTE A ROTA
const monitorRoutes = require('./routes/monitorRoutes'); // 1. IMPORTE A ROTA
const adminRoutes = require('./routes/adminRoutes'); // 1. IMPORTE A ROTA DE ADMIN

// 2. Cria uma instância do Express
const app = express();

// 3. Define a porta em que o servidor vai rodar
const PORT = 3001; // Usamos 3001 para não conflitar com o React (que usa 3000)

// --- Middlewares ---
// Habilita o CORS para permitir requisições do frontend
app.use(cors());
// Habilita o Express para entender requisições com corpo em formato JSON
app.use(express.json());

// 2. NOVO: SERVINDO ARQUIVOS ESTÁTICOS
// Isso torna a pasta 'public' acessível. Se você salvar uma imagem como
// 'public/uploads/imagem.webp', ela estará disponível em http://localhost:3001/uploads/imagem.webp
app.use(express.static(path.join(__dirname, 'public')));

// --- Rotas ---
app.get('/', (req, res) => {
  res.json({ message: 'API do Painel UERJ está no ar!' });
});

// Diz ao Express para usar nossas rotas de autenticação
// Todas as rotas definidas em 'auth.js' terão o prefixo '/api/auth'
app.use('/api/auth', authRoutes);
app.use('/api/media', mediaRoutes); // 3. USE AS NOVAS ROTAS
app.use('/api/playlists', playlistRoutes); // 2. USE A NOVA ROTA
app.use('/api/monitors', monitorRoutes); // 2. USE A NOVA ROTA
app.use('/api/admin', adminRoutes); // 2. USE A ROTA DE ADMIN

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});