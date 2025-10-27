import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { chatService } from '../services/chatService';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../services/api';

const Chat = () => {
  const { matchId } = useParams();
  const [match, setMatch] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const { socket, connected, connect } = useSocket();
  const { user } = useAuth();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadMatchAndMessages();
    connectSocket();

    return () => {
      if (socket) {
        socket.emit('leave_match', { match_id: parseInt(matchId) });
      }
    };
  }, [matchId]);

  useEffect(() => {
    if (socket) {
      socket.on('new_message', handleNewMessage);

      return () => {
        socket.off('new_message', handleNewMessage);
      };
    }
  }, [socket, messages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const connectSocket = () => {
    const token = localStorage.getItem('token');
    if (token && !connected) {
      connect(token);
    }
  };

  const loadMatchAndMessages = async () => {
    setLoading(true);
    setError('');

    try {
      const [matchData, messagesData] = await Promise.all([
        chatService.getMatch(matchId),
        chatService.getMessages(matchId)
      ]);

      setMatch(matchData);
      setMessages(messagesData.messages);

      // Join match room via socket
      if (socket) {
        socket.emit('join_match', { match_id: parseInt(matchId) });
      }
    } catch (err) {
      setError('Failed to load chat');
    } finally {
      setLoading(false);
    }
  };

  const handleNewMessage = (message) => {
    setMessages(prev => [...prev, message]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() || sending) return;

    setSending(true);
    setError('');

    try {
      const response = await chatService.sendMessage(
        parseInt(matchId),
        'text',
        newMessage.trim()
      );

      // Message will be received via socket
      setNewMessage('');
    } catch (err) {
      setError('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    setSending(true);
    setError('');

    try {
      await chatService.sendImageMessage(parseInt(matchId), file);
      // Message will be received via socket
    } catch (err) {
      setError('Failed to send image');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="loading">Loading chat...</div>;
  }

  if (!match) {
    return <div className="error">Chat not found</div>;
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <button onClick={() => navigate('/matches')} className="btn-back">
          ← Back
        </button>
        <div className="chat-user-info">
          <img
            src={`${API_URL}${match.user.photo_url}`}
            alt={match.user.name}
            className="chat-user-photo"
          />
          <h2>{match.user.name}, {match.user.age}</h2>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="no-messages">
            <p>No messages yet. Say hello!</p>
          </div>
        ) : (
          messages.map(message => (
            <div
              key={message.id}
              className={`message ${message.sender_id === user?.id ? 'own' : 'other'}`}
            >
              <div className="message-bubble">
                {message.message_type === 'image' ? (
                  <img
                    src={`${API_URL}${message.content}`}
                    alt="Message image"
                    className="message-image"
                  />
                ) : (
                  <p>{message.content}</p>
                )}
                <span className="message-time">{formatTime(message.created_at)}</span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="message-input-container">
        <label className="image-upload-btn">
          📷
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            onChange={handleImageUpload}
            style={{ display: 'none' }}
            disabled={sending}
          />
        </label>

        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          disabled={sending}
          maxLength={1000}
        />

        <button type="submit" disabled={sending || !newMessage.trim()} className="btn-send">
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;
