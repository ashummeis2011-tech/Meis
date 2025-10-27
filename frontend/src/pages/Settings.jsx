import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { interestService } from '../services/chatService';
import { API_URL } from '../services/api';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Profile edit fields
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [bio, setBio] = useState('');
  const [customInterests, setCustomInterests] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');

  // Email change fields
  const [currentPasswordEmail, setCurrentPasswordEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');

  // Password change fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Delete account
  const [deletePassword, setDeletePassword] = useState('');

  const { logout, updateUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadProfile();
    loadInterests();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await userService.getProfile();
      setProfile(data);
      setName(data.name);
      setAge(data.age.toString());
      setBio(data.bio);
      setCustomInterests(data.custom_interests || '');
      setSelectedTags(data.interest_tags.map(t => t.id));
      setPhotoPreview(`${API_URL}${data.photo_url}`);
    } catch (err) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const loadInterests = async () => {
    try {
      const data = await interestService.getInterests();
      setAvailableTags(data.interests);
    } catch (err) {
      console.error('Failed to load interests:', err);
    }
  };

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

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('age', age);
      formData.append('bio', bio);
      formData.append('custom_interests', customInterests);
      formData.append('interest_tag_ids', JSON.stringify(selectedTags));
      if (photo) {
        formData.append('photo', photo);
      }

      const response = await userService.updateProfile(formData);
      updateUser(response.user);
      setSuccess('Profile updated successfully!');
      setPhoto(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangeEmail = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      await userService.changeEmail(currentPasswordEmail, newEmail);
      setSuccess('Email updated successfully!');
      setCurrentPasswordEmail('');
      setNewEmail('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change email');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setSaving(true);

    try {
      await userService.changePassword(currentPassword, newPassword, confirmPassword);
      setSuccess('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure? This action cannot be undone!')) {
      return;
    }

    setError('');
    setSaving(true);

    try {
      await userService.deleteAccount(deletePassword);
      logout();
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete account');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="settings-container">
      <h1>Account Settings</h1>

      <div className="settings-tabs">
        <button
          className={activeTab === 'profile' ? 'active' : ''}
          onClick={() => setActiveTab('profile')}
        >
          Edit Profile
        </button>
        <button
          className={activeTab === 'email' ? 'active' : ''}
          onClick={() => setActiveTab('email')}
        >
          Change Email
        </button>
        <button
          className={activeTab === 'password' ? 'active' : ''}
          onClick={() => setActiveTab('password')}
        >
          Change Password
        </button>
        <button
          className={activeTab === 'account' ? 'active' : ''}
          onClick={() => setActiveTab('account')}
        >
          Account
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {activeTab === 'profile' && (
        <form onSubmit={handleUpdateProfile} className="settings-form">
          <div className="form-group">
            <label>Profile Photo</label>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              onChange={handlePhotoChange}
            />
            {photoPreview && (
              <img src={photoPreview} alt="Preview" className="photo-preview" />
            )}
          </div>

          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              minLength={2}
              maxLength={50}
            />
          </div>

          <div className="form-group">
            <label>Age (13-20)</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              min={13}
              max={20}
            />
          </div>

          <div className="form-group">
            <label>About Me</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              minLength={10}
              maxLength={500}
              rows={4}
            />
            <span className="char-count">{bio.length}/500</span>
          </div>

          <div className="form-group">
            <label>Interests</label>
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
            <label>Custom Interests</label>
            <input
              type="text"
              value={customInterests}
              onChange={(e) => setCustomInterests(e.target.value)}
            />
          </div>

          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      )}

      {activeTab === 'email' && (
        <form onSubmit={handleChangeEmail} className="settings-form">
          <div className="form-group">
            <label>Current Password</label>
            <input
              type="password"
              value={currentPasswordEmail}
              onChange={(e) => setCurrentPasswordEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>New Email</label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Updating...' : 'Update Email'}
          </button>
        </form>
      )}

      {activeTab === 'password' && (
        <form onSubmit={handleChangePassword} className="settings-form">
          <div className="form-group">
            <label>Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>

          <div className="form-group">
            <label>Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      )}

      {activeTab === 'account' && (
        <div className="settings-form">
          <div className="account-actions">
            <div className="action-section">
              <h3>Logout</h3>
              <p>Sign out of your account</p>
              <button onClick={logout} className="btn-secondary">
                Logout
              </button>
            </div>

            <div className="action-section danger">
              <h3>Delete Account</h3>
              <p>Permanently delete your account and all data. This cannot be undone!</p>
              <div className="form-group">
                <label>Enter your password to confirm</label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Your password"
                />
              </div>
              <button
                onClick={handleDeleteAccount}
                disabled={!deletePassword || saving}
                className="btn-danger"
              >
                {saving ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
