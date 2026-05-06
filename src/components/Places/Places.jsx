import React, { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

export const Places = () => {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const snapshot = await getDocs(collection(db, "places"));
        setPlaces(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("Error fetching places:", err);
      }
      setLoading(false);
    };
    fetchPlaces();
  }, []);

  if (loading) return null;
  if (places.length === 0) return null;

  return (
    <section className="places-section" style={{ padding: '60px 20px', background: '#f8fafc' }}>
      <div className="section-header" style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2 style={{ fontSize: '2.5rem', color: '#1e293b' }}>Our <span style={{ color: '#2563eb' }}>Destinations</span></h2>
        <p style={{ color: '#64748b' }}>Explore beautiful locations we serve</p>
      </div>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center', maxWidth: '1200px', margin: '0 auto' }}>
        {places.map(place => (
          <div key={place.id} style={{ width: '280px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', background: 'white', transition: 'transform 0.3s', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-10px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
            <img src={place.photoUrl} alt={place.name} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.25rem', color: '#1e293b', marginBottom: '10px' }}>{place.name}</h3>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
