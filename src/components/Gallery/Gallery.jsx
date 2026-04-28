import React, { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import './Gallery.css';

export const Gallery = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="gallery-container"><p>Loading moments...</p></div>;
  if (photos.length === 0) return null; // Don't show the section if no photos exist

  return (
    <section className="gallery-section" id="gallery">
      <div className="gallery-header">
        <h2>Our Trust Moments</h2>
        <p>Glimpses of happy journeys with Rahi Travels</p>
      </div>
      <div className="gallery-grid">
        {photos.map((photo, index) => (
          <div key={index} className="gallery-item">
            <img src={photo.url} alt={`Trust Moment ${index + 1}`} loading="lazy" />
          </div>
        ))}
      </div>
    </section>
  );
};
