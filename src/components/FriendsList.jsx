import React, { useState, useEffect } from 'react';
import {
  getFriendsList,
  getFriendRequests,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  removeFriend,
  inviteFriendToGame,
  getGameInvites,
  acceptGameInvite,
  declineGameInvite
} from '../utils/friendsManager';
import { soundManager } from '../utils/soundManager';
import { getAvatarRenderInfo } from '../utils/shopManager';

function FriendsList({ onClose, user, onJoinGame, userAvatar }) {
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [gameInvites, setGameInvites] = useState([]);
  const [addFriendName, setAddFriendName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      loadFriends();
      loadRequests();
      loadGameInvites();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadFriends = async () => {
    const result = await getFriendsList(user.uid);
    if (result.success) {
      setFriends(result.friends);
    }
  };

  const loadRequests = async () => {
    const result = await getFriendRequests(user.uid);
    if (result.success) {
      setRequests(result.requests);
    }
  };

  const loadGameInvites = async () => {
    const result = await getGameInvites(user.uid);
    if (result.success) {
      setGameInvites(result.invites);
    }
  };

  const handleSendRequest = async () => {
    if (!addFriendName.trim()) return;

    setLoading(true);
    const result = await sendFriendRequest(
      user.uid,
      addFriendName,
      user.displayName || user.email,
      { frame: user?.equippedFrame || userAvatar?.frame, background: user?.equippedBackground || userAvatar?.background }
    );

    if (result.success) {
      soundManager.playCoin();
      setMessage(result.message);
      setAddFriendName('');
    } else {
      soundManager.playError();
      setMessage(result.error);
    }

    setLoading(false);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleAcceptRequest = async (requestId) => {
    soundManager.playClick();
    const result = await acceptFriendRequest(requestId, user.uid);
    if (result.success) {
      soundManager.playCoin();
      loadFriends();
      loadRequests();
      setMessage(result.message);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleDeclineRequest = async (requestId) => {
    soundManager.playClick();
    await declineFriendRequest(requestId);
    loadRequests();
  };

  const handleRemoveFriend = async (friendId) => {
    if (!window.confirm('Remove this friend?')) return;

    soundManager.playClick();
    await removeFriend(user.uid, friendId);
    loadFriends();
  };

  const handleInvite = async (friend) => {
    soundManager.playClick();
    const result = await inviteFriendToGame(
      user.uid,
      friend.id,
      user.displayName || user.email,
      friend.displayName,
      { frame: user?.equippedFrame || userAvatar?.frame, background: user?.equippedBackground || userAvatar?.background }
    );

    if (result.success) {
      soundManager.playCoin();
      setMessage(`Invite sent to ${friend.displayName}!`);
      setTimeout(() => setMessage(''), 3000);
    } else {
      soundManager.playError();
      setMessage(result.error);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleAcceptInvite = async (invite) => {
    soundManager.playClick();
    const result = await acceptGameInvite(invite.id);
    if (result.success) {
      soundManager.playCoin();
      // Join as O (invitee). Provide names for in-game UI.
      onJoinGame({
        roomId: result.roomId,
        playerSymbol: 'O',
        opponentId: invite.from,
        playerXName: invite.fromDisplayName || 'Friend',
        playerOName: user?.displayName || 'You'
      });
      setGameInvites((prev) => prev.filter((i) => i.id !== invite.id));
      onClose();
    }
  };

  const handleDeclineInvite = async (invite) => {
    soundManager.playClick();
    await declineGameInvite(invite.id, invite.roomId);
    setGameInvites((prev) => prev.filter((i) => i.id !== invite.id));
  };

  const renderAvatar = (name, photoUrl, avatar = {}) => {
    const letter = name?.[0]?.toUpperCase() || '?';

    if (photoUrl) {
      return (
        <div
          className="friend-avatar with-photo"
          style={{ backgroundImage: `url(${photoUrl})` }}
          aria-label={name}
        />
      );
    }

    const avatarRender = getAvatarRenderInfo(avatar, { borderWidth: 2, contentScale: 0.78 });

    return (
      <div
        className="friend-avatar"
        aria-label={name}
        style={avatarRender.style}
      >
        <span style={{ position: 'relative', zIndex: 1 }}>{letter}</span>
        {avatarRender.ringUrl && (
          <img
            src={avatarRender.ringUrl}
            alt="Avatar Ring"
            style={avatarRender.ringStyle}
            draggable={false}
          />
        )}
      </div>
    );
  };

  const totalFriends = friends.length;
  const totalRequests = requests.length;
  const totalInvites = gameInvites.length;

  return (
    <div className="modal">
      <div className="modal-content friends-modal">
        <div className="friends-header">
          <div>
            <h2>Friends</h2>
            <p className="friends-subtitle">Manage invites, requests, and 1v1s</p>
          </div>
          <div className="friends-pills">
            <span className="friends-pill">Friends: {totalFriends}</span>
            <span className="friends-pill alert">Requests: {totalRequests}</span>
            <span className="friends-pill success">Invites: {totalInvites}</span>
          </div>
        </div>

        {message && <div className="friends-message">{message}</div>}

        {gameInvites.length > 0 && (
          <div className="friends-section">
            <div className="section-title-row">
              <h3>Game Invites</h3>
              <span className="section-chip success">Ready to join</span>
            </div>
            <div className="friends-list">
              {gameInvites.map((invite) => (
                <div key={invite.id} className="friend-card invite">
                  {renderAvatar(invite.fromDisplayName, invite.fromPhotoUrl, {
                    frame: invite.fromEquippedFrame,
                    background: invite.fromEquippedBackground
                  })}
                  <div className="friend-meta">
                    <div className="friend-name-row">
                      <span className="friend-name">{invite.fromDisplayName}</span>
                      <span className="friend-tag">Invite</span>
                    </div>
                    <span className="friend-info">wants to play now</span>
                  </div>
                  <div className="friend-actions">
                    <button className="friend-btn pill success" onClick={() => handleAcceptInvite(invite)}>
                      Accept
                    </button>
                    <button className="friend-btn pill danger" onClick={() => handleDeclineInvite(invite)}>
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {requests.length > 0 && (
          <div className="friends-section">
            <div className="section-title-row">
              <h3>Friend Requests</h3>
              <span className="section-chip alert">New</span>
            </div>
            <div className="friends-list">
              {requests.map((request) => (
                <div key={request.id} className="friend-card request">
                  {renderAvatar(request.fromDisplayName, request.fromPhotoUrl, {
                    frame: request.fromEquippedFrame,
                    background: request.fromEquippedBackground
                  })}
                  <div className="friend-meta">
                    <div className="friend-name-row">
                      <span className="friend-name">{request.fromDisplayName}</span>
                      <span className="friend-tag">Request</span>
                    </div>
                    <span className="friend-info">wants to connect</span>
                  </div>
                  <div className="friend-actions">
                    <button className="friend-btn pill success" onClick={() => handleAcceptRequest(request.id)}>
                      Accept
                    </button>
                    <button className="friend-btn pill danger" onClick={() => handleDeclineRequest(request.id)}>
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="friends-section">
          <div className="section-title-row">
            <h3>Add Friend</h3>
            <span className="section-chip">By display name</span>
          </div>
          <div className="add-friend-form">
            <input
              type="text"
              placeholder="Enter display name"
              value={addFriendName}
              onChange={(e) => setAddFriendName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendRequest()}
            />
            <button onClick={handleSendRequest} disabled={loading || !addFriendName.trim()}>
              {loading ? 'Sending...' : 'Send Request'}
            </button>
          </div>
        </div>

        <div className="friends-section">
          <div className="section-title-row">
            <h3>Your Friends ({friends.length})</h3>
          </div>
          {friends.length === 0 ? (
            <p className="no-friends">No friends yet. Add some above!</p>
          ) : (
            <div className="friends-list compact">
              {friends.map((friend) => (
                <div key={friend.id} className="friend-item-compact">
                  {renderAvatar(friend.displayName, friend.photoURL || friend.avatarUrl, {
                    frame: friend.equippedFrame,
                    background: friend.equippedBackground
                  })}
                  <div className="friend-info-compact">
                    <span className="friend-name-compact">{friend.displayName}</span>
                    <span className="friend-record">W-L-D {friend.rivalry?.wins || 0}-{friend.rivalry?.losses || 0}-{friend.rivalry?.draws || 0}</span>
                  </div>
                  <div className="friend-actions-compact">
                    <button className="friend-btn-icon primary" onClick={() => handleInvite(friend)} title="Invite to game">
                      🎮
                    </button>
                    <button className="friend-btn-icon danger" onClick={() => handleRemoveFriend(friend.id)} title="Remove friend">
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-buttons">
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default FriendsList;
