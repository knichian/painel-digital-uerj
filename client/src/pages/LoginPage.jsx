// client/src/pages/LoginPage.jsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../lib/axiosClient';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // IMPORTAR ÍCONES
import './LoginPage.css';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // NOVO ESTADO: para controlar a visibilidade da senha
  const [showPassword, setShowPassword] = useState(false);

  // Lógica de login (atualizada para lidar com erros)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('/api/auth/login', {
        email,
        password,
      });

      const { token, role } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('userRole', role); // Salva o 'role'

      navigate('/'); // Redireciona para o Dashboard

    } catch (err) {
      if (err.response && err.response.data.message) {
        // Exibe a mensagem específica (ex: "Aguardando aprovação...")
        setError(err.response.data.message);
      } else {
        setError('Email ou senha inválidos. Tente novamente.');
      }
      console.error('Erro de login:', err);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* <img src="/logo-uerj.png" alt="Logo UERJ" className="login-logo" /> */}
        <div className="login-header">
          <h1>Login</h1>
          <p>Acesso ao Painel de Controle</p>
        </div>
        <form className="login-form" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seuemail@uerj.br"
              required
            />
          </div>

          {/* --- CAMPO DE SENHA ATUALIZADO --- */}
          <div className="password-wrapper">
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'} // TIPO DINÂMICO
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            {/* ÍCONE DO OLHINHO */}
            <span
              className="password-toggle-icon"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          {/* ---------------------------------- */}

          {error && <p className="error-message">{error}</p>}
          <button type="submit">Entrar</button>
        </form>
        <p className="toggle-link">
          Não tem uma conta? <Link to="/register">Registre-se</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
