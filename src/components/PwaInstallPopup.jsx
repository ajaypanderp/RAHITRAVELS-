import React, { useState, useEffect } from 'react';

export const PwaInstallPopup = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
      // Only show if they haven't dismissed it recently
      const dismissed = localStorage.getItem('pwa_dismissed');
      if (!dismissed) {
        setShowPopup(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setShowPopup(false);
  };

  const handleDismiss = () => {
    setShowPopup(false);
    localStorage.setItem('pwa_dismissed', 'true');
  };

  if (!showPopup) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: '#fff',
      padding: '16px 20px',
      borderRadius: '12px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
      zIndex: 9999,
      width: '90%',
      maxWidth: '400px',
      border: '1px solid #e2e8f0'
    }}>
      <div style={{ flex: 1 }}>
        <h4 style={{ margin: 0, fontSize: '1rem', color: '#0f172a' }}>Install Our App</h4>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Get quick access and view your bookings easily.</p>
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={handleDismiss} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.9rem' }}>Later</button>
        <button onClick={handleInstallClick} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem' }}>Install</button>
      </div>
    </div>
  );
};
