import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { db } from "../../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import "./HeroSection.css";

import DefaultCarImage from "../../assets/HeroCar.png";
import { BookingModal } from "../Booking/BookingModal";

export const HeroSection = () => {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [heroImages, setHeroImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Refs for the text section and the image container
  const textRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    const fetchHeroImages = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "hero_images"));
        const images = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (images.length > 0) {
          setHeroImages(images);
        }
      } catch (err) {
        console.error("Error fetching hero images:", err);
      }
    };
    fetchHeroImages();
  }, []);

  useEffect(() => {
    // Initial GSAP animations
    gsap.fromTo(
      textRef.current,
      { scale: 0.8, opacity: 0 },
      { scale: 1, opacity: 1, duration: 1.5, ease: "power2.out" }
    );

    gsap.fromTo(
      imageRef.current,
      { x: "100%", opacity: 0 },
      { x: "0%", opacity: 1, duration: 1.5, ease: "power2.out", delay: 0.5 }
    );
  }, []);

  useEffect(() => {
    if (heroImages.length <= 1) return;

    const interval = setInterval(() => {
      // Fade out
      gsap.to(imageRef.current, {
        opacity: 0,
        duration: 0.5,
        onComplete: () => {
          setCurrentIndex((prev) => (prev + 1) % heroImages.length);
          // Fade in
          gsap.to(imageRef.current, {
            opacity: 1,
            duration: 0.5
          });
        }
      });
    }, 5000); // 5 seconds interval

    return () => clearInterval(interval);
  }, [heroImages]);

  const currentImage = heroImages.length > 0 ? heroImages[currentIndex] : { url: DefaultCarImage };
  
  let displayUrl = currentImage.url;
  // Apply Cloudinary Background Removal if enabled
  if (currentImage.removeBg && displayUrl.includes('cloudinary')) {
    // Inject e_bgremoval transformation after /upload/
    displayUrl = displayUrl.replace('/upload/', '/upload/e_bgremoval/');
  }

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
        <img 
          ref={imageRef} 
          key={displayUrl}
          src={displayUrl} 
          alt="Car" 
          className="car-image" 
        />
      </section>
      <BookingModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />
    </main>
  );
};
