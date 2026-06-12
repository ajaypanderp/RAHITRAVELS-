import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebaseConfig';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { gsap } from 'gsap';
import './LoginSignupModal.css';

export const LoginSignupModal = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();
  
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen && modalRef.current) {
        gsap.fromTo(modalRef.current, 
            { opacity: 0, y: 50, scale: 0.9 },
            { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: 'power2.out' }
        );
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isLogin) {
        let loginEmail = email;
        if (!loginEmail && phone) {
            loginEmail = `${phone}@ayodhyadarshanexpress.com`;
        }
        await login(loginEmail, password);
      } else {
        if (!name || !phone || !password) {
            throw new Error("Name, Phone, and Password are required.");
        }
        let signupEmail = email;
        if (!signupEmail) {
            signupEmail = `${phone}@ayodhyadarshanexpress.com`;
        }
        const userCredential = await signup(signupEmail, password);
        const user = userCredential.user;
        
        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            name: name,
            phone: phone,
            email: email || "",
            createdAt: serverTimestamp()
        });
      }
      onClose();
    } catch (err) {
      let friendlyError = err.message;
      if (err.message.includes('invalid-credential') || err.message.includes('user-not-found') || err.message.includes('wrong-password')) {
        friendlyError = 'Invalid credentials.';
      } else if (err.message.includes('email-already-in-use')) {
        friendlyError = 'This account is already registered.';
      } else if (err.message.includes('weak-password')) {
        friendlyError = 'Password should be at least 6 characters.';
      }
      setError(friendlyError);
    }
    setLoading(false);
  };

  return (
    <div className="modal-overlay">
      <div 
        ref={modalRef}
        className="modal-content"
        style={{ borderRadius: '15px', overflow: 'hidden', padding: '0', background: 'linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
      >
        <div style={{ position: 'relative', padding: '40px', textAlign: 'center' }}>
            <button className="close-btn" onClick={onClose} style={{ position: 'absolute', top: '15px', right: '20px', fontSize: '24px', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>&times;</button>
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', marginBottom: '10px' }}>
                {isLogin ? 'Welcome Back' : 'Join Ayodhya Darshan Express'}
            </h2>
            <p style={{ color: '#6b7280', marginBottom: '20px' }}>
                {isLogin ? 'Enter your details to access your account' : 'Create an account to book and manage your travels'}
            </p>
            
            {error && <p className="error-text" style={{ color: '#ef4444', backgroundColor: '#fee2e2', padding: '10px', borderRadius: '8px', marginBottom: '20px' }}>{error}</p>}
            
            <form onSubmit={handleSubmit} className="auth-form" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            
            {!isLogin && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <input 
                        type="text" 
                        placeholder="Full Name" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        required={!isLogin}
                        style={{ padding: '12px 15px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', fontSize: '1rem' }}
                    />
                    <input 
                        type="tel" 
                        placeholder="Phone Number" 
                        value={phone} 
                        onChange={(e) => setPhone(e.target.value)} 
                        required={!isLogin}
                        style={{ padding: '12px 15px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', fontSize: '1rem' }}
                    />
                </div>
            )}

            {isLogin && (
                <input 
                    type="text" 
                    placeholder="Email or Phone Number" 
                    value={email || phone} 
                    onChange={(e) => {
                        const val = e.target.value;
                        if (val.includes('@')) setEmail(val);
                        else {
                            setPhone(val);
                            setEmail('');
                        }
                    }} 
                    required 
                    style={{ padding: '12px 15px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', fontSize: '1rem' }}
                />
            )}
            {!isLogin && (
                <input 
                    type="email" 
                    placeholder="Email Address (Optional)" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    style={{ padding: '12px 15px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', fontSize: '1rem' }}
                />
            )}
            <input 
                type="password" 
                placeholder="Password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                style={{ padding: '12px 15px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', fontSize: '1rem' }}
            />
            <button type="submit" disabled={loading} style={{ padding: '14px', borderRadius: '8px', border: 'none', background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)', color: 'white', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px', boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.5)' }}>
                {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
            </button>
            </form>

            <p style={{ marginTop: '20px', color: '#6b7280' }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span 
                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                style={{ color: '#2563eb', fontWeight: 'bold', cursor: 'pointer' }}
            >
                {isLogin ? 'Sign Up' : 'Login'}
            </span>
            </p>
        </div>
      </div>
    </div>
  );
};
