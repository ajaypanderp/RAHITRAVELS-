import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./Download.css";
import appleImage from "../../assets/Apple.png";
import playStoreImage from "../../assets/PlayStore.png";
import footerImage from "../../assets/FooterCar.png";

gsap.registerPlugin(ScrollTrigger);

export const Download = () => {
  useEffect(() => {
    const carImage = document.querySelector(".right-img img");

    gsap.fromTo(
      carImage,
      { x: "100%" }, 
      {
        x: "0%", 
        scrollTrigger: {
          trigger: carImage,
          start: "bottom bottom", 
          end: "top top", 
          scrub: true, 
        },
      }
    );
  }, []);

  return (
    <section className="download" id="contact">
      <div className="left-text">
        <div className="only-text">
          <h2>Ready to Start Your Journey?</h2>
          <p>Book your perfect ride today and experience the best of Rahi Travels.</p>
        </div>
        <div className="action-buttons">
          <a href="#rent" className="footer-action-btn rent-btn">Rent a Car</a>
          <a href="https://wa.me/919140230030" className="footer-action-btn contact-btn">Contact Us</a>
        </div>
      </div>

      <div className="right-img">
        <img src={footerImage} alt="car" />
      </div>
    </section>
  );
};
