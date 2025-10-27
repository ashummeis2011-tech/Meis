import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { chatService } from '../services/chatService';
import { API_URL } from '../services/api';

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await chatService.getMatches();
      setMatches(data.matches);
    } catch (err) {
      setError('Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  const openChat = (matchId) => {
    navigate(`/chat/${matchId}`);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 24 * 60 * 60 * 1000) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit'
      });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  if (loading) {
    return <div className="loading">Loading matches...</div>;
  }

  return (
    <div className="matches-container">
      <h1>Your Matches</h1>

      {error && <div className="error-message">{error}</div>}

      {matches.length === 0 ? (
        <div className="no-matches">
          <h2>No matches yet</h2>
          <p>Keep swiping to find friends!</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Start Swiping
          </button>
        </div>
      ) : (
        <div className="matches-list">
          {matches.map(match => (
            <div
              key={match.match_id}
              className="match-item"
              onClick={() => openChat(match.match_id)}
            >
              <img
                src={`${API_URL}${match.user.photo_url}`}
                alt={match.user.name}
                className="match-photo"
              />
              <div className="match-info">
                <div className="match-header">
                  <h3>{match.user.name}, {match.user.age}</h3>
                  {match.unread_count > 0 && (
                    <span className="unread-badge">{match.unread_count}</span>
                  )}
                </div>
                {match.last_message ? (
                  <div className="last-message">
                    <p>{match.last_message.content}</p>
                    <span className="message-time">
                      {formatTime(match.last_message.created_at)}
                    </span>
                  </div>
                ) : (
                  <p className="no-messages">No messages yet</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Matches;
