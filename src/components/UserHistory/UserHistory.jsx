import React, { useEffect, useState } from 'react';
import { db } from '../../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import './UserHistory.css';

export const UserHistory = () => {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!currentUser) return;
      try {
        const q = query(collection(db, 'bookings'), where('userId', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Sort by createdAt descending locally since index might not exist
        data.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
        setBookings(data);
      } catch (error) {
        console.error("Error fetching bookings: ", error);
      }
      setLoading(false);
    };

    fetchBookings();
  }, [currentUser]);

  if (!currentUser) {
    return <div className="history-container"><p>Please sign in to view your history.</p></div>;
  }

  const downloadICS = (booking) => {
    const dateStr = booking.date.replace(/-/g, '');
    const timeStr = booking.time.replace(/:/g, '') + '00';
    const startDateTime = `${dateStr}T${timeStr}`;

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Ayodhya Darshan Express//Booking//EN
BEGIN:VEVENT
SUMMARY:Trip: ${booking.from} to ${booking.to}
DTSTART;TZID=Asia/Kolkata:${startDateTime}
DESCRIPTION:Car: ${booking.car}\\nPickup: ${booking.from}\\nDrop: ${booking.to}
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

  if (loading) return <div className="history-container"><p>Loading...</p></div>;

  const now = new Date();
  
  const inProgress = bookings.filter(b => {
    // Basic check if date is in future
    const bDate = new Date(`${b.date} ${b.time}`);
    return bDate >= now;
  });

  const completed = bookings.filter(b => {
    const bDate = new Date(`${b.date} ${b.time}`);
    return bDate < now;
  });

  return (
    <div className="history-container">
      <h2>My Bookings</h2>
      
      {bookings.length === 0 ? (
        <p>You have no bookings yet.</p>
      ) : (
        <>
          <h3 style={{marginTop: '30px', marginBottom: '15px', color: '#2563eb'}}>In Progress <i className="ri-time-line"></i></h3>
          {inProgress.length === 0 ? <p style={{color: '#64748b'}}>No upcoming bookings.</p> : (
            <div className="bookings-list">
              {inProgress.map(booking => (
                <div key={booking.id} className="booking-card" style={{borderLeft: '4px solid #2563eb'}}>
                  <h4>{booking.from} <i className="ri-arrow-right-line"></i> {booking.to}</h4>
                  <p><strong>Date & Time:</strong> {booking.date} at {booking.time}</p>
                  <p><strong>Car Preference:</strong> {booking.car || 'Not specified'}</p>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span className="booking-status" style={{background: '#eff6ff', color: '#2563eb', margin: 0}}>In Progress</span>
                    <button 
                      onClick={() => downloadICS(booking)}
                      style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                    >
                      <i className="ri-calendar-event-line"></i> Add Reminder
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <h3 style={{marginTop: '40px', marginBottom: '15px', color: '#10b981'}}>Completed <i className="ri-check-double-line"></i></h3>
          {completed.length === 0 ? <p style={{color: '#64748b'}}>No completed bookings.</p> : (
            <div className="bookings-list">
              {completed.map(booking => (
                <div key={booking.id} className="booking-card" style={{borderLeft: '4px solid #10b981', opacity: 0.8}}>
                  <h4>{booking.from} <i className="ri-arrow-right-line"></i> {booking.to}</h4>
                  <p><strong>Date & Time:</strong> {booking.date} at {booking.time}</p>
                  <p><strong>Car Preference:</strong> {booking.car || 'Not specified'}</p>
                  <span className="booking-status" style={{background: '#ecfdf5', color: '#10b981'}}>Completed</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
