import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../firebaseConfig';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { BookingModal } from '../Booking/BookingModal';

export const CarSlideshow = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const q = query(collection(db, "cars"), limit(10));
        const snapshot = await getDocs(q);
        const fetchedCars = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (fetchedCars.length >= 1) {
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
    let animationId;
    let isPaused = false;
    
    if (cars.length > 1 && scrollRef.current) {
      const container = scrollRef.current;
      
      const scroll = () => {
        if (!isPaused) {
          container.scrollLeft += 1.5; // Speed
          
          // Reset scroll when reaching the halfway point (since we duplicated the array)
          if (container.scrollLeft >= container.scrollWidth / 2) {
            container.scrollLeft = 0;
          }
        }
        animationId = requestAnimationFrame(scroll);
      };
      
      animationId = requestAnimationFrame(scroll);
      
      const pause = () => isPaused = true;
      const resume = () => isPaused = false;
      
      container.addEventListener('mouseenter', pause);
      container.addEventListener('mouseleave', resume);
      container.addEventListener('touchstart', pause, {passive: true});
      container.addEventListener('touchend', resume);
      
      return () => {
        cancelAnimationFrame(animationId);
        container.removeEventListener('mouseenter', pause);
        container.removeEventListener('mouseleave', resume);
        container.removeEventListener('touchstart', pause);
        container.removeEventListener('touchend', resume);
      };
    }
  }, [cars]);

  // Duplicate cars for smooth infinite scrolling
  const displayCars = cars.length > 0 ? [...cars, ...cars, ...cars] : [];

  const handleViewDetails = (carName) => {
    setSelectedCar(carName);
    setIsBookingOpen(true);
  };

  if (loading || cars.length === 0) return null;

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
            WebkitOverflowScrolling: 'touch',
            justifyContent: cars.length < 4 ? 'center' : 'flex-start'
        }}
      >
        {displayCars.map((car, index) => (
          <div key={`${car.id}-${index}`} style={{ minWidth: '280px', maxWidth: '300px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', background: 'white', flex: '0 0 auto', display: 'flex', flexDirection: 'column' }}>
            <div style={{width: '100%', height: '180px', background: '#f8fafc', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
              <img src={car.image || 'https://via.placeholder.com/300x200?text=No+Image'} alt={car.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <div style={{ padding: '15px', textAlign: 'center', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
              <h3 style={{ fontSize: '1.2rem', color: '#1e293b', marginBottom: '5px' }}>{car.name}</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '15px' }}>{car.category}</p>
              <button 
                onClick={() => handleViewDetails(car.name)}
                style={{ marginTop: 'auto', padding: '10px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <BookingModal 
        isOpen={isBookingOpen} 
        onClose={() => setIsBookingOpen(false)} 
        preSelectedCar={selectedCar} 
      />
    </section>
  );
};
