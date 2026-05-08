import React, { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';

export const NotificationChecker = () => {
  const { currentUser } = useAuth();
  const notifiedBookings = useRef(new Set()); // Keep track of already notified bookings

  useEffect(() => {
    if (!currentUser) return;

    const checkUpcomingBookings = async () => {
      if (!('Notification' in window) || Notification.permission !== 'granted') {
        return;
      }

      try {
        const q = query(collection(db, 'bookings'), where('userId', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);
        const now = new Date();

        querySnapshot.forEach(doc => {
          const booking = doc.data();
          const bookingId = doc.id;
          
          if (!booking.date || !booking.time) return;

          const bookingDate = new Date(`${booking.date} ${booking.time}`);
          const timeDiff = bookingDate.getTime() - now.getTime();
          const hoursDiff = timeDiff / (1000 * 3600);

          // If booking is within the next 3 hours and we haven't notified them this session
          if (hoursDiff > 0 && hoursDiff <= 3 && !notifiedBookings.current.has(bookingId)) {
            notifiedBookings.current.add(bookingId);
            
            new Notification('Upcoming Trip Alert!', {
              body: `Your ride from ${booking.from} to ${booking.to} is coming up in less than 3 hours!`,
              icon: '/logo.png' // make sure you have this icon
            });
          }
        });
      } catch (error) {
        console.error('Failed to check upcoming bookings', error);
      }
    };

    // Check immediately, then check every 5 minutes
    checkUpcomingBookings();
    const interval = setInterval(checkUpcomingBookings, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [currentUser]);

  return null; // This is a background component, no UI
};
