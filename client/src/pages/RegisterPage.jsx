// client/src/pages/RegisterPage.jsx

import React, { useState } from 'react';
import axios from '../lib/axiosClient';
import { useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // IMPORTAR ÍCONES
import './LoginPage.css'; // Reutiliza o mesmo CSS

function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // NOVO ESTADO: para controlar a visibilidade da senha
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    try {
      await axios.post('/api/auth/register', {
        name,
        email,
        password,
      });

      setSuccess('Conta criada com sucesso! Você será redirecionado para o login.');
      
      setTimeout(() => {
        navigate('/login');
      }, 2500); // Espera 2.5 segundos

    } catch (err) {
      if (err.response && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Erro ao criar a conta. Tente novamente.');
      }
      console.error('Erro de registro:', err);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>Criar Conta</h1>
          <p>Registro para a equipe de Comunicação</p>
        </div>
        <form className="login-form" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name">Nome Completo</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              required
            />
          </div>
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
            <label htmlFor="password">Senha (mín. 6 caracteres)</label>
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
          {success && <p className="success-message">{success}</p>}

          <button type="submit">Criar Conta</button>
        </form>
        <p className="toggle-link">
          Já tem uma conta? <Link to="/login">Faça login</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;