import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebaseConfig';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate, useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import './AuthPage.css';

// Icons
import { FcGoogle } from 'react-icons/fc';
import { MdEmail } from 'react-icons/md';
import { FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';

export const AuthPage = () => {
  const [step, setStep] = useState(1); // 1: Email/Phone, 2: Login Password, 3: Signup Details, 4: OTP Verification
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState(''); // Just for signup details if needed, but email is primary
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, signup, checkUserExists, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Helper to parse Firebase errors nicely
  const parseError = (err) => {
    let msg = err.message || "An error occurred.";
    if (msg.includes('billing-not-enabled')) {
      return "Phone authentication requires a linked billing account in Firebase.";
    }
    if (msg.startsWith('Firebase: ')) {
      msg = msg.replace('Firebase: ', '');
    }
    msg = msg.replace(/\(auth\/.*\)\.?/, '').trim();
    if (msg.startsWith('Error ')) {
      msg = msg.replace('Error ', '');
    }
    return msg || "Authentication failed.";
  };

  // Handle Initial Email Submit
  const handleInitialSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email) {
      setError('Please enter your email.');
      setLoading(false);
      return;
    }
    try {
      const exists = await checkUserExists(email);
      if (exists) {
        setStep(2); // Move to login password
      } else {
        setStep(3); // Move to signup details
      }
    } catch (err) {
      // If email enumeration is disabled
      setStep(2); 
    }
    setLoading(false);
  };

  // Handle Login with Email & Password
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      if (err.message.includes('invalid-credential') || err.message.includes('user-not-found')) {
        // If user actually doesn't exist (due to email enum protection), switch to signup
        setError('Invalid credentials, or account not found.');
      } else {
        setError(parseError(err));
      }
    }
    setLoading(false);
  };

  // Handle Signup with Email & Password
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const userCredential = await signup(email, password);
      await setDoc(doc(db, "users", userCredential.user.uid), {
        uid: userCredential.user.uid,
        name: name,
        email: email,
        phone: phone || "",
        createdAt: serverTimestamp()
      });
      navigate('/');
    } catch (err) {
      setError(parseError(err));
    }
    setLoading(false);
  };



  // Handle Google Auth
  const handleGoogleAuth = async () => {
    try {
      const result = await loginWithGoogle();
      const user = result.user;
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          name: user.displayName || "Google User",
          email: user.email,
          phone: user.phoneNumber || "",
          photoURL: user.photoURL || "",
          createdAt: serverTimestamp()
        });
      }
      navigate('/');
    } catch (err) {
      setError(parseError(err));
    }
  };

  return (
    <div className="auth-page-container">
      {/* Background with clouds/sky effect as per design */}
      <div className="auth-bg"></div>

      <div className="auth-card">
        <div className="auth-card-inner">
          <div className="auth-icon-wrapper">
            <span className="auth-top-icon">🚗</span>
          </div>

          <h2>
            {step === 1 && 'Sign in with email'}
            {step === 2 && 'Welcome Back'}
            {step === 3 && 'Create Account'}
          </h2>
          <p className="auth-subtitle">
            {step === 1 && 'Book and manage your travels effortlessly with Ayodhya Darshan Express.'}
            {step === 2 && 'Enter your password to continue.'}
            {step === 3 && 'Just a few more details to get you started.'}
          </p>

          {error && <div className="auth-error">{error}</div>}

          {/* STEP 1: INITIAL INPUT */}
          {step === 1 && (
            <form onSubmit={handleInitialSubmit} className="auth-form">
              <div className="input-group">
                <MdEmail className="input-icon" />
                <input 
                  type="email" 
                  placeholder="Email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                />
              </div>

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? 'Checking...' : 'Continue'}
              </button>
            </form>
          )}

          {/* STEP 2: LOGIN PASSWORD */}
          {step === 2 && (
            <form onSubmit={handleLoginSubmit} className="auth-form">
              <div className="input-group">
                <MdEmail className="input-icon" />
                <input type="email" value={email} disabled />
              </div>
              <div className="input-group">
                <FiEyeOff className="input-icon" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
                <button type="button" className="toggle-pwd-btn" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FiEye /> : <FiEyeOff />}
                </button>
              </div>
              <div className="forgot-pwd">
                <a href="#">Forgot password?</a>
              </div>
              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? 'Logging in...' : 'Get Started'}
              </button>
              <div className="auth-method-toggle" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span onClick={() => setStep(1)} style={{ cursor: 'pointer' }}>Back</span>
                <span onClick={() => setStep(3)} style={{ cursor: 'pointer', color: '#2563eb', fontWeight: 'bold' }}>Create Account</span>
              </div>
            </form>
          )}

          {/* STEP 3: SIGNUP DETAILS */}
          {step === 3 && (
            <form onSubmit={handleSignupSubmit} className="auth-form">
              <div className="input-group">
                <input 
                  type="text" 
                  placeholder="Full Name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                  style={{ paddingLeft: '15px' }}
                />
              </div>
              <div className="input-group">
                <input 
                  type="tel" 
                  placeholder="Phone Number (e.g. +91...)" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  required 
                  style={{ paddingLeft: '15px' }}
                />
              </div>
              <div className="input-group">
                <FiEyeOff className="input-icon" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Create Password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
                <button type="button" className="toggle-pwd-btn" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FiEye /> : <FiEyeOff />}
                </button>
              </div>
              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? 'Creating...' : 'Create Account'}
              </button>
              <div className="auth-method-toggle" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span onClick={() => setStep(1)} style={{ cursor: 'pointer' }}>Back</span>
                <span onClick={() => setStep(2)} style={{ cursor: 'pointer', color: '#2563eb', fontWeight: 'bold' }}>Sign In</span>
              </div>
            </form>
          )}



          {/* SOCIAL LOGIN */}
          {step === 1 && (
            <>
              <div className="auth-separator">
                <span>Or sign in with</span>
              </div>
              
              <div className="social-auth-buttons">
                <button type="button" onClick={handleGoogleAuth} className="social-btn" title="Google">
                  <FcGoogle size={24} />
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};
