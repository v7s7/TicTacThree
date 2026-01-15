import React, { useState } from 'react';
import {
  canChangeDisplayName,
  getTimeUntilNameChange,
  formatTimeRemaining,
  isDisplayNameUnique,
  getAvatarLetter,
  getAvatarRenderInfo
} from '../utils/shopManager';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { soundManager } from '../utils/soundManager';

function Settings({ soundEnabled, onToggleSound, onResetData, onClose, user, onSignOut, userAvatar, onOpenShop, isAdmin, onShowAdminPanel }) {
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

  const avatarRender = getAvatarRenderInfo(userAvatar, { borderWidth: 4, contentScale: 0.72 });

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
                  style={avatarRender.style}
                >
                  <span className="avatar-letter" style={{ position: 'relative', zIndex: 1 }}>
                    {getAvatarLetter(user.displayName || user.email)}
                  </span>
                  {avatarRender.ringUrl && (
                    <img
                      src={avatarRender.ringUrl}
                      alt="Avatar Ring"
                      style={avatarRender.ringStyle}
                      draggable={false}
                    />
                  )}
                </div>
                <div className="profile-info">
                  <div className="profile-name">{user.displayName || user.email}</div>
                  <div className="profile-email">{user.email}</div>
                </div>
              </div>

              {onOpenShop && (
                <button
                  className="customize-btn"
                  onClick={() => {
                    soundManager.playClick();
                    onOpenShop();
                  }}
                >
                  Customize Avatar (Shop)
                </button>
              )}
            </div>

            {isAdmin && onShowAdminPanel && (
              <div className="settings-section">
                <h3>Admin</h3>
                <p className="name-note">Upload your own avatar designs, set prices, and publish them for players.</p>
                <button
                  className="customize-btn"
                  onClick={() => {
                    soundManager.playClick();
                    onShowAdminPanel();
                  }}
                >
                  Open Avatar Manager
                </button>
              </div>
            )}

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

export default Settings;
