import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../firebaseConfig';
import { collection, getDocs, limit, query } from 'firebase/firestore';

export const CarSlideshow = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        // Fetch up to 10 cars
        const q = query(collection(db, "cars"), limit(10));
        const snapshot = await getDocs(q);
        const fetchedCars = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Minimum 4 cars to show slideshow
        if (fetchedCars.length >= 4) {
          setCars(fetchedCars);
        }
      } catch (err) {
        console.error("Error fetching cars for slideshow:", err);
      }
      setLoading(false);
    };
    fetchCars();
  }, []);

  useEffect(() => {
    let interval;
    if (cars.length >= 4 && scrollRef.current) {
        interval = setInterval(() => {
            if (scrollRef.current) {
                const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
                if (scrollLeft + clientWidth >= scrollWidth - 10) {
                    scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
                }
            }
        }, 3000);
    }
    return () => clearInterval(interval);
  }, [cars]);

  if (loading || cars.length < 4) return null;

  return (
    <section style={{ padding: '40px 20px', background: '#fff' }}>
      <div className="section-header" style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '2rem', color: '#1e293b' }}>Featured <span style={{ color: '#2563eb' }}>Vehicles</span></h2>
      </div>
      
      <div 
        ref={scrollRef}
        style={{ 
            display: 'flex', 
            gap: '20px', 
            overflowX: 'auto', 
            paddingBottom: '20px',
            scrollBehavior: 'smooth',
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch'
        }}
      >
        {cars.map((car, index) => (
          <div key={`${car.id}-${index}`} style={{ minWidth: '280px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', background: 'white', flex: '0 0 auto' }}>
            <img src={car.image || 'https://via.placeholder.com/300x200?text=No+Image'} alt={car.name} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
            <div style={{ padding: '15px', textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.2rem', color: '#1e293b', marginBottom: '5px' }}>{car.name}</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>{car.category}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
