import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import {
  addCustomAvatar,
  updateCustomAvatar,
  deleteCustomAvatar,
  fetchCustomAvatars
} from '../utils/shopManager';

// Cloudinary config - unsigned uploads (100% FREE & SECURE!)
// These values are PUBLIC and safe to expose in frontend
const CLOUDINARY_CLOUD_NAME = 'dijsoag1f';
const CLOUDINARY_UPLOAD_PRESET = 'avatars'; // Must be set to "unsigned" in Cloudinary dashboard

/**
 * Admin Panel for Managing Custom Avatars
 * Only accessible to admin users
 */
function AdminAvatarManager({ user, onClose }) {
  const [customAvatars, setCustomAvatars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  // Form state for new avatar
  const [newAvatar, setNewAvatar] = useState({
    name: '',
    description: '',
    price: 0,
    color: '#667eea',
    imageFile: null,
    ringScale: 1.35,
    ringOffsetX: 0,
    ringOffsetY: 0
  });
  
  // Edit mode
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const [previewObjectUrl, setPreviewObjectUrl] = useState(null);

  useEffect(() => {
    loadAvatars();
  }, []);

  useEffect(() => {
    if (!newAvatar.imageFile) {
      if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);
      setPreviewObjectUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(newAvatar.imageFile);
    if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);
    setPreviewObjectUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newAvatar.imageFile]);

  const loadAvatars = async () => {
    try {
      const avatars = await fetchCustomAvatars(db);
      setCustomAvatars(avatars);
    } catch (error) {
      console.error('Error loading custom avatars:', error);
      alert('Failed to load avatars');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('Image must be less than 2MB');
        return;
      }
      setNewAvatar({ ...newAvatar, imageFile: file });
    }
  };

  const uploadImage = async (file) => {
    try {
      console.log('[Admin Upload] Uploading to Cloudinary...');

      // Use Cloudinary's unsigned upload (100% FREE, no Cloud Functions needed!)
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      formData.append('folder', 'custom-avatars');

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error('[Admin Upload] Cloudinary error:', data);
        throw new Error(data?.error?.message || 'Failed to upload image to Cloudinary');
      }

      console.log('[Admin Upload] Upload successful:', data.secure_url);
      return data.secure_url || data.url;
    } catch (error) {
      console.error('[Admin Upload] Upload failed:', error);
      throw new Error(error.message || 'Failed to upload image');
    }
  };

  const handleAddAvatar = async (e) => {
    e.preventDefault();
    
    if (!newAvatar.name || !newAvatar.imageFile) {
      alert('Please provide avatar name and image');
      return;
    }

    setUploading(true);
    try {
      // Upload image to Firebase Storage
      const imageUrl = await uploadImage(newAvatar.imageFile);
      
      // Add avatar to Firestore
      const avatar = await addCustomAvatar({
        name: newAvatar.name,
        description: newAvatar.description,
        price: parseInt(newAvatar.price) || 0,
        color: newAvatar.color,
        imageUrl: imageUrl,
        ringScale: Number(newAvatar.ringScale),
        ringOffsetX: Number(newAvatar.ringOffsetX),
        ringOffsetY: Number(newAvatar.ringOffsetY)
      }, db);
      
      // Update local state
      setCustomAvatars([...customAvatars, avatar]);
      
      // Reset form
      setNewAvatar({
        name: '',
        description: '',
        price: 0,
        color: '#667eea',
        imageFile: null,
        ringScale: 1.35,
        ringOffsetX: 0,
        ringOffsetY: 0
      });
      
      alert('Avatar added successfully!');
    } catch (error) {
      console.error('Error adding avatar:', error);
      alert('Failed to add avatar: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleEditAvatar = (avatar) => {
    setEditingId(avatar.id);
    setEditForm({
      name: avatar.name,
      description: avatar.description,
      price: avatar.price,
      color: avatar.color,
      ringScale: Number.isFinite(avatar.ringScale) ? avatar.ringScale : 1.35,
      ringOffsetX: Number.isFinite(avatar.ringOffsetX) ? avatar.ringOffsetX : 0,
      ringOffsetY: Number.isFinite(avatar.ringOffsetY) ? avatar.ringOffsetY : 0
    });
  };

  const handleUpdateAvatar = async (avatarId) => {
    try {
      await updateCustomAvatar(avatarId, editForm, db);
      
      // Update local state
      setCustomAvatars(customAvatars.map(a => 
        a.id === avatarId ? { ...a, ...editForm } : a
      ));
      
      setEditingId(null);
      alert('Avatar updated successfully!');
    } catch (error) {
      console.error('Error updating avatar:', error);
      alert('Failed to update avatar');
    }
  };

  const handleDeleteAvatar = async (avatarId) => {
    if (!window.confirm('Are you sure you want to delete this avatar? This cannot be undone.')) {
      return;
    }

    try {
      await deleteCustomAvatar(avatarId, db);
      
      // Update local state
      setCustomAvatars(customAvatars.filter(a => a.id !== avatarId));
      
      alert('Avatar deleted successfully!');
    } catch (error) {
      console.error('Error deleting avatar:', error);
      alert('Failed to delete avatar');
    }
  };

  if (loading) {
    return (
      <div className="modal">
        <div className="modal-content">
          <h2>Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="modal">
      <div className="modal-content admin-panel">
        <h2>🔧 Admin Avatar Manager</h2>
        <p className="admin-subtitle">Upload and manage custom avatars</p>

        {/* Add New Avatar Form */}
        <div className="admin-section">
          <h3>Add New Avatar</h3>
          <form onSubmit={handleAddAvatar} className="admin-form">
            <div className="form-group">
              <label>Avatar Name *</label>
              <input
                type="text"
                value={newAvatar.name}
                onChange={(e) => setNewAvatar({ ...newAvatar, name: e.target.value })}
                placeholder="e.g., Cool Dragon"
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={newAvatar.description}
                onChange={(e) => setNewAvatar({ ...newAvatar, description: e.target.value })}
                placeholder="Describe this avatar..."
                rows="2"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Price (coins) *</label>
                <input
                  type="number"
                  value={newAvatar.price}
                  onChange={(e) => setNewAvatar({ ...newAvatar, price: e.target.value })}
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label>Border Color</label>
                <input
                  type="color"
                  value={newAvatar.color}
                  onChange={(e) => setNewAvatar({ ...newAvatar, color: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Avatar Image * (Max 2MB, PNG/JPG)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                required
              />
              {newAvatar.imageFile && (
                <div className="file-preview">
                  Selected: {newAvatar.imageFile.name}
                </div>
              )}
            </div>

            {previewObjectUrl && (
              <div className="form-group">
                <label>Ring Position Preview</label>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <div style={{ width: 110, height: 110, position: 'relative' }}>
                    <div
                      style={{
                        width: 110,
                        height: 110,
                        borderRadius: '50%',
                        background: 'rgba(26, 26, 46, 0.6)',
                        border: `3px solid ${newAvatar.color}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        overflow: 'visible'
                      }}
                    >
                      <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff', position: 'relative', zIndex: 1 }}>
                        A
                      </div>
                      <img
                        src={previewObjectUrl}
                        alt="Ring Preview"
                        draggable={false}
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          width: '100%',
                          height: '100%',
                          transform: `translate(-50%, -50%) translate(${Number(newAvatar.ringOffsetX) || 0}px, ${Number(newAvatar.ringOffsetY) || 0}px) scale(${Number(newAvatar.ringScale) || 1.35})`,
                          objectFit: 'contain',
                          pointerEvents: 'none',
                          zIndex: 2
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label>Ring Scale</label>
                <input
                  type="range"
                  min="0.8"
                  max="2.5"
                  step="0.05"
                  value={newAvatar.ringScale}
                  onChange={(e) => setNewAvatar({ ...newAvatar, ringScale: parseFloat(e.target.value) })}
                />
                <div className="file-preview">{Number(newAvatar.ringScale).toFixed(2)}</div>
              </div>
              <div className="form-group">
                <label>Ring Offset X</label>
                <input
                  type="range"
                  min="-40"
                  max="40"
                  step="1"
                  value={newAvatar.ringOffsetX}
                  onChange={(e) => setNewAvatar({ ...newAvatar, ringOffsetX: parseInt(e.target.value, 10) })}
                />
                <div className="file-preview">{Number(newAvatar.ringOffsetX) || 0}px</div>
              </div>
              <div className="form-group">
                <label>Ring Offset Y</label>
                <input
                  type="range"
                  min="-40"
                  max="40"
                  step="1"
                  value={newAvatar.ringOffsetY}
                  onChange={(e) => setNewAvatar({ ...newAvatar, ringOffsetY: parseInt(e.target.value, 10) })}
                />
                <div className="file-preview">{Number(newAvatar.ringOffsetY) || 0}px</div>
              </div>
            </div>

            <button 
              type="submit" 
              className="admin-btn primary"
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : '➕ Add Avatar'}
            </button>
          </form>
        </div>

        {/* Existing Avatars List */}
        <div className="admin-section">
          <h3>Existing Custom Avatars ({customAvatars.length})</h3>
          <div className="avatar-list">
            {customAvatars.length === 0 ? (
              <p className="empty-state">No custom avatars yet. Add your first one above!</p>
            ) : (
              customAvatars.map((avatar) => (
                <div key={avatar.id} className="avatar-item">
                  {editingId === avatar.id ? (
                    // Edit mode
                    <div className="avatar-edit">
                      <div className="avatar-preview-small">
                        <div style={{ width: 64, height: 64, position: 'relative', margin: '0 auto' }}>
                          <div
                            style={{
                              width: 64,
                              height: 64,
                              borderRadius: '50%',
                              background: 'rgba(26, 26, 46, 0.6)',
                              border: `3px solid ${editForm.color || avatar.color || '#667eea'}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              position: 'relative',
                              overflow: 'visible'
                            }}
                          >
                            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', position: 'relative', zIndex: 1 }}>
                              A
                            </div>
                            <img
                              src={avatar.imageUrl}
                              alt={avatar.name}
                              draggable={false}
                              style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                width: '100%',
                                height: '100%',
                                transform: `translate(-50%, -50%) translate(${Number(editForm.ringOffsetX) || 0}px, ${Number(editForm.ringOffsetY) || 0}px) scale(${Number(editForm.ringScale) || 1.35})`,
                                objectFit: 'contain',
                                pointerEvents: 'none',
                                zIndex: 2
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="avatar-edit-form">
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          placeholder="Name"
                        />
                        <input
                          type="text"
                          value={editForm.description}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          placeholder="Description"
                        />
                        <input
                          type="number"
                          value={editForm.price}
                          onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                          placeholder="Price"
                        />
                        <input
                          type="color"
                          value={editForm.color}
                          onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                        />

                        <div style={{ display: 'grid', gap: 8, marginTop: 8 }}>
                          <label style={{ fontSize: 12, opacity: 0.85 }}>Ring Scale: {Number(editForm.ringScale || 1.35).toFixed(2)}</label>
                          <input
                            type="range"
                            min="0.8"
                            max="2.5"
                            step="0.05"
                            value={editForm.ringScale}
                            onChange={(e) => setEditForm({ ...editForm, ringScale: parseFloat(e.target.value) })}
                          />

                          <label style={{ fontSize: 12, opacity: 0.85 }}>Ring Offset X: {Number(editForm.ringOffsetX || 0)}px</label>
                          <input
                            type="range"
                            min="-40"
                            max="40"
                            step="1"
                            value={editForm.ringOffsetX}
                            onChange={(e) => setEditForm({ ...editForm, ringOffsetX: parseInt(e.target.value, 10) })}
                          />

                          <label style={{ fontSize: 12, opacity: 0.85 }}>Ring Offset Y: {Number(editForm.ringOffsetY || 0)}px</label>
                          <input
                            type="range"
                            min="-40"
                            max="40"
                            step="1"
                            value={editForm.ringOffsetY}
                            onChange={(e) => setEditForm({ ...editForm, ringOffsetY: parseInt(e.target.value, 10) })}
                          />
                        </div>
                      </div>
                      <div className="avatar-actions">
                        <button 
                          className="admin-btn small success"
                          onClick={() => handleUpdateAvatar(avatar.id)}
                        >
                          ✓ Save
                        </button>
                        <button 
                          className="admin-btn small"
                          onClick={() => setEditingId(null)}
                        >
                          ✕ Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View mode
                    <div className="avatar-view">
                      <div className="avatar-preview">
                        <img src={avatar.imageUrl} alt={avatar.name} />
                      </div>
                      <div className="avatar-info">
                        <h4>{avatar.name}</h4>
                        <p>{avatar.description}</p>
                        <div className="avatar-meta">
                          <span className="price">💰 {avatar.price} coins</span>
                          <span className="color" style={{ background: avatar.color }}></span>
                        </div>
                      </div>
                      <div className="avatar-actions">
                        <button 
                          className="admin-btn small"
                          onClick={() => handleEditAvatar(avatar)}
                        >
                          ✏️ Edit
                        </button>
                        <button 
                          className="admin-btn small danger"
                          onClick={() => handleDeleteAvatar(avatar.id)}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="modal-buttons">
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default AdminAvatarManager;
