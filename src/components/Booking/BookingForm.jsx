import React, { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig';
import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import './BookingForm.css';

export const BookingForm = ({ preSelectedCar, onClose }) => {
  const { currentUser } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: currentUser ? currentUser.email : '',
    from: '',
    to: '',
    date: '',
    time: '',
    car: preSelectedCar || ''
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [availableCars, setAvailableCars] = useState([]);
  const [selectedCarDetails, setSelectedCarDetails] = useState(null);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "cars"));
        const carList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAvailableCars(carList);
        
        // If there's a pre-selected car, find its details
        if (preSelectedCar) {
          const details = carList.find(c => c.name === preSelectedCar);
          setSelectedCarDetails(details);
        }
      } catch (err) {
        console.error("Failed to fetch cars", err);
      }
    };
    fetchCars();
  }, [preSelectedCar]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (name === 'car') {
      const details = availableCars.find(c => c.name === value);
      setSelectedCarDetails(details);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert("Please sign in to book a car.");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'bookings'), {
        ...formData,
        userId: currentUser.uid,
        userEmail: currentUser.email,
        createdAt: serverTimestamp(),
      });
      setSuccess(true);
      setTimeout(() => {
        if (onClose) onClose();
      }, 3000);
    } catch (error) {
      console.error("Error adding booking: ", error);
      alert("Failed to submit booking. Try again.");
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="booking-success">
        <i className="ri-checkbox-circle-fill"></i>
        <h3>Booking Request Sent!</h3>
        <p>We have received your request for <strong>{formData.car}</strong>. Our team will contact you shortly at <strong>{formData.mobile}</strong> to confirm the details.</p>
      </div>
    );
  }

  return (
    <div className="booking-split-container">
      <div className="car-preview-side">
        {selectedCarDetails ? (
          <>
            <img src={selectedCarDetails.image || 'https://via.placeholder.com/400x250?text=No+Image'} alt={selectedCarDetails.name} />
            <h2>{selectedCarDetails.name}</h2>
            <div className="price">{selectedCarDetails.pricePerKm}</div>
            <ul className="features">
              <li><i className="ri-user-smile-line"></i> Professional Driver Included</li>
              <li><i className="ri-shield-check-line"></i> Fully Insured Vehicle</li>
              <li><i className="ri-map-pin-user-line"></i> Doorstep Pickup & Drop</li>
              <li><i className="ri-customer-service-2-line"></i> 24/7 Support</li>
            </ul>
          </>
        ) : (
          <div style={{ textAlign: 'center', color: '#64748b' }}>
            <i className="ri-roadster-line" style={{ fontSize: '4rem', marginBottom: '20px', display: 'block' }}></i>
            <p>Select a car to see details</p>
          </div>
        )}
      </div>

      <div className="booking-form-side">
        <h3>Booking Details</h3>
        <form onSubmit={handleSubmit} className="booking-form">
          <input type="text" name="name" placeholder="Your Full Name" value={formData.name} onChange={handleChange} required />
          <input type="tel" name="mobile" placeholder="Mobile Number" value={formData.mobile} onChange={handleChange} required />
          
          <div className="flex-row">
            <input type="text" name="from" placeholder="From (Pickup)" value={formData.from} onChange={handleChange} required />
            <input type="text" name="to" placeholder="To (Destination)" value={formData.to} onChange={handleChange} required />
          </div>
          
          <div className="flex-row">
            <input type="date" name="date" value={formData.date} onChange={handleChange} required />
            <input type="time" name="time" value={formData.time} onChange={handleChange} required />
          </div>
          
          <select name="car" value={formData.car} onChange={handleChange} required>
            <option value="" disabled>Select Preferred Car</option>
            {availableCars.map((c) => (
              <option key={c.id} value={c.name}>{c.name} - {c.pricePerKm}</option>
            ))}
          </select>
          
          <button type="submit" disabled={loading} className="book-btn">
            {loading ? 'Processing...' : 'Confirm Booking'}
          </button>
        </form>
      </div>
    </div>
  );
};
