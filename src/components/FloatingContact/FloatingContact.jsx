import React from "react";
import "./FloatingContact.css";

export const FloatingContact = () => {
  return (
    <div className="floating-contact">
      <a
        href="https://wa.me/919876543210"
        target="_blank"
        rel="noopener noreferrer"
        className="contact-btn whatsapp-btn"
        title="Chat with us on WhatsApp"
      >
        <i className="ri-whatsapp-line"></i>
      </a>
      <a
        href="tel:+919876543210"
        className="contact-btn phone-btn"
        title="Call us"
      >
        <i className="ri-phone-line"></i>
      </a>
    </div>
  );
};
