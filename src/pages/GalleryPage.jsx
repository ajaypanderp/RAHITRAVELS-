import React, { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

export const GalleryPage = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchPhotos = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "gallery"));
        setPhotos(querySnapshot.docs.map(doc => doc.data()));
      } catch (error) {
        console.error("Error fetching gallery photos:", error);
      }
      setLoading(false);
    };

    fetchPhotos();
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}><p>Loading Full Gallery...</p></div>;

  return (
    <div style={{ padding: '100px 20px 60px', background: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2 style={{ fontSize: '2.5rem', color: '#1e293b' }}>Complete <span style={{ color: '#2563eb' }}>Trust Moments</span></h2>
        <p style={{ color: '#64748b' }}>Every step of the journey, captured.</p>
      </div>
      
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '20px', 
        maxWidth: '1200px', 
        margin: '0 auto',
        justifyContent: 'center'
      }}>
        {photos.map((photo, index) => (
          <div key={index} style={{ 
            borderRadius: '12px', 
            overflow: 'hidden', 
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            width: '100%',
            maxWidth: '350px',
            flexGrow: 1
          }}>
            <img 
              src={photo.url} 
              alt={`Gallery Item ${index + 1}`} 
              loading="lazy" 
              style={{ width: '100%', height: '300px', objectFit: 'cover', transition: 'transform 0.3s' }} 
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'} 
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'} 
            />
          </div>
        ))}
      </div>
      
      {photos.length === 0 && (
        <div style={{ textAlign: 'center', color: '#64748b', fontSize: '1.2rem' }}>
          No gallery photos available yet.
        </div>
      )}
    </div>
  );
};
