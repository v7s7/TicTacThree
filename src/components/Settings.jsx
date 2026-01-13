import React from 'react';

function Settings({ soundEnabled, onToggleSound, onResetData, onClose }) {
  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all stats and coins? This cannot be undone!')) {
      onResetData();
    }
  };

  return (
    <div className="modal">
      <div className="modal-content settings-modal">
        <h2>⚙️ Settings</h2>

        <div className="settings-section">
          <div className="setting-item">
            <span className="setting-label">Sound Effects</span>
            <button
              className={`toggle-btn ${soundEnabled ? 'active' : ''}`}
              onClick={onToggleSound}
            >
              {soundEnabled ? '🔊 ON' : '🔇 OFF'}
            </button>
          </div>

          <div className="setting-item">
            <span className="setting-label">Game Version</span>
            <span className="setting-value">v1.0.0</span>
          </div>
        </div>

        <div className="danger-zone">
          <h3>Danger Zone</h3>
          <button className="danger-btn" onClick={handleReset}>
            🗑️ Reset All Data
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
