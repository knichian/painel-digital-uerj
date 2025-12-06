import React, { useEffect, useState, useMemo } from 'react';
import { FaTimes, FaPlus, FaCheck } from 'react-icons/fa';
import axios from '../lib/axiosClient';
import '../pages/PlaylistEditor.css';

const MediaModal = ({ isOpen, onClose, onAddMedia, playlistItems }) => {
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Busca as mídias disponíveis (imagens e vídeos)
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      axios
        .get('/api/media')
        .then((res) => setMediaList(res.data))
        .catch((err) => console.error('Erro ao buscar mídias:', err))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  // UMA LÓGICA DE 'isAdded' MUITO MAIS EFICIENTE
  // Cria um 'Set' com os IDs já adicionados, uma única vez
  const addedMediaIds = useMemo(() => {
    return new Set((playlistItems || []).map((item) => Number(item.media_item_id ?? item.mediaId ?? item.id)));
  }, [playlistItems]);

  const handleAddClick = (media) => {
    const duration = media.duration || 30;
    onAddMedia({ ...media, duration });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Adicionar Mídias à Playlist</h3>
          <button className="close-modal-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {loading ? (
          <p className="loading-text">Carregando mídias...</p>
        ) : (
          <div className="media-grid">
            {mediaList.length > 0 ? (
              mediaList.map((media) => {
                const title = media.title || media.name || 'Sem título';
                const src = media.file_path || media.url;
                const isAdded = addedMediaIds.has(Number(media.id));

                return (
                  <div className="media-item" key={media.id}>
                    {media.type === 'video' ? (
                      <video src={src} className="media-thumb-vid" muted loop playsInline />
                    ) : (
                      <img src={src} alt={title} className="media-thumb-img" />
                    )}
                    <div className="media-info">
                      <h4>{title}</h4>
                      <button
                        className={`add-btn-modal ${isAdded ? 'added' : ''}`}
                        disabled={isAdded}
                        onClick={() => handleAddClick(media)}
                      >
                        {isAdded ? (
                          <>
                            <FaCheck /> Adicionado
                          </>
                        ) : (
                          <>
                            <FaPlus /> Adicionar
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="loading-text">Nenhuma mídia disponível.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaModal;
