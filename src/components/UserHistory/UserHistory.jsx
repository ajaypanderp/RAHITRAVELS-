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

  if (loading) return <div className="history-container"><p>Loading...</p></div>;

  return (
    <div className="history-container">
      <h2>My Booking History</h2>
      {bookings.length === 0 ? (
        <p>You have no bookings yet.</p>
      ) : (
        <div className="bookings-list">
          {bookings.map(booking => (
            <div key={booking.id} className="booking-card">
              <h4>{booking.from} <i className="ri-arrow-right-line"></i> {booking.to}</h4>
              <p><strong>Date & Time:</strong> {booking.date} at {booking.time}</p>
              <p><strong>Car Preference:</strong> {booking.car || 'Not specified'}</p>
              <span className="booking-status">Pending Confirmation</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
