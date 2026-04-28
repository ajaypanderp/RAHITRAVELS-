import "./Footer.css";

export const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-column">
          <h4>Company</h4>
          <ul>
            <li>About Us</li>
            <li>Careers</li>
            <li>Privacy Policy</li>
            <li>Terms & Conditions</li>
          </ul>
        </div>

        <div className="footer-column">
          <h4>Quick Links</h4>
          <ul>
            <li>Rent a Car</li>
            <li>Services</li>
            <li>Contact</li>
            <li>Our Blogs</li>
          </ul>
        </div>

        <div className="footer-column">
          <h4>Support</h4>
          <ul>
            <li>FAQs</li>
            <li>Help Center</li>
            <li>Booking Guide</li>
            <li>Account Settings</li>
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
        <p>Rahi Travels &copy; 2024. All rights reserved.</p>
      </div>
    </footer>
  );
};
