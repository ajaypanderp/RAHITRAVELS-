import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebaseConfig';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate, useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import './AuthPage.css';

// Icons
import { FcGoogle } from 'react-icons/fc';
import { FaPhoneAlt } from 'react-icons/fa';
import { FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import { MdEmail } from 'react-icons/md';

export const AuthPage = () => {
  const [step, setStep] = useState(1); // 1: Email/Phone, 2: Login Password, 3: Signup Details, 4: OTP Verification
  const [authMethod, setAuthMethod] = useState('email'); // 'email' or 'phone'
  
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+91');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, signup, checkUserExists, loginWithGoogle, setupRecaptcha, loginWithPhone } = useAuth();
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

  // Handle Initial Email/Phone Submit
  const handleInitialSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (authMethod === 'email') {
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
        // If email enumeration is disabled, fetchSignInMethods might fail. 
        // We can just go to password step, and if it fails, fallback to signup.
        setStep(2); 
      }
    } else {
      // Phone Auth
      if (!phone || phone.length < 10) {
        setError('Please enter a valid phone number.');
        setLoading(false);
        return;
      }
      try {
        const appVerifier = setupRecaptcha('recaptcha-container');
        const confirmation = await loginWithPhone(phone, appVerifier);
        setConfirmationResult(confirmation);
        setStep(4); // Move to OTP
      } catch (err) {
        setError(parseError(err));
        // Reset recaptcha on error
        if (window.recaptchaVerifier) {
          window.recaptchaVerifier.clear();
          window.recaptchaVerifier = null;
        }
      }
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

  // Handle OTP Verification
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await confirmationResult.confirm(otp);
      const user = result.user;
      
      // Check if user exists in db
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        // If not, we might want to ask for name, but for simplicity we save what we have
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          name: name || "User",
          phone: user.phoneNumber,
          email: email || "",
          createdAt: serverTimestamp()
        });
      }
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
            <FiArrowRight className="auth-top-icon" />
          </div>

          <h2>
            {step === 1 && (authMethod === 'email' ? 'Sign in with email' : 'Sign in with phone')}
            {step === 2 && 'Welcome Back'}
            {step === 3 && 'Create Account'}
            {step === 4 && 'Verify Phone'}
          </h2>
          <p className="auth-subtitle">
            {step === 1 && 'Book and manage your travels effortlessly with Ayodhya Darshan Express.'}
            {step === 2 && 'Enter your password to continue.'}
            {step === 3 && 'Just a few more details to get you started.'}
            {step === 4 && 'Enter the OTP sent to your phone.'}
          </p>

          {error && <div className="auth-error">{error}</div>}

          {/* STEP 1: INITIAL INPUT */}
          {step === 1 && (
            <form onSubmit={handleInitialSubmit} className="auth-form">
              {authMethod === 'email' ? (
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
              ) : (
                <div className="input-group">
                  <FaPhoneAlt className="input-icon" />
                  <input 
                    type="tel" 
                    placeholder="Phone (e.g. +91...)" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    required 
                  />
                </div>
              )}
              
              <div id="recaptcha-container"></div>

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
              <div className="auth-method-toggle">
                <span onClick={() => setStep(1)}>Back</span>
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
              <div className="auth-method-toggle">
                <span onClick={() => setStep(1)}>Back</span>
              </div>
            </form>
          )}

          {/* STEP 4: OTP */}
          {step === 4 && (
            <form onSubmit={handleOtpSubmit} className="auth-form">
              <div className="input-group">
                <input 
                  type="text" 
                  placeholder="Enter 6-digit OTP" 
                  value={otp} 
                  onChange={(e) => setOtp(e.target.value)} 
                  required 
                  style={{ paddingLeft: '15px', letterSpacing: '2px' }}
                />
              </div>
              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
              <div className="auth-method-toggle">
                <span onClick={() => setStep(1)}>Back</span>
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
                {authMethod === 'email' ? (
                  <button type="button" onClick={() => setAuthMethod('phone')} className="social-btn" title="Phone">
                    <FaPhoneAlt size={20} color="#2563eb" />
                  </button>
                ) : (
                  <button type="button" onClick={() => setAuthMethod('email')} className="social-btn" title="Email">
                    <MdEmail size={24} color="#ef4444" />
                  </button>
                )}
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};
