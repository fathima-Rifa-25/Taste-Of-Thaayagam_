import { useEffect, useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { USER_API } from '../../services/api';
import './Settings.css';

const AddNote = ({ onAdd }) => {
  const [text, setText] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const handleAdd = () => {
    if (!text.trim()) return;
    onAdd(text.trim(), date);
    setText('');
  };

  return (
    <div className="add-note">
      <input
        className="date-input"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
      <textarea
        className="note-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write a note..."
      />
      <div className="add-note-actions">
        <button className="btn add-btn" onClick={handleAdd}>Add Note</button>
      </div>
    </div>
  );
};

AddNote.propTypes = {
  onAdd: PropTypes.func.isRequired,
};

const Settings = () => {
  const rawUser = JSON.parse(localStorage.getItem('user') || '{}');
  const [firstName, setFirstName] = useState(rawUser.firstName || '');
  const [lastName, setLastName] = useState(rawUser.lastName || '');
  const [email, setEmail] = useState(rawUser.email || '');
  const [password, setPassword] = useState('');
  const [profileImage, setProfileImage] = useState(localStorage.getItem('adminProfileImage') || '');
  const [notes, setNotes] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('adminNotes') || '[]');
    } catch {
      return [];
    }
  });

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      localStorage.setItem('adminProfileImage', result);
      setProfileImage(result);
      toast.success('Profile image updated');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const userId = rawUser._id || rawUser.id;
      if (!userId) return toast.info('User ID missing');

      const payload = { firstName, lastName, email };
      if (password) payload.password = password;

      await axios.put(`${USER_API}/${userId}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const updatedUser = { ...rawUser, firstName, lastName, email };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      toast.success('Profile updated');
    } catch (error) {
      console.error(error);
      toast.error('Error saving profile');
    }
  };

  const addNote = (text, date) => {
    const newNote = { id: Date.now(), text, date };
    const updatedNotes = [newNote, ...notes];
    setNotes(updatedNotes);
    localStorage.setItem('adminNotes', JSON.stringify(updatedNotes));
    toast.success('Note added');
  };

  const deleteNote = (id) => {
    const updatedNotes = notes.filter(note => note.id !== id);
    setNotes(updatedNotes);
    localStorage.setItem('adminNotes', JSON.stringify(updatedNotes));
  };

  return (
    <div className="settings-page">
      <div className="settings-grid">
        <div className="card profile-card">
          <h3 className="card-title">Account Information</h3>

          {/* Avatar and Change Photo side by side */}
          <div className="avatar-section">
            <div className="avatar">
              {profileImage ? (
                <img src={profileImage} alt="Admin" />
              ) : (
                <div className="avatar-placeholder">
                  {(firstName || 'A').charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="photo-row">
              <label className="file-label">
                Change Profile Photo
                <input type="file" accept="image/*" onChange={handleImageChange} />
              </label>
            </div>
          </div>

          <div className="profile-fields">
            <div className="field-row">
              <label>First Name</label>
              <input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div className="field-row">
              <label>Last Name</label>
              <input value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
            <div className="field-row">
              <label>Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="field-row">
              <label>New Password</label>
              <input
                type="password"
                placeholder="Leave blank to keep current"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="profile-actions">
            <button className="save-btn primary" onClick={handleSaveProfile}>Save Profile</button>
          </div>
        </div>

        <div className="card notes-card">
          <h3 className="card-title">Admin Notes</h3>
          <AddNote onAdd={addNote} />
          <div className="notes-list">
            {notes.length === 0 ? (
              <p className="muted">No notes available</p>
            ) : (
              notes.map(note => (
                <div className="note-item" key={note.id}>
                  <div className="note-meta">
                    <div className="note-date">{note.date}</div>
                    <button className="delete-note" onClick={() => deleteNote(note.id)}>Delete</button>
                  </div>
                  <div className="note-text">{note.text}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
