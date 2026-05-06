import React, { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import './Gallery.css';

export const Gallery = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const q = query(collection(db, "gallery"), limit(30));
        const querySnapshot = await getDocs(q);
        setPhotos(querySnapshot.docs.map(doc => doc.data()));
      } catch (error) {
        console.error("Error fetching gallery photos:", error);
      }
      setLoading(false);
    };

    fetchPhotos();
  }, []);

  if (loading) return <div className="gallery-container" style={{ textAlign: 'center', padding: '40px' }}><p>Loading moments...</p></div>;
  if (photos.length === 0) return null; // Don't show the section if no photos exist

  const displayedPhotos = showAll ? photos : photos.slice(0, 4);

  return (
    <section className="gallery-section" id="gallery" style={{ padding: '60px 20px', background: '#fff' }}>
      <div className="gallery-header" style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2 style={{ fontSize: '2.5rem', color: '#1e293b' }}>Our <span style={{ color: '#2563eb' }}>Trust Moments</span></h2>
        <p style={{ color: '#64748b' }}>Glimpses of happy journeys with Ayodhya Darshan Express</p>
      </div>
      <div className="gallery-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        {displayedPhotos.map((photo, index) => (
          <div key={index} className="gallery-item" style={{ borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <img src={photo.url} alt={`Trust Moment ${index + 1}`} loading="lazy" style={{ width: '100%', height: '250px', objectFit: 'cover', transition: 'transform 0.3s' }} onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'} onMouseLeave={(e) => e.target.style.transform = 'scale(1)'} />
          </div>
        ))}
      </div>
      
      {photos.length > 4 && (
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <button 
            onClick={() => setShowAll(!showAll)}
            style={{ padding: '12px 24px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '30px', fontSize: '1rem', cursor: 'pointer', fontWeight: 'bold' }}
          >
            {showAll ? 'Show Less' : 'View Full Gallery'}
          </button>
        </div>
      )}
    </section>
  );
};
