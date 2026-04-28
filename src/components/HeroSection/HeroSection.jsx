import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import "./HeroSection.css";

import CarImage from "../../assets/HeroCar.png";
import { BookingModal } from "../Booking/BookingModal";

export const HeroSection = () => {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  // Refs for the text section and the image container
  const textRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    // GSAP animations
    gsap.fromTo(
      textRef.current,
      { scale: 0.8},
      { scale:1, duration: 1.5, ease: "power2.out" }
    );

    gsap.fromTo(
      imageRef.current,
      { x: "100%", opacity: 0 },
      { x: "0%", opacity: 1, duration: 1.5, ease: "power2.out", delay: 0.5 }
    );
  }, []);

  return (
    <main>
      <section className="text-section" ref={textRef}>
        <h1>
          Drive your <span>Dream Car</span> Today
        </h1>
        <p>
          Rent the perfect car for traveling to places like Ayodhya, Banaras, Chitrakoot, and more with Rahi Travels. Enjoy flexible
          options, great prices, and a hassle-free experience. Get started in a
          few clicks!
        </p>
        <button 
          className="book-now-btn" 
          onClick={() => setIsBookingOpen(true)}
        >
          Book Your Ride
        </button>

      </section>

      <section className="hero-image-container" >
        <div className="blue-box"></div>
        <img ref={imageRef} src={CarImage} alt="Car" className="car-image" />
      </section>
      <BookingModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />
    </main>
  );
};
