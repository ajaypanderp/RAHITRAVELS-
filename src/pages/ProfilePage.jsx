import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export const ProfilePage = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }
    const fetchProfile = async () => {
      const docRef = doc(db, 'users', currentUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setName(data.name || '');
        setPhone(data.phone || '');
      }
    };
    fetchProfile();
  }, [currentUser, navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        name,
        phone
      });
      setMessage('Profile updated successfully!');
    } catch (error) {
      setMessage('Failed to update profile: ' + error.message);
    }
    setLoading(false);
  };

  if (!currentUser) return null;

  return (
    <div style={{ padding: '40px 20px', maxWidth: '600px', margin: '0 auto', minHeight: '60vh' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '20px', color: '#111' }}>My Profile</h2>
      
      {message && (
        <div style={{ padding: '15px', backgroundColor: message.includes('Failed') ? '#fee2e2' : '#dcfce7', color: message.includes('Failed') ? '#ef4444' : '#166534', borderRadius: '8px', marginBottom: '20px' }}>
          {message}
        </div>
      )}

      <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Email Address</label>
          <input 
            type="email" 
            value={currentUser.email || ''} 
            disabled 
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: '#f3f4f6', color: '#6b7280' }}
          />
          <small style={{ color: '#6b7280' }}>Email cannot be changed directly.</small>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Full Name</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Phone Number</label>
          <input 
            type="tel" 
            value={phone} 
            onChange={(e) => setPhone(e.target.value)} 
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db' }}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ padding: '14px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', marginTop: '10px' }}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>

      <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
        <button 
          onClick={logout}
          style={{ padding: '12px 20px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          Logout
        </button>
      </div>
    </div>
  );
};
