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

  if (loading) return <div className="car-listing-loading">Finding the best cars for you...</div>;

  return (
    <section className="car-listing-section" id="rent">
      <div className="section-header">
        <h2>Choose Your <span className="highlight">Perfect Ride</span></h2>
        <p>Explore our premium fleet of well-maintained vehicles for a comfortable journey.</p>
      </div>

      <div className="car-grid">
        {cars.map(car => (
          <div key={car.id} className="car-item">
            <div className="car-image-container">
              <img src={car.image || 'https://via.placeholder.com/300x200?text=No+Image'} alt={car.name} />
              <div className="car-badge">{car.category}</div>
            </div>
            <div className="car-details">
              <h3>{car.name}</h3>
              <div className="car-price">
                <span className="price-value">{car.pricePerKm}</span>
                <span className="price-unit">onwards</span>
              </div>
              <ul className="car-features">
                <li><i className="ri-user-fill"></i> 5 Seats</li>
                <li><i className="ri-gas-station-fill"></i> Petrol/CNG</li>
                <li><i className="ri-check-line"></i> Clean & Sanitized</li>
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
    </section>
  );
};
