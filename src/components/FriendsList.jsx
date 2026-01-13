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

function FriendsList({ onClose, user, onJoinGame }) {
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
    const result = await sendFriendRequest(user.uid, addFriendName, user.displayName || user.email);

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
      friend.displayName
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
      onJoinGame(result.roomId, 'O');
      onClose();
    }
  };

  const handleDeclineInvite = async (invite) => {
    soundManager.playClick();
    await declineGameInvite(invite.id, invite.roomId);
    loadGameInvites();
  };

  return (
    <div className="modal">
      <div className="modal-content friends-modal">
        <h2>FRIENDS</h2>

        {message && <div className="friends-message">{message}</div>}

        {gameInvites.length > 0 && (
          <div className="friends-section">
            <h3>Game Invites</h3>
            <div className="friends-list">
              {gameInvites.map((invite) => (
                <div key={invite.id} className="friend-item invite">
                  <span className="friend-name">{invite.fromDisplayName}</span>
                  <span className="friend-info">wants to play!</span>
                  <div className="friend-actions">
                    <button className="friend-btn accept" onClick={() => handleAcceptInvite(invite)}>
                      Accept
                    </button>
                    <button className="friend-btn decline" onClick={() => handleDeclineInvite(invite)}>
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
            <h3>Friend Requests</h3>
            <div className="friends-list">
              {requests.map((request) => (
                <div key={request.id} className="friend-item request">
                  <span className="friend-name">{request.fromDisplayName}</span>
                  <div className="friend-actions">
                    <button className="friend-btn accept" onClick={() => handleAcceptRequest(request.id)}>
                      Accept
                    </button>
                    <button className="friend-btn decline" onClick={() => handleDeclineRequest(request.id)}>
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="friends-section">
          <h3>Add Friend</h3>
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
          <h3>Your Friends ({friends.length})</h3>
          {friends.length === 0 ? (
            <p className="no-friends">No friends yet. Add some above!</p>
          ) : (
            <div className="friends-list">
              {friends.map((friend) => (
                <div key={friend.id} className="friend-item">
                  <span className="friend-name">{friend.displayName}</span>
                  <div className="friend-actions">
                    <button className="friend-btn invite" onClick={() => handleInvite(friend)}>
                      Invite
                    </button>
                    <button className="friend-btn remove" onClick={() => handleRemoveFriend(friend.id)}>
                      Remove
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
