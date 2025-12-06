import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../lib/axiosClient'; // Mantendo seu axiosClient
import Header from '../components/Header';
import Footer from '../components/Footer';
import './CreateSlidePage.css'; // Usaremos o novo CSS

function CreateSlidePage() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  
  // Estados do Formulário
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [textContent, setTextContent] = useState('');
  const [overlayPosition, setOverlayPosition] = useState('bottom');
  const [duration, setDuration] = useState(30); // Duração padrão de 30s
  
  // NOVO ESTADO: Guarda a playlist ativa
  const [activePlaylist, setActivePlaylist] = useState(null); 

  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  // Busca a playlist ativa e seus detalhes
  const fetchActivePlaylist = useCallback(async () => {
    if (!token) return;
    try {
      // 1. Descobre o ID da playlist ativa
      const activeRes = await axios.get('/api/monitors/hall-01/active', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const activeId = activeRes.data.activePlaylistId;

      if (activeId) {
        // 2. Se existe uma, busca os detalhes dela (para pegar o nome)
        const playlistRes = await axios.get(`/api/playlists/${activeId}`, {
           headers: { Authorization: `Bearer ${token}` },
        });
        setActivePlaylist(playlistRes.data); // Salva o objeto { id, name, ... }
      }
    } catch (error) {
      console.error('Erro ao buscar playlist ativa:', error);
      if (error.response?.status === 401) navigate('/login');
    }
  }, [token, navigate]);

  // Busca a playlist ativa quando a página carrega
  useEffect(() => {
    if (!token) navigate('/login');
    fetchActivePlaylist();
  }, [token, navigate, fetchActivePlaylist]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  // --- SUBMIT ATUALIZADO ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage('Por favor, escolha uma imagem de fundo.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    if (!activePlaylist) {
      setMessage('Nenhuma playlist ativa encontrada. Ative uma playlist no Dashboard primeiro.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setUploading(true);
    setMessage('Enviando imagem...');

    const formData = new FormData();
    formData.append('image', file);
    formData.append('text_content', textContent);
    formData.append('text_overlay_position', overlayPosition);
    formData.append('title', file.name);

    try {
      // ETAPA 1: Fazer o upload da nova mídia
      const uploadResponse = await axios.post('/api/media/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      const newMediaId = uploadResponse.data.media.id;
      setMessage('Slide criado! Adicionando à playlist ativa...');

      // ETAPA 2: Adiciona o novo slide DIRETAMENTE à playlist ativa
      await axios.post(
        `/api/playlists/${activePlaylist.id}/items`,
        {
          media_item_id: newMediaId,
          duration: parseInt(duration) || 30
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMessage('Slide criado e adicionado com sucesso!');

      // Envia o usuário direto para a playlist que ele acabou de editar
      setTimeout(() => {
        navigate(`/playlist/${activePlaylist.id}`);
      }, 1500);

    } catch (error) {
      console.error('Erro ao criar slide:', error);
      setUploading(false);
      setMessage('Erro ao criar slide. Tente novamente.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="dashboard-layout">
      <Header />
      <main className="dashboard-content create-slide-page">
        <div className="page-header-simple">
          <Link to="/" className="back-link-simple">← Voltar</Link>
          <h1>Criar Slide Informativo</h1>
        </div>

        {message && <div className="floating-message" onAnimationEnd={() => setMessage('')}>{message}</div>}

        <div className="create-slide-layout">
          {/* COLUNA DA ESQUERDA: FORMULÁRIO */}
          <section className="card form-column">
            <h2>Configurações do Slide</h2>
            
            {/* NOVO: Info Box da Playlist Ativa */}
            <div className="info-box">
              <p>Este slide será adicionado automaticamente à playlist ativa:</p>
              {activePlaylist ? (
                <strong>{activePlaylist.name}</strong>
              ) : (
                <strong className="error-text">Nenhuma playlist ativa. (Vá ao Dashboard para ativar uma)</strong>
              )}
            </div>
            
            <form onSubmit={handleSubmit} className="slide-form">
              
              <div className="form-group">
                <label>1. Imagem de Fundo</label>
                <input type="file" accept="image/*,video/mp4,video/mov" onChange={handleFileChange} id="slide-upload" className="file-input-hidden" />
                <label htmlFor="slide-upload" className="file-input-label full-width">
                  {file ? `Arquivo: ${file.name}` : 'Escolher Imagem/Vídeo...'}
                </label>
              </div>

              <div className="form-group">
                <label>2. Texto do Slide (Opcional)</label>
                <textarea value={textContent} onChange={(e) => setTextContent(e.target.value)} placeholder="Digite a mensagem aqui..." maxLength={150} rows={4} />
                <small className="char-count">{textContent.length}/150</small>
              </div>

              <div className="form-group-row">
                <div className="form-group">
                  <label>3. Posição do Texto</label>
                  <select value={overlayPosition} onChange={(e) => setOverlayPosition(e.target.value)}>
                    <option value="bottom">Rodapé (Padrão)</option>
                    <option value="top">Cabeçalho</option>
                    <option value="center">Centro (Destaque)</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>4. Duração (segundos)</label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    min="5"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="submit-button-brand" // Nova classe
                disabled={uploading || !file || !activePlaylist}
              >
                {uploading ? 'Criando...' : 'Salvar Slide na Playlist Ativa'}
              </button>
            </form>
          </section>

          {/* COLUNA DA DIREITA: PREVIEW EM TEMPO REAL */}
          <section className="preview-column">
            <h2>Pré-visualização (Monitor)</h2>
            <div className="monitor-preview">
              {previewUrl ? (
                <div className="slide-preview" style={{ backgroundImage: `url(${previewUrl})` }}>
                  {textContent && (
                    <div className={`text-overlay position-${overlayPosition}`}>
                      <p>{textContent}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="empty-preview">
                  <p>Escolha uma imagem para ver o preview</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default CreateSlidePage;