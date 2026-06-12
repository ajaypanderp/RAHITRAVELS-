import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebaseConfig';
import { collection, addDoc, serverTimestamp, getDocs, getDoc, doc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import './BookingForm.css';

export const BookingForm = ({ preSelectedCar, onClose }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
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
  
  const [userProfile, setUserProfile] = useState(null);
  const [adminPhone, setAdminPhone] = useState('');
  const [showLockModal, setShowLockModal] = useState(false);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "cars"));
        const carList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const getCarSortOrder = (car) => {
          if (car.serialNo !== undefined && car.serialNo !== null && car.serialNo !== '') {
            return Number(car.serialNo);
          }
          const cat = (car.category || '').toLowerCase();
          if (cat.includes('sedan')) return 1000;
          if (cat.includes('hatchback')) return 2000;
          if (cat.includes('suv')) return 3000;
          if (cat.includes('muv')) return 4000;
          if (cat.includes('bus')) return 5000;
          return 99999;
        };
        carList.sort((a, b) => getCarSortOrder(a) - getCarSortOrder(b));
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

  useEffect(() => {
    if (currentUser) {
      const fetchUserProfile = async () => {
        try {
          const docRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserProfile(data);
            setFormData(prev => ({
              ...prev,
              name: data.name || prev.name,
              mobile: data.phone || prev.mobile,
              email: data.email || currentUser.email || prev.email
            }));
          } else {
            setUserProfile(null);
            setFormData(prev => ({
              ...prev,
              name: currentUser.displayName || prev.name,
              mobile: currentUser.phoneNumber || prev.mobile,
              email: currentUser.email || prev.email
            }));
          }
        } catch (err) {
          console.error("Error fetching user profile:", err);
        }
      };
      fetchUserProfile();
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchAdminPhone = async () => {
      try {
        const settingsSnap = await getDoc(doc(db, "settings", "whatsapp"));
        if (settingsSnap.exists()) {
          setAdminPhone(settingsSnap.data().phone || '');
        }
      } catch (err) {
        console.error("Error fetching admin phone:", err);
      }
    };
    fetchAdminPhone();
  }, []);

  const handleFieldClick = (e) => {
    e.preventDefault();
    setShowLockModal(true);
  };

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

      // Send WhatsApp notification if enabled
      try {
        const settingsSnap = await getDoc(doc(db, "settings", "whatsapp"));
        if (settingsSnap.exists()) {
          const settings = settingsSnap.data();
          if (settings.enabled && settings.phone && settings.apiKey) {
            const message = `🚨 *New Booking Alert* 🚨\n\n` +
              `👤 *Name:* ${formData.name}\n` +
              `📞 *Mobile:* ${formData.mobile}\n` +
              `📧 *Email:* ${formData.email}\n` +
              `🚗 *Car:* ${formData.car}\n` +
              `📍 *Route:* ${formData.from} to ${formData.to}\n` +
              `📅 *Date/Time:* ${formData.date} at ${formData.time}`;
            
            const encodedMsg = encodeURIComponent(message);
            const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(settings.phone)}&text=${encodedMsg}&apikey=${encodeURIComponent(settings.apiKey)}`;
            
            await fetch(url, { mode: 'no-cors' });
          }
        }
      } catch (err) {
        console.error("Failed to send WhatsApp notification:", err);
      }

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

        {showLockModal && (
          <div className="modal-overlay" style={{ zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-content" style={{ maxWidth: '400px', width: '90%', padding: '25px', textAlign: 'center', borderRadius: '12px', background: 'white', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
              <h3 style={{ marginBottom: '15px', color: '#1e293b' }}>🔐 Details Locked</h3>
              <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '20px', lineHeight: '1.5' }}>
                These details are locked and bound to your account. To change them, please make a new account or request the owner.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button 
                  onClick={() => {
                    const message = `Hello, I would like to request a change to my profile details (Name/Number) on the website.`;
                    const encodedMsg = encodeURIComponent(message);
                    const phoneNum = adminPhone || "+919876543210";
                    window.open(`https://wa.me/${phoneNum.replace('+', '')}?text=${encodedMsg}`, '_blank');
                    setShowLockModal(false);
                  }}
                  className="book-btn"
                  style={{ background: '#22c55e', color: 'white', padding: '12px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  💬 WhatsApp (Slow, depending on owner seen)
                </button>
                <button 
                  onClick={() => {
                    setShowLockModal(false);
                    if (onClose) onClose();
                    navigate('/profile');
                  }}
                  className="book-btn"
                  style={{ background: '#2563eb', color: 'white', padding: '12px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  👤 Self (Fast, by you)
                </button>
                <button 
                  onClick={() => setShowLockModal(false)}
                  className="secondary-btn"
                  style={{ padding: '12px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', background: '#e2e8f0', color: '#334155', marginTop: '5px' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
