import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { interestService } from '../services/chatService';
import { API_URL } from '../services/api';

const ProfileSetup = () => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [bio, setBio] = useState('');
  const [customInterests, setCustomInterests] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { updateUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadInterests = async () => {
      try {
        const data = await interestService.getInterests();
        setAvailableTags(data.interests);
      } catch (err) {
        console.error('Failed to load interests:', err);
      }
    };
    loadInterests();
  }, []);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Photo must be less than 5MB');
        return;
      }
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const toggleTag = (tagId) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!photo) {
      setError('Profile photo is required');
      return;
    }

    const ageNum = parseInt(age);
    if (ageNum < 13 || ageNum > 20) {
      setError('Age must be between 13 and 20');
      return;
    }

    if (bio.length < 10 || bio.length > 500) {
      setError('Bio must be between 10 and 500 characters');
      return;
    }

    if (selectedTags.length === 0 && !customInterests.trim()) {
      setError('Please select at least one interest or add custom interests');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('age', age);
      formData.append('bio', bio);
      formData.append('custom_interests', customInterests);
      formData.append('interest_tag_ids', JSON.stringify(selectedTags));
      formData.append('photo', photo);

      const response = await userService.setupProfile(formData);
      updateUser(response.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to setup profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-setup-container">
      <div className="profile-setup-card">
        <h1>Complete Your Profile</h1>
        <p>Tell us about yourself to start finding friends!</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Profile Photo *</label>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              onChange={handlePhotoChange}
              required
            />
            {photoPreview && (
              <img src={photoPreview} alt="Preview" className="photo-preview" />
            )}
          </div>

          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
              maxLength={50}
              placeholder="Your name"
            />
          </div>

          <div className="form-group">
            <label>Age * (13-20)</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              required
              min={13}
              max={20}
              placeholder="Your age"
            />
          </div>

          <div className="form-group">
            <label>About Me * (10-500 characters)</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              required
              minLength={10}
              maxLength={500}
              placeholder="Tell us about yourself..."
              rows={4}
            />
            <span className="char-count">{bio.length}/500</span>
          </div>

          <div className="form-group">
            <label>Interests * (Select at least one)</label>
            <div className="interest-tags">
              {availableTags.map(tag => (
                <button
                  key={tag.id}
                  type="button"
                  className={`tag-button ${selectedTags.includes(tag.id) ? 'selected' : ''}`}
                  onClick={() => toggleTag(tag.id)}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Custom Interests (Optional)</label>
            <input
              type="text"
              value={customInterests}
              onChange={(e) => setCustomInterests(e.target.value)}
              placeholder="Any other interests?"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Creating Profile...' : 'Complete Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;
