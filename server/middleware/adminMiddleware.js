// server/middleware/adminMiddleware.js

// Este middleware deve rodar *DEPOIS* do middleware 'protect'
exports.adminOnly = (req, res, next) => {
  // O middleware 'protect' já colocou 'req.user' com { id, role }
  if (req.user && req.user.role === 'admin') {
    next(); // Usuário é admin, pode passar.
  } else {
    res.status(403).json({ message: 'Acesso negado. Requer privilégios de administrador.' });
  }
};