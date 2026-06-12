import React from 'react';

export const Loader = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw', backgroundColor: '#f8fafc', position: 'fixed', top: 0, left: 0, zIndex: 9999 }}>
      <div style={{ position: 'relative', width: '80px', height: '80px', marginBottom: '20px' }}>
        <svg className="animate-spin" viewBox="0 0 100 100" style={{ width: '100%', height: '100%', animation: 'spin 1.5s linear infinite' }}>
          <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="8" />
          <circle cx="50" cy="50" r="45" fill="none" stroke="#3b82f6" strokeWidth="8" strokeDasharray="283" strokeDashoffset="75" strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }} />
        </svg>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#3b82f6', fontSize: '28px' }}>
          <i className="ri-roadster-fill"></i>
        </div>
      </div>
      <h2 style={{ color: '#1e293b', fontSize: '1.25rem', fontWeight: '600', letterSpacing: '0.05em', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
        Ayodhya Darshan Express
      </h2>
      <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '8px' }}>Preparing your journey...</p>
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: .5; }
          }
        `}
      </style>
    </div>
  );
};
