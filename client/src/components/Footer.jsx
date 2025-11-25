// client/src/components/Footer.jsx

import React from 'react';
import './Footer.css'; // O CSS para o Footer será atualizado

function Footer() {
  return (
    <footer className="main-footer uerj-theme"> {/* Adiciona classe para o tema UERJ */}
      <div className="footer-content">
        <p>&copy; {new Date().getFullYear()} Painel UERJ. Todos os direitos reservados.</p>
        {/* Você pode adicionar links ou outras informações aqui se desejar */}
      </div>
    </footer>
  );
}

export default Footer;
