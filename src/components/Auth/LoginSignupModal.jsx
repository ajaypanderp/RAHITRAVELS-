import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './LoginSignupModal.css';

export const LoginSignupModal = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, signup } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password);
      }
      onClose();
    } catch (err) {
      let friendlyError = 'An error occurred. Please try again.';
      if (err.message.includes('invalid-credential') || err.message.includes('user-not-found') || err.message.includes('wrong-password')) {
        friendlyError = 'Invalid email or password.';
      } else if (err.message.includes('email-already-in-use')) {
        friendlyError = 'This email is already registered.';
      } else if (err.message.includes('weak-password')) {
        friendlyError = 'Password should be at least 6 characters.';
      }
      setError(friendlyError);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>&times;</button>
        <h2>{isLogin ? 'Login to Rahi Travels' : 'Sign Up for Rahi Travels'}</h2>
        
        {error && <p className="error-text">{error}</p>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
          <button type="submit" className="auth-submit-btn">
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <p className="toggle-text">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Sign Up' : 'Login'}
          </span>
        </p>
      </div>
    </div>
  );
};
