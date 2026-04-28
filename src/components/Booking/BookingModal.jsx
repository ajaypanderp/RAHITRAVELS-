import React from 'react';
import { BookingForm } from './BookingForm';
import './BookingForm.css'; // We can reuse the overlay styling from LoginSignupModal or define new

export const BookingModal = ({ isOpen, onClose, preSelectedCar }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 3000 }}>
      <div className="modal-content" style={{ maxWidth: '600px' }}>
        <button className="close-btn" onClick={onClose}>&times;</button>
        <BookingForm preSelectedCar={preSelectedCar} onClose={onClose} />
      </div>
    </div>
  );
};
