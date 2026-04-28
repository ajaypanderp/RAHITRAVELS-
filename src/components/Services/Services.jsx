import { useEffect, useState } from "react";
import "./Services.css";

import car1 from "../../assets/images/Car1.png";
import car2 from "../../assets/images/Car2.png";
import car3 from "../../assets/images/Car3.png";
import car4 from "../../assets/images/Car4.png";
import car5 from "../../assets/images/Car5.png";
import car6 from "../../assets/images/Car6.png";

export const Services = () => {
  const carImages = [car1, car2, car3, car4, car5, car6];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % carImages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [carImages.length]);

  return (
    <section className="services" id="services">
      <div className="header-text">
        <h4>Our Services</h4>
        <h3>
          We Ensure the Best <span>Customer Experience</span>
        </h3>
      </div>

      <div className="features">
        <div className="features-column">
          <div className="feature-item">
            <div className="sicon">
              <i class="ri-money-rupee-circle-fill"></i>
            </div>
            <h4>Competitive Pricing</h4>
          </div>

          <div className="feature-item">
            <div className="sicon">
              <i class="ri-wallet-3-fill"></i>
            </div>
            <h4>Easier Rent On Your Budget</h4>
          </div>

          <div className="feature-item">
            <div className="sicon">
              <i class="ri-bank-card-fill"></i>
            </div>
            <h4>Most Flexible Payment Plans</h4>
          </div>
        </div>

        <div className="service-image">
          <img src={carImages[currentImageIndex]} alt="Car" />
        </div>

        <div className="features-column">
          <div className="feature-item">
            <div className="sicon">
              <i class="ri-medal-fill"></i>
            </div>
            <h4>Best Extended Auto Warranties</h4>
          </div>

          <div className="feature-item">
            <div className="sicon">
              <i class="ri-user-star-fill"></i>
            </div>
            <h4>Roadside Assistance 24/7</h4>
          </div>

          <div className="feature-item">
            <div className="sicon">
              <i class="ri-taxi-wifi-fill"></i>
            </div>
            <h4>Your Choice Of Mechanic</h4>
          </div>
        </div>
      </div>
    </section>
  );
};
