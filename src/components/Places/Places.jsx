import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { gsap } from 'gsap';

const defaultPlaces = [
  { id: 'default1', name: 'Ayodhya', photoUrl: 'https://images.unsplash.com/photo-1706692997103-6cb6388dece2?q=80&w=800&auto=format&fit=crop' },
  { id: 'default2', name: 'Varanasi', photoUrl: 'https://images.unsplash.com/photo-1561359313-0639aad49ca6?q=80&w=800&auto=format&fit=crop' },
  { id: 'default3', name: 'Prayagraj', photoUrl: 'https://images.unsplash.com/photo-1622308644420-b3020689b14b?q=80&w=800&auto=format&fit=crop' },
  { id: 'default4', name: 'Naimisharanya', photoUrl: 'https://images.unsplash.com/photo-1600078686884-934d4e339b60?q=80&w=800&auto=format&fit=crop' },
  { id: 'default5', name: 'Kainchi Dham', photoUrl: 'https://images.unsplash.com/photo-1583244532205-d4e511477484?q=80&w=800&auto=format&fit=crop' },
  { id: 'default6', name: 'Gaya', photoUrl: 'https://images.unsplash.com/photo-1621213596702-8618ba6b48ba?q=80&w=800&auto=format&fit=crop' },
  { id: 'default7', name: 'Mathura', photoUrl: 'https://images.unsplash.com/photo-1658428230554-dbf471e9a2b7?q=80&w=800&auto=format&fit=crop' },
  { id: 'default8', name: 'Vrindavan', photoUrl: 'https://images.unsplash.com/photo-1681283737525-4c0d024621c5?q=80&w=800&auto=format&fit=crop' },
  { id: 'default9', name: 'Chitrakoot', photoUrl: 'https://images.unsplash.com/photo-1634152962476-4b8a00e1915c?q=80&w=800&auto=format&fit=crop' }
];

export const Places = () => {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const slideRef = useRef(null);

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const snapshot = await getDocs(collection(db, "places"));
        const fetchedPlaces = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Use default places if nothing is added in DB yet, or merge them.
        setPlaces(fetchedPlaces.length > 0 ? fetchedPlaces : defaultPlaces);
      } catch (err) {
        console.error("Error fetching places:", err);
        setPlaces(defaultPlaces);
      }
      setLoading(false);
    };
    fetchPlaces();
  }, []);

  useEffect(() => {
    if (places.length <= 1) return;

    const interval = setInterval(() => {
      gsap.to(slideRef.current, {
        opacity: 0,
        duration: 0.5,
        onComplete: () => {
          setCurrentIndex((prev) => (prev + 1) % places.length);
          gsap.to(slideRef.current, {
            opacity: 1,
            duration: 0.5
          });
        }
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [places.length]);

  if (loading) return null;
  if (places.length === 0) return null;

  const currentPlace = places[currentIndex];

  return (
    <section className="places-section" style={{ padding: '60px 20px', background: '#f8fafc' }}>
      <div className="section-header" style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2 style={{ fontSize: '2.5rem', color: '#1e293b' }}>Our <span style={{ color: '#2563eb' }}>Destinations</span></h2>
        <p style={{ color: '#64748b' }}>Explore beautiful locations we serve</p>
      </div>
      
      <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)' }}>
        <div ref={slideRef} style={{ position: 'relative', width: '100%', height: '400px' }}>
          <img src={currentPlace.photoUrl} alt={currentPlace.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', padding: '40px 20px 20px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '2rem', color: 'white', margin: 0, textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>{currentPlace.name}</h3>
          </div>
        </div>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
        {places.map((_, idx) => (
          <div key={idx} onClick={() => {
            gsap.to(slideRef.current, { opacity: 0, duration: 0.2, onComplete: () => {
              setCurrentIndex(idx);
              gsap.to(slideRef.current, { opacity: 1, duration: 0.2 });
            }});
          }} style={{ width: '12px', height: '12px', borderRadius: '50%', background: currentIndex === idx ? '#2563eb' : '#cbd5e1', cursor: 'pointer', transition: 'background 0.3s' }}></div>
        ))}
      </div>
    </section>
  );
};
