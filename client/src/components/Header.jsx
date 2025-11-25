// client/src/components/Header.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserShield } from 'react-icons/fa'; // Ícone de Admin
import './Header.css';
import LogoUerj from '../assets/logo-uerj.png';

function Header() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  // 1. LÊ O "CARGO" DO USUÁRIO SALVO NO LOGIN
  const userRole = localStorage.getItem('userRole');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole'); // Limpa o cargo ao sair
    navigate('/login');
  };

  return (
    <header className="main-header uerj-theme">
      <div className="header-content">
        <Link to="/" className="header-logo">
          <img src={LogoUerj} alt="Logo UERJ" className="uerj-logo-img" />
        </Link>
        
        <nav className="header-nav">
          {token ? (
            <>
              {/* 2. SÓ MOSTRA O LINK SE O USUÁRIO FOR ADMIN */}
              {userRole === 'admin' && (
                <Link to="/admin" className="nav-link admin-link">
                  <FaUserShield /> Aprovar Usuários
                </Link>
              )}
              
              <Link to="/contato" className="nav-link">Contato</Link>
              <button onClick={handleLogout} className="logout-btn">Sair</button>
            </>
          ) : (
            <Link to="/login" className="nav-link">Entrar</Link>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
