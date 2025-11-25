// server/middleware/authMiddleware.js

const jwt = require('jsonwebtoken');

exports.protect = (req, res, next) => {
  let token;

  // 1. O segurança verifica se o crachá (token) foi enviado no cabeçalho (header)
  // O padrão é enviar no formato: "Authorization: Bearer <token>"
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 2. Ele pega apenas a string do token, ignorando a palavra "Bearer "
      token = req.headers.authorization.split(' ')[1];

      // 3. Ele verifica se o crachá é autêntico e não expirou
      // Para isso, usa o mesmo segredo (JWT_SECRET) que usamos para criar o token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 4. Se o crachá for válido, ele anexa as informações do usuário
      // na requisição (req.user) para que a próxima função saiba quem está acessando.
      req.user = decoded;

      // 5. "Pode passar!". Ele libera o acesso para a próxima função na fila.
      next();

    } catch (error) {
      // Se o crachá for inválido/expirado, ele barra a entrada
      res.status(401).json({ message: 'Token inválido, acesso não autorizado.' });
    }
  }

  // Se não enviaram nenhum crachá, ele também barra a entrada
  if (!token) {
    res.status(401).json({ message: 'Nenhum token, acesso não autorizado.' });
  }
};