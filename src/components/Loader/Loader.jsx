import React from 'react';

export const Loader = () => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', width: '100%' }}>
      <div style={{ position: 'relative', width: '80px', height: '80px' }}>
        <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', animation: 'spin 2s linear infinite' }}>
          <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8" />
          <circle cx="50" cy="50" r="45" fill="none" stroke="#2563eb" strokeWidth="8" strokeDasharray="283" strokeDashoffset="75" strokeLinecap="round" />
        </svg>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#2563eb', fontSize: '24px' }}>
          <i className="ri-roadster-fill"></i>
        </div>
      </div>
      <style>
        {`
          @keyframes spin {
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};
