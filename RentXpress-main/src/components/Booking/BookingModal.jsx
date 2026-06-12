import React from 'react';
import { BookingForm } from './BookingForm';
import './BookingForm.css';

export const BookingModal = ({ isOpen, onClose, preSelectedCar }) => {
  if (!isOpen) return null;

  return (
    <div className="booking-modal-overlay">
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>&times;</button>
        <BookingForm preSelectedCar={preSelectedCar} onClose={onClose} />
      </div>
    </div>
  );
};
