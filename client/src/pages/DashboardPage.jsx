import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FaTrashAlt, FaPlay, FaPaintBrush } from 'react-icons/fa';
import { IoMdCloudUpload } from "react-icons/io";

import Header from '../components/Header';
import Footer from '../components/Footer';
import './DashboardPage.css';

function DashboardPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // --- 1. DECLARAÇÃO DE ESTADOS (HOOKS) ---
  // Todos os 'useState' devem vir primeiro, no topo da função.
  const [mediaItems, setMediaItems] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [activePlaylistId, setActivePlaylistId] = useState(null);

  // --- 2. FUNÇÕES DE BUSCA DE DADOS ---

  // Busca o ID da playlist ativa
  const fetchActivePlaylistId = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get('http://localhost:3001/api/monitors/hall-01/active', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setActivePlaylistId(res.data.activePlaylistId);
    } catch (error) {
      console.error('Erro ao buscar playlist ativa:', error);
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  }, [token, navigate]);

  // Busca todas as mídias
  const fetchMedia = useCallback(async () => {
    if (!token) return;
    try {
      const response = await axios.get('http://localhost:3001/api/media', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMediaItems(response.data);
    } catch (error) {
      console.error('Erro ao buscar mídias:', error);
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  }, [navigate, token]);

  // Busca todas as playlists
  const fetchPlaylists = useCallback(async () => {
    if (!token) return;
    try {
      const response = await axios.get('http://localhost:3001/api/playlists', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlaylists(response.data);
    } catch (error) {
      console.error('Erro ao buscar playlists:', error);
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  }, [token, navigate]);

  // --- 3. EFEITO DE CARREGAMENTO INICIAL ---
  useEffect(() => {
    if (!token) {
      navigate('/login');
    } else {
      fetchMedia();
      fetchPlaylists();
      fetchActivePlaylistId();
    }
  }, [navigate, token, fetchMedia, fetchPlaylists, fetchActivePlaylistId]);

  // --- 4. FUNÇÕES HANDLER (AÇÕES DO USUÁRIO) ---

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage('Por favor, selecione um arquivo.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setUploading(true);
    setMessage('Enviando...');
    const formData = new FormData();
    formData.append('image', file);
    formData.append('title', file.name);

    try {
      await axios.post('http://localhost:3001/api/media/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      setUploading(false);
      setMessage('Arquivo enviado com sucesso!');
      setFile(null);
      setFileName('');
      const fileInput = document.getElementById('action-file-upload');
      if (fileInput) fileInput.value = '';
      fetchMedia();
    } catch (error) {
      setUploading(false);
      setMessage('Erro ao enviar o arquivo.');
      console.error('Erro no upload:', error);
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    if (!newPlaylistName) {
      setMessage('Dê um nome para a playlist.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    setMessage('');
    try {
      await axios.post('http://localhost:3001/api/playlists',
        { name: newPlaylistName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewPlaylistName('');
      setMessage('Playlist criada com sucesso!');
      fetchPlaylists();
    } catch (error) {
      console.error('Erro ao criar playlist:', error);
      setMessage('Erro ao criar playlist.');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDeleteMedia = async (mediaId) => {
    if (!window.confirm('Tem certeza que deseja excluir esta mídia? Ela será removida de todas as playlists.')) return;
    try {
      await axios.delete(`http://localhost:3001/api/media/${mediaId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchMedia();
      setMessage('Mídia excluída.');
    } catch (error) {
      console.error('Erro ao excluir mídia:', error);
      setMessage('Erro ao excluir mídia.');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDeletePlaylist = async (playlistId) => {
    if (!window.confirm('Tem certeza que deseja excluir esta playlist?')) return;
    try {
      await axios.delete(`http://localhost:3001/api/playlists/${playlistId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPlaylists();
      setMessage('Playlist excluída.');
    } catch (error) {
      console.error('Erro ao excluir playlist:', error);
      setMessage('Erro ao excluir playlist.');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const handleActivatePlaylist = async (playlistId) => {
    if (!window.confirm('Deseja definir esta playlist como a principal do monitor?')) return;
    try {
      await axios.post(`http://localhost:3001/api/playlists/${playlistId}/activate`,
        { monitor_id: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setActivePlaylistId(playlistId);
      setMessage('Playlist ativada com sucesso!');
    } catch (error) {
      console.error('Erro ao ativar playlist:', error);
      setMessage('Erro ao ativar playlist.');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  // --- 5. RENDERIZAÇÃO DO JSX ---

  return (
    <div className="dashboard-layout">
      <Header />
      <main className="dashboard-content modern-dash">
        
        <div className="action-bar">
          <h2>Ações Rápidas</h2>
          <div className="action-buttons">
            <Link to="/create-slide" className="action-btn slide-btn">
              <FaPaintBrush /> Criar Slide com Texto
            </Link>
            
            <input 
              type="file" 
              onChange={handleFileChange} 
              accept="image/png, image/jpeg, video/mp4, video/mov"
              id="action-file-upload"
              className="file-input-hidden" 
            />
            <label htmlFor="action-file-upload" className="action-btn upload-btn">
              <IoMdCloudUpload /> {fileName || 'Enviar Mídia Rápida'}
            </label>
            
            {file && (
              <button onClick={handleUpload} className="action-btn submit-btn" disabled={uploading}>
                {uploading ? 'Enviando...' : 'Confirmar Envio'}
              </button>
            )}
          </div>
        </div>

        {message && <div className="floating-message" onAnimationEnd={() => setMessage('')}>{message}</div>}

        <div className="dashboard-grid-one-column">
          <section className="card modern-card">
            <h2>Playlists</h2>
            <form className="playlist-form-modern" onSubmit={handleCreatePlaylist}>
              <input
                type="text"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder="Nome da nova playlist"
              />
              <button type="submit" className="submit-btn-brand">+</button>
            </form>
            
            <div className="playlist-list-modern">
              <h3>Playlists Existentes</h3>
              {playlists.length > 0 ? (
                playlists.map(playlist => (
                  <div 
                    key={playlist.id} 
                    className={`playlist-item-dash ${playlist.id === activePlaylistId ? 'active' : ''}`}
                  >
                    <Link to={`/playlist/${playlist.id}`} className="playlist-name">
                      {playlist.name}
                    </Link>
                    <div className="playlist-controls">
                      {playlist.id === activePlaylistId ? (
                        <span className="active-badge"><FaPlay /> Ativa</span>
                      ) : (
                        <button 
                          className="btn-action btn-activate"
                          title="Ativar no Monitor"
                          onClick={() => handleActivatePlaylist(playlist.id)}
                        >
                          Ativar
                        </button>
                      )}
                      <button 
                        className="btn-action btn-delete" 
                        title="Excluir Playlist"
                        onClick={() => handleDeletePlaylist(playlist.id)}
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="placeholder-text">Nenhuma playlist criada.</p>
              )}
            </div>
          </section>
        </div> 

        <section className="card modern-card gallery-section-full-width">
          <h2>Galeria de Mídias</h2>
          <div className="gallery-grid-dash">
            {mediaItems.length > 0 ? (
              mediaItems.map(item => (
                <div key={item.id} className="gallery-item-dash">
                  <button 
                    className="btn-delete-media" 
                    title="Excluir Mídia"
                    onClick={() => handleDeleteMedia(item.id)}
                  >
                    &times;
                  </button>
                  <img src={`http://localhost:3001${item.file_path}`} alt={item.title} />
                  <p className="item-title" title={item.title}>{item.title}</p>
                </div>
              ))
            ) : (
              <p className="placeholder-text">Nenhuma mídia encontrada.</p>
            )}
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}

export default DashboardPage;