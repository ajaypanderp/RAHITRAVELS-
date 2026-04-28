import React from "react";
import "./Footer.css";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-column">
          <h4>Company</h4>
          <ul>
            <li><a href="/about-us">About Us</a></li>
            <li><a href="/terms">Privacy Policy</a></li>
            <li><a href="/terms">Terms & Conditions</a></li>
          </ul>
        </div>

        <div className="footer-column">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/#rent">Rent a Car</a></li>
            <li><a href="/#services">Services</a></li>
            <li><a href="https://wa.me/919140230030">Contact</a></li>
          </ul>
        </div>

        <div className="footer-column">
          <h4>Support</h4>
          <ul>
            <li><a href="/faqs">FAQs</a></li>
            <li><a href="/faqs">Booking Guide</a></li>
          </ul>
        </div>

        <div className="footer-column">
          <h4>Contact Us</h4>
          <ul>
            <li><i className="ri-phone-fill"></i> +91 91402 30030</li>
            <li><i className="ri-mail-fill"></i> rahitravels@gmail.com</li>
            <li><i className="ri-map-pin-fill"></i> Ayodhya, Uttar Pradesh</li>
          </ul>
        </div>
      </div>

      <div className="footer-line"></div>

      <div className="footer-bottom">
        <p>Rahi Travels &copy; {currentYear}. All rights reserved.</p>
      </div>
    </footer>
  );
};
