import React, { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { BookingModal } from '../Booking/BookingModal';
import './CarListing.css';

export const CarListing = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  
  const [galleryCar, setGalleryCar] = useState(null);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "cars"));
        setCars(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("Error fetching cars:", err);
      }
      setLoading(false);
    };
    fetchCars();
  }, []);

  const handleBookNow = (car) => {
    setSelectedCar(car.name);
    setIsBookingOpen(true);
  };

  if (loading) return <div className="car-listing-loading" style={{textAlign:'center', padding:'40px'}}>Finding the best cars for you...</div>;

  return (
    <section className="car-listing-section" id="rent">
      <div className="section-header">
        <h2>Choose Your <span className="highlight">Perfect Ride</span></h2>
        <p>Explore our premium fleet of well-maintained vehicles for a comfortable journey.</p>
      </div>

      <div className="car-grid">
        {cars.map(car => (
          <div key={car.id} className="car-item">
            <div className="car-image-container" style={{ position: 'relative' }}>
              <img src={car.image || 'https://via.placeholder.com/300x200?text=No+Image'} alt={car.name} />
              <div className="car-badge">{car.category}</div>
              {car.galleryUrls && car.galleryUrls.length > 0 && (
                <button 
                  onClick={() => setGalleryCar(car)}
                  style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(0,0,0,0.7)', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontSize: '0.8rem' }}
                >
                  <i className="ri-image-line"></i> View Gallery
                </button>
              )}
            </div>
            <div className="car-details">
              <h3>{car.name}</h3>
              <div className="car-price">
                <span className="price-value">{car.pricePerKm}</span>
                <span className="price-unit">onwards</span>
              </div>
              <ul className="car-features">
                <li><i className="ri-user-fill"></i> {car.seats || '5'} Seats</li>
                <li><i className="ri-gas-station-fill"></i> {car.fuelType || 'Petrol/CNG'}</li>
                {car.features && car.features.length > 0 ? (
                  car.features.slice(0, 2).map((feat, i) => (
                    <li key={i}><i className="ri-check-line"></i> {feat}</li>
                  ))
                ) : (
                  <li><i className="ri-check-line"></i> Clean & Sanitized</li>
                )}
              </ul>
              <button className="book-btn-primary" onClick={() => handleBookNow(car)}>
                Book Now
              </button>
            </div>
          </div>
        ))}
      </div>

      {cars.length === 0 && (
        <div className="no-cars">
          <p>We are currently updating our fleet. Please check back soon!</p>
        </div>
      )}

      <BookingModal 
        isOpen={isBookingOpen} 
        onClose={() => setIsBookingOpen(false)} 
        preSelectedCar={selectedCar} 
      />

      {galleryCar && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal-content" style={{ maxWidth: '800px', width: '90%', maxHeight: '90vh', overflowY: 'auto', padding: '20px' }}>
            <button className="close-btn" onClick={() => setGalleryCar(null)}>&times;</button>
            <h2>{galleryCar.name} Gallery</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '20px' }}>
              <img src={galleryCar.image} alt="Main" style={{ width: '100%', borderRadius: '8px', marginBottom: '10px', objectFit: 'cover', height: '300px' }} />
              {galleryCar.galleryUrls.map((url, i) => (
                <img key={i} src={url} alt={`Gallery ${i}`} style={{ width: 'calc(50% - 5px)', borderRadius: '8px', objectFit: 'cover', height: '150px' }} />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
