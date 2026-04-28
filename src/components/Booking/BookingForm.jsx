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

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "cars"));
        setAvailableCars(querySnapshot.docs.map(doc => doc.data()));
      } catch (err) {
        console.error("Failed to fetch cars", err);
      }
    };
    fetchCars();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
      }, 2000);
    } catch (error) {
      console.error("Error adding booking: ", error);
      alert("Failed to submit booking. Try again.");
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="booking-success">
        <h3>Booking Request Sent!</h3>
        <p>We will contact you shortly to confirm your booking.</p>
      </div>
    );
  }

  return (
    <div className="booking-container">
      <h2>Book Your Ride</h2>
      <form onSubmit={handleSubmit} className="booking-form">
        <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required />
        <input type="tel" name="mobile" placeholder="Mobile Number" value={formData.mobile} onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
        <div className="flex-row">
          <input type="text" name="from" placeholder="From (e.g. Ayodhya)" value={formData.from} onChange={handleChange} required />
          <input type="text" name="to" placeholder="To (e.g. Banaras)" value={formData.to} onChange={handleChange} required />
        </div>
        <div className="flex-row">
          <input type="date" name="date" value={formData.date} onChange={handleChange} required />
          <input type="time" name="time" value={formData.time} onChange={handleChange} required />
        </div>
        <select name="car" value={formData.car} onChange={handleChange} required>
          <option value="" disabled>Select a Car</option>
          {availableCars.map((c, index) => (
            <option key={index} value={c.name}>{c.name} ({c.category}) - {c.pricePerKm}</option>
          ))}
        </select>
        
        <button type="submit" disabled={loading} className="book-btn">
          {loading ? 'Submitting...' : 'Submit Booking'}
        </button>
      </form>
    </div>
  );
};
