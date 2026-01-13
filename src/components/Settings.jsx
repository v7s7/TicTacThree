import React, { useState } from 'react';
import {
  canChangeDisplayName,
  getTimeUntilNameChange,
  formatTimeRemaining,
  isDisplayNameUnique,
  getAvatarLetter
} from '../utils/shopManager';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { soundManager } from '../utils/soundManager';

function Settings({ soundEnabled, onToggleSound, onResetData, onClose, user, onSignOut, userAvatar, onAvatarUpdate }) {
  const [newDisplayName, setNewDisplayName] = useState('');
  const [changingName, setChangingName] = useState(false);
  const [nameError, setNameError] = useState('');

  const isGuest = !user || user.isAnonymous;
  const canChangeName = user && !isGuest && canChangeDisplayName(user.lastDisplayNameChange);
  const timeLeft = user && !isGuest && !canChangeName
    ? formatTimeRemaining(getTimeUntilNameChange(user.lastDisplayNameChange))
    : '';

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all stats and coins? This cannot be undone!')) {
      onResetData();
    }
  };

  const handleDisplayNameChange = async () => {
    if (!newDisplayName.trim() || newDisplayName.length < 3) {
      setNameError('Display name must be at least 3 characters');
      soundManager.playError();
      return;
    }

    if (newDisplayName.length > 20) {
      setNameError('Display name must be 20 characters or less');
      soundManager.playError();
      return;
    }

    setChangingName(true);
    setNameError('');

    // Check if unique
    const unique = await isDisplayNameUnique(newDisplayName, user.uid, db);
    if (!unique) {
      setNameError('This display name is already taken');
      soundManager.playError();
      setChangingName(false);
      return;
    }

    // Update in Firestore
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: newDisplayName,
        lastDisplayNameChange: Date.now()
      });

      soundManager.playCoin();
      alert('Display name updated successfully!');
      setNewDisplayName('');
      onClose();
      window.location.reload(); // Reload to update everywhere
    } catch (error) {
      setNameError('Failed to update display name');
      soundManager.playError();
    }

    setChangingName(false);
  };

  return (
    <div className="modal">
      <div className="modal-content settings-modal">
        <h2>SETTINGS</h2>

        {!isGuest && (
          <>
            <div className="settings-section">
              <h3>Profile</h3>

              <div className="profile-preview">
                <div
                  className="avatar-preview-large"
                  style={{
                    background: userAvatar?.background ? getBackgroundColor(userAvatar.background) : 'rgba(26, 26, 46, 0.6)',
                    border: userAvatar?.frame ? `4px solid ${getFrameColor(userAvatar.frame)}` : '4px solid #667eea'
                  }}
                >
                  <span className="avatar-letter">{getAvatarLetter(user.displayName || user.email)}</span>
                </div>
                <div className="profile-info">
                  <div className="profile-name">{user.displayName || user.email}</div>
                  <div className="profile-email">{user.email}</div>
                </div>
              </div>

              {onAvatarUpdate && (
                <button
                  className="customize-btn"
                  onClick={() => {
                    soundManager.playClick();
                    onAvatarUpdate();
                  }}
                >
                  Customize Avatar (Shop)
                </button>
              )}
            </div>

            <div className="settings-section">
              <h3>Change Display Name</h3>
              {canChangeName ? (
                <>
                  <input
                    type="text"
                    placeholder="New display name"
                    value={newDisplayName}
                    onChange={(e) => setNewDisplayName(e.target.value)}
                    maxLength={20}
                    className="name-input"
                  />
                  {nameError && <div className="name-error">{nameError}</div>}
                  <button
                    className="change-name-btn"
                    onClick={handleDisplayNameChange}
                    disabled={changingName || !newDisplayName.trim()}
                  >
                    {changingName ? 'Updating...' : 'Change Name'}
                  </button>
                  <p className="name-note">You can change your name once every 7 days</p>
                </>
              ) : (
                <div className="name-cooldown">
                  <p>You can change your name again in: <strong>{timeLeft}</strong></p>
                </div>
              )}
            </div>
          </>
        )}

        <div className="settings-section">
          <h3>Game Settings</h3>
          <div className="setting-item">
            <span className="setting-label">Sound Effects</span>
            <button
              className={`toggle-btn ${soundEnabled ? 'active' : ''}`}
              onClick={onToggleSound}
            >
              {soundEnabled ? 'ON' : 'OFF'}
            </button>
          </div>

          <div className="setting-item">
            <span className="setting-label">Game Version</span>
            <span className="setting-value">v2.0.0</span>
          </div>
        </div>

        {!isGuest && onSignOut && (
          <div className="settings-section">
            <h3>Account</h3>
            <button className="signout-btn" onClick={onSignOut}>
              Sign Out
            </button>
          </div>
        )}

        <div className="danger-zone">
          <h3>Danger Zone</h3>
          <button className="danger-btn" onClick={handleReset}>
            Reset All Data
          </button>
          <p className="danger-text">This will delete all your stats and coins</p>
        </div>

        <div className="modal-buttons">
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function getBackgroundColor(bgId) {
  const backgrounds = {
    'bg_none': 'transparent',
    'bg_purple': 'rgba(102, 126, 234, 0.3)',
    'bg_green': 'rgba(0, 230, 118, 0.3)',
    'bg_red': 'rgba(255, 75, 92, 0.3)',
    'bg_galaxy': 'linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)'
  };
  return backgrounds[bgId] || 'rgba(26, 26, 46, 0.6)';
}

function getFrameColor(frameId) {
  const frames = {
    'frame_basic': '#667eea',
    'frame_gold': '#ffd700',
    'frame_rainbow': 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
    'frame_fire': '#ff4500',
    'frame_ice': '#00f5ff',
    'frame_diamond': '#b9f2ff'
  };
  return frames[frameId] || '#667eea';
}

export default Settings;
