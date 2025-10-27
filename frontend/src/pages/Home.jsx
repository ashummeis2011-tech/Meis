import { useState, useEffect } from 'react';
import { swipeService } from '../services/swipeService';
import { API_URL } from '../services/api';

const Home = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swiping, setSwiping] = useState(false);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedUser, setMatchedUser] = useState(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
    loadNextUser();
  }, []);

  const loadStats = async () => {
    try {
      const stats = await swipeService.getStats();
      setTotalUsers(stats.total_users);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const loadNextUser = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await swipeService.getNextUser();
      if (data.user) {
        setCurrentUser(data.user);
      } else {
        setCurrentUser(null);
      }
    } catch (err) {
      if (err.response?.status === 204) {
        setCurrentUser(null);
      } else {
        setError('Failed to load users');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (direction) => {
    if (!currentUser || swiping) return;

    setSwiping(true);
    setError('');

    try {
      const response = await swipeService.swipe(currentUser.id, direction);

      if (response.match) {
        // Show match notification
        setMatchedUser(response.matched_user);
        setShowMatch(true);
      }

      // Load next user
      setTimeout(() => {
        loadNextUser();
        setSwiping(false);
      }, 500);
    } catch (err) {
      setError(err.response?.data?.error || 'Swipe failed');
      setSwiping(false);
    }
  };

  const closeMatchModal = () => {
    setShowMatch(false);
    setMatchedUser(null);
  };

  const dismissWelcome = () => {
    setShowWelcome(false);
  };

  if (loading && !currentUser) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="home-container">
      {showWelcome && (
        <div className="welcome-banner">
          <h2>Welcome! Here are people looking to make friends</h2>
          <p>There are {totalUsers} users on Meis</p>
          <button onClick={dismissWelcome} className="btn-close">Got it!</button>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      {!currentUser ? (
        <div className="no-users">
          <h2>No more people to show</h2>
          <p>Check back later for more users!</p>
        </div>
      ) : (
        <div className="swipe-card">
          <div className="user-card">
            <img
              src={`${API_URL}${currentUser.photo_url}`}
              alt={currentUser.name}
              className="user-photo"
            />
            <div className="user-info">
              <h2>{currentUser.name}, {currentUser.age}</h2>
              <p className="user-bio">{currentUser.bio}</p>

              <div className="user-interests">
                <h4>Interests:</h4>
                <div className="interest-tags">
                  {currentUser.interest_tags.map(tag => (
                    <span key={tag.id} className="interest-tag">{tag.name}</span>
                  ))}
                  {currentUser.custom_interests && (
                    <span className="interest-tag custom">{currentUser.custom_interests}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="swipe-buttons">
            <button
              className="btn-reject"
              onClick={() => handleSwipe('left')}
              disabled={swiping}
            >
              ✕ Reject
            </button>
            <button
              className="btn-love"
              onClick={() => handleSwipe('right')}
              disabled={swiping}
            >
              ♥ Love
            </button>
          </div>
        </div>
      )}

      {showMatch && matchedUser && (
        <div className="match-modal" onClick={closeMatchModal}>
          <div className="match-content">
            <h1>It's a Match with {matchedUser.name}!</h1>
            <img
              src={`${API_URL}${matchedUser.photo_url}`}
              alt={matchedUser.name}
              className="match-photo"
            />
            <p>You can now chat with each other</p>
            <button onClick={closeMatchModal} className="btn-primary">
              Keep Swiping
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
