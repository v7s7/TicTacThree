import React, { useState } from 'react';
import { signUp, signIn } from '../utils/authManager';
import { soundManager } from '../utils/soundManager';

function Auth({ onAuthSuccess, onContinueAsGuest }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    soundManager.playClick();

    if (isSignUp) {
      if (!displayName.trim()) {
        setError('Please enter a display name');
        setLoading(false);
        soundManager.playError();
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        setLoading(false);
        soundManager.playError();
        return;
      }

      const result = await signUp(email, password, displayName);
      if (result.success) {
        soundManager.playCoin();
        onAuthSuccess(result.user);
      } else {
        setError(result.error);
        soundManager.playError();
      }
    } else {
      const result = await signIn(email, password);
      if (result.success) {
        soundManager.playCoin();
        onAuthSuccess(result.user);
      } else {
        setError(result.error);
        soundManager.playError();
      }
    }

    setLoading(false);
  };

  const handleGuestPlay = () => {
    soundManager.playClick();
    onContinueAsGuest();
  };

  const toggleMode = () => {
    soundManager.playClick();
    setIsSignUp(!isSignUp);
    setError('');
  };

  return (
    <div className="auth-screen">
      <div className="auth-container">
        <h1 className="game-title">TicTacThree</h1>
        <p className="game-subtitle">The strategic twist on tic-tac-toe</p>

        <div className="auth-card">
          <h2>{isSignUp ? 'Create Account' : 'Sign In'}</h2>

          <form onSubmit={handleSubmit} className="auth-form">
            {isSignUp && (
              <div className="form-group">
                <label htmlFor="displayName">Display Name</label>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Choose a display name"
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isSignUp ? 'Create a password (min 6 chars)' : 'Enter your password'}
                required
              />
            </div>

            {error && <div className="auth-error">{error}</div>}

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? 'Please wait...' : (isSignUp ? 'Sign Up' : 'Sign In')}
            </button>
          </form>

          <div className="auth-toggle">
            <span>
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            </span>
            <button onClick={toggleMode} className="auth-toggle-btn">
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </div>

          <div className="auth-divider">
            <span>OR</span>
          </div>

          <button onClick={handleGuestPlay} className="guest-btn">
            Continue as Guest
          </button>
          <p className="guest-note">
            Play without an account. Your progress will be saved locally.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Auth;
