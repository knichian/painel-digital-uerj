import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from '../lib/axiosClient';
import { FaTrash, FaClock, FaPlus, FaCalendarAlt, FaSave } from 'react-icons/fa';
import Header from '../components/Header';
import MediaModal from '../components/MediaModal';
import './PlaylistEditor.css';

// --- SUBCOMPONENTE: MODAL DE AGENDAMENTO ---
function ScheduleModal({ item, onClose, onSave }) {
  const formatDateTimeLocal = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 16);
  };

  const [startAt, setStartAt] = useState(formatDateTimeLocal(item.start_at));
  const [endAt, setEndAt] = useState(formatDateTimeLocal(item.end_at));

  const handleSaveClick = () => {
    onSave(item.id, {
      start_at: startAt || null,
      end_at: endAt || null,
    });
  };

  return (
    <div className="schedule-modal-overlay" onClick={onClose}>
      <div className="schedule-modal-content" onClick={(e) => e.stopPropagation()}>
        <h4>Agendar Slide: {item.title}</h4>
        <div className="form-group">
          <label>Exibir A PARTIR DE:</label>
          <input
            type="datetime-local"
            value={startAt}
            onChange={(e) => setStartAt(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Parar de exibir EM:</label>
          <input
            type="datetime-local"
            value={endAt}
            onChange={(e) => setEndAt(e.target.value)}
          />
        </div>
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>Cancelar</button>
          <button className="btn-save" onClick={handleSaveClick}><FaSave /> Salvar</button>
        </div>
      </div>
    </div>
  );
}

// --- SUBCOMPONENTE: ITEM DA PLAYLIST ---
function PlaylistItem({ item, index, onRemove, onUpdateDuration, onOpenSchedule }) {
  const [duration, setDuration] = useState(item.item_duration || 10);

  const handleSaveDuration = () => {
    const newDuration = parseInt(duration);
    if (newDuration && newDuration !== item.item_duration) {
      onUpdateDuration(item.id, newDuration);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') e.target.blur();
  };

  const isVideo = item.type === 'video' || (item.file_path && (item.file_path.endsWith('.mp4')));

  // --- LÓGICA DE EXIBIÇÃO DE AGENDAMENTO ---
  const hasScheduling = item.start_at || item.end_at;
  let scheduleTooltip = 'Agendar slide'; // Tooltip padrão

  // Formata a data para "DD/MM/AAAA HH:mm"
  const formatHoverDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  if (item.end_at) {
    scheduleTooltip = `Expira em: ${formatHoverDate(item.end_at)}`;
  } else if (item.start_at) {
    scheduleTooltip = `Inicia em: ${formatHoverDate(item.start_at)}`;
  }
  // --- FIM DA LÓGICA ---

  return (
    <div className="playlist-item-modern">
      <div className="item-index">{index + 1}</div>
      <img
        src={item.file_path}
        alt={item.title}
        className={isVideo ? 'video-thumb' : ''}
      />
      <div className="item-details">
        <span className="item-name">{item.title}</span>
        <div className="item-controls-wrapper">
          <div className="item-meta-editable" title="Editar duração">
            <FaClock size={12} color="#888" />
            <input
              type="number" min="5" max="999"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              onBlur={handleSaveDuration}
              onKeyDown={handleKeyDown}
            />
            <span>s</span>
          </div>
          {/* O ícone de calendário não fica mais aqui */}
        </div>
      </div>

      {/* Botões de Ação ficam juntos à direita */}
      <div className="item-action-buttons">
        <button 
          // Aplica a classe 'active' se tiver agendamento
          className={`btn-icon btn-schedule ${hasScheduling ? 'active' : ''}`} 
          title={scheduleTooltip} // O tooltip agora mostra a data!
          onClick={() => onOpenSchedule(item)}
        >
          <FaCalendarAlt size={12} />
        </button>
        <button
          className="btn-icon delete-btn-modern"
          onClick={() => onRemove(item.id)}
          title="Remover da playlist"
        >
          <FaTrash size={14} />
        </button>
      </div>
    </div>
  );
}

export default function PlaylistEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [schedulingItem, setSchedulingItem] = useState(null);

  const token = localStorage.getItem('token');

  const fetchPlaylist = useCallback(async () => {
    try {
      const res = await axios.get(`/api/playlists/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlaylist(res.data);
    } catch (err) {
      console.error('Erro ao buscar playlist:', err);
      if (err.response?.status === 401) navigate('/login');
    }
  }, [id, token, navigate]);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    setLoading(true);
    fetchPlaylist().finally(() => setLoading(false));
  }, [id, token, navigate, fetchPlaylist]);

  const handleAddMedia = async (media) => {
    let mediaIdToSend = media.id;
    let durationToSend = media.duration || 30;

    try {
      await axios.post(
        `/api/playlists/${id}/items`,
        { media_item_id: mediaIdToSend, duration: parseInt(durationToSend) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchPlaylist();
      setMessage('Mídia adicionada!');
      setIsModalOpen(false);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Erro ao adicionar.');
    } finally {
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await axios.delete(`/api/playlists/${id}/items/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchPlaylist();
      setMessage('Item removido.');
    } catch {
      setMessage('Erro ao remover item.');
    } finally {
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleUpdateDuration = async (itemId, newDuration) => {
    try {
      await axios.patch(
        `/api/playlists/${id}/items/${itemId}`,
        { duration_seconds: newDuration },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchPlaylist();
    } catch (err) {
      console.error('Erro ao atualizar duração:', err);
      setMessage('Erro ao salvar duração.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleSaveSchedule = async (itemId, scheduleData) => {
    try {
      await axios.patch(
        `/api/playlists/${id}/items/${itemId}`,
        scheduleData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSchedulingItem(null);
      await fetchPlaylist();
      setMessage('Agendamento salvo!');
    } catch (err) {
      console.error('Erro ao salvar agendamento:', err);
      setMessage('Erro ao salvar agendamento.');
    } finally {
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (loading || !playlist) return (
    <div className="playlist-page-layout"><Header /><div className="loading">Carregando...</div></div>
  );

  return (
    <div className="playlist-page-layout">
      <Header />
      <main className="main-area">
        <div className="page-header-simple">
          <div>
            <Link to="/" className="back-link-simple">← Voltar</Link>
            <h1 title={playlist.name}>{playlist.name}</h1>
          </div>
          <button className="add-media-btn" onClick={() => setIsModalOpen(true)}>
            <FaPlus /> Adicionar Mídia
          </button>
        </div>

        {message && (
          <div className="floating-message" onAnimationEnd={() => setMessage('')}>
            {message}
          </div>
        )}

        <section className="playlist-container">
          <div className="playlist-header">
            <h2>Itens na Playlist</h2>
            <span className="badge-pill">{playlist.items?.length || 0} itens</span>
          </div>

          <div className="playlist-list-modern">
            {playlist.items?.length > 0 ? (
              playlist.items.map((item, index) => (
                <PlaylistItem
                  key={item.id}
                  index={index}
                  item={item}
                  onRemove={handleRemoveItem}
                  onUpdateDuration={handleUpdateDuration}
                  onOpenSchedule={setSchedulingItem}
                />
              ))
            ) : (
              <div className="empty-playlist-state">
                <p><strong>Playlist Vazia</strong></p>
                <p>Clique em "Adicionar Mídia" para começar.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <MediaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddMedia={handleAddMedia}
        playlistItems={(playlist.items || []).map((it) => ({ mediaId: Number(it.media_item_id) }))}
      />

      {schedulingItem && (
        <ScheduleModal
          item={schedulingItem}
          onClose={() => setSchedulingItem(null)}
          onSave={handleSaveSchedule}
        />
      )}
    </div>
  );
}
