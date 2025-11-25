// src/components/Header.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css'; // Vamos criar este arquivo de estilo

function Header() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Remove o token do navegador
    localStorage.removeItem('token');
    // Redireciona para a página de login
    navigate('/login');
  };

  return (
    <header className="app-header">
      <div className="logo-container">
        {/* Adicione suas logos aqui */}
        <p className="logo-text">Logo UERJ</p>
        <p className="logo-text project-logo">Painel Digital</p>
      </div>
      <button onClick={handleLogout} className="logout-button">
        Sair
      </button>
    </header>
  );
}

export default Header;