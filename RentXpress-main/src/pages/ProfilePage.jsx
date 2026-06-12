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
  const [editCount, setEditCount] = useState(0);
  const [adminPhone, setAdminPhone] = useState('');

  const isLocked = false;

  useEffect(() => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }
    const fetchProfile = async () => {
      try {
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setName(data.name || '');
          setPhone(data.phone || '');
          setEditCount(0);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };
    const fetchAdminPhone = async () => {
      try {
        const settingsSnap = await getDoc(doc(db, "settings", "whatsapp"));
        if (settingsSnap.exists()) {
          setAdminPhone(settingsSnap.data().phone || '');
        }
      } catch (err) {
        console.error("Error fetching admin phone:", err);
      }
    };
    fetchProfile();
    fetchAdminPhone();
  }, [currentUser, navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!name.trim() || !phone.trim()) {
      setMessage('Name and Phone number cannot be empty.');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        name,
        phone,
        editCount: 0,
        isLocked: false
      });
      setEditCount(0);
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
            disabled={isLocked}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: isLocked ? '#f3f4f6' : 'white', color: isLocked ? '#6b7280' : 'black' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Phone Number</label>
          <input 
            type="tel" 
            value={phone} 
            onChange={(e) => setPhone(e.target.value)} 
            disabled={isLocked}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: isLocked ? '#f3f4f6' : 'white', color: isLocked ? '#6b7280' : 'black' }}
          />
        </div>

        {isLocked ? (
          <div style={{ padding: '15px', backgroundColor: '#fef3c7', color: '#d97706', borderRadius: '8px', marginTop: '10px', fontSize: '0.9rem', border: '1px solid #fcd34d' }}>
            <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>🔒 Profile details are locked and bound to your account.</p>
            <p style={{ margin: '0 0 10px 0' }}>To change your registered Name or Phone number, request the owner.</p>
            <button 
              type="button"
              onClick={() => {
                const message = `Hello, I would like to request a profile details change (Name/Number) for my account. My current details are:\nName: ${name}\nPhone: ${phone}`;
                const encodedMsg = encodeURIComponent(message);
                const phoneNum = adminPhone || "+919876543210";
                window.open(`https://wa.me/${phoneNum.replace('+', '')}?text=${encodedMsg}`, '_blank');
              }}
              style={{ padding: '8px 16px', backgroundColor: '#d97706', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              💬 Request Owner via WhatsApp
            </button>
          </div>
        ) : (
          <button 
            type="submit" 
            disabled={loading}
            style={{ padding: '14px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', marginTop: '10px' }}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        )}
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
