// client/src/pages/AdminPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../lib/axiosClient';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { FaCheck, FaTimes } from 'react-icons/fa';
import './AdminPage.css'; // Novo CSS

function AdminPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  const [pendingUsers, setPendingUsers] = useState([]);
  const [message, setMessage] = useState('');

  // Função para buscar usuários pendentes
  const fetchPendingUsers = useCallback(async () => {
    try {
      const res = await axios.get('/api/admin/pending');
      setPendingUsers(res.data);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      setMessage('Erro ao carregar lista de usuários.');
    }
  }, []);

  // Verifica se é admin e busca os usuários ao carregar
  useEffect(() => {
    // Se não estiver logado, manda para login
    if (!token) {
      navigate('/login');
      return;
    }

    // Se não for admin, expulsa para o Dashboard
    if (userRole !== 'admin') {
      navigate('/');
      return;
    }

    // Só busca a lista se estiver autenticado e for admin
    fetchPendingUsers();
  }, [userRole, navigate, fetchPendingUsers, token]);

  const handleApprove = async (userId) => {
    try {
      await axios.patch(`/api/admin/approve/${userId}`);
      setMessage('Usuário aprovado!');
      fetchPendingUsers(); // Atualiza a lista
    } catch (error) {
      console.error('Erro ao aprovar usuário:', error);
      setMessage('Erro ao aprovar usuário.');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDeny = async (userId) => {
    if (!window.confirm('Tem certeza que deseja negar e excluir este usuário?')) return;
    try {
      await axios.delete(`/api/admin/deny/${userId}`);
      setMessage('Usuário negado e excluído.');
      fetchPendingUsers(); // Atualiza a lista
    } catch (error) {
      console.error('Erro ao negar usuário:', error);
      setMessage('Erro ao negar usuário.');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="dashboard-layout">
      <Header />
      <main className="dashboard-content modern-dash">
        <div className="page-header-simple">
          <h1>Painel de Administração</h1>
        </div>
        {message && <div className="floating-message">{message}</div>}

        <section className="card modern-card admin-card">
          <h2>Usuários Aguardando Aprovação</h2>
          {pendingUsers.length > 0 ? (
            <ul className="user-list">
              {pendingUsers.map(user => (
                <li key={user.id} className="user-item">
                  <div className="user-info">
                    <span className="user-name">{user.name}</span>
                    <span className="user-email">{user.email}</span>
                  </div>
                  <div className="user-actions">
                    <button 
                      className="btn-admin btn-approve"
                      onClick={() => handleApprove(user.id)}
                    >
                      <FaCheck /> Aprovar
                    </button>
                    <button 
                      className="btn-admin btn-deny"
                      onClick={() => handleDeny(user.id)}
                    >
                      <FaTimes /> Negar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="placeholder-text">Nenhum usuário aguardando aprovação no momento.</p>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default AdminPage;