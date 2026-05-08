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
    email: currentUser ? (currentUser.email || '') : '',
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
  const [currentDisplayImage, setCurrentDisplayImage] = useState('');

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
          if(details) setCurrentDisplayImage(details.image);
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
      if(details) setCurrentDisplayImage(details.image);
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
        userEmail: currentUser.email || '',
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

  const downloadICS = () => {
    const dateStr = formData.date.replace(/-/g, '');
    const timeStr = formData.time.replace(/:/g, '') + '00';
    const startDateTime = `${dateStr}T${timeStr}`;

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Ayodhya Darshan Express//Booking//EN
BEGIN:VEVENT
SUMMARY:Trip: ${formData.from} to ${formData.to}
DTSTART;TZID=Asia/Kolkata:${startDateTime}
DESCRIPTION:Car: ${formData.car}\\nPickup: ${formData.from}\\nDrop: ${formData.to}
BEGIN:VALARM
TRIGGER:-PT3H
ACTION:DISPLAY
DESCRIPTION:Reminder: Your cab is arriving in 3 hours!
END:VALARM
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', 'ayodhya-darshan-trip.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (success) {
    return (
      <div className="booking-success">
        <i className="ri-checkbox-circle-fill"></i>
        <h3>Booking Request Sent!</h3>
        <p>We have received your request for <strong>{formData.car}</strong>. Our team will contact you shortly at <strong>{formData.mobile}</strong> to confirm the details.</p>
        
        <div style={{ marginTop: '20px', padding: '15px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
          <h4 style={{ color: '#1e40af', marginBottom: '10px', fontSize: '1.1rem' }}><i className="ri-alarm-warning-line"></i> Never Miss Your Trip</h4>
          <p style={{ color: '#3b82f6', fontSize: '0.9rem', marginBottom: '15px' }}>Add this trip to your phone's calendar to get a guaranteed notification <strong>exactly 3 hours before</strong> pickup.</p>
          <button 
            onClick={downloadICS}
            style={{ background: '#2563eb', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 auto' }}
          >
            <i className="ri-calendar-event-line"></i> Add to Calendar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-split-container">
      <div className="car-preview-side" style={{ display: 'flex', flexDirection: 'column' }}>
        {selectedCarDetails ? (
          <>
            <img src={currentDisplayImage || 'https://via.placeholder.com/400x250?text=No+Image'} alt={selectedCarDetails.name} style={{ width: '100%', height: '250px', objectFit: 'cover', borderRadius: '8px', marginBottom: '15px' }} />
            
            {/* Gallery Thumbnails */}
            {selectedCarDetails.galleryUrls && selectedCarDetails.galleryUrls.length > 0 && (
              <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', marginBottom: '20px', paddingBottom: '10px' }}>
                <img 
                  src={selectedCarDetails.image} 
                  alt="Main" 
                  onClick={() => setCurrentDisplayImage(selectedCarDetails.image)}
                  style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', cursor: 'pointer', border: currentDisplayImage === selectedCarDetails.image ? '2px solid #2563eb' : '2px solid transparent', flexShrink: 0 }} 
                />
                {selectedCarDetails.galleryUrls.map((url, i) => (
                  <img 
                    key={i} 
                    src={url} 
                    alt={`Gallery ${i}`} 
                    onClick={() => setCurrentDisplayImage(url)}
                    style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', cursor: 'pointer', border: currentDisplayImage === url ? '2px solid #2563eb' : '2px solid transparent', flexShrink: 0 }} 
                  />
                ))}
              </div>
            )}

            <h2>{selectedCarDetails.name}</h2>
            <div className="price">{selectedCarDetails.pricePerKm}</div>
            <ul className="features">
              <li><i className="ri-group-line"></i> {selectedCarDetails.seats || '5'} Seater</li>
              <li><i className="ri-gas-station-line"></i> {selectedCarDetails.fuelType || 'Petrol'}</li>
              {selectedCarDetails.features && selectedCarDetails.features.map((feature, i) => (
                <li key={i}><i className="ri-check-line"></i> {feature}</li>
              ))}
              {(!selectedCarDetails.features || selectedCarDetails.features.length === 0) && (
                <>
                  <li><i className="ri-user-smile-line"></i> Professional Driver Included</li>
                  <li><i className="ri-shield-check-line"></i> Fully Insured Vehicle</li>
                  <li><i className="ri-map-pin-user-line"></i> Doorstep Pickup & Drop</li>
                  <li><i className="ri-customer-service-2-line"></i> 24/7 Support</li>
                </>
              )}
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
