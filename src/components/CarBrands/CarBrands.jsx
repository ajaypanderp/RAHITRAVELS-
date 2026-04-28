import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./CarBrands.css";
import Benz from "../../assets/Car_Brands/Benz.png";
import Bmw from "../../assets/Car_Brands/BMW.png";
import Jaguar from "../../assets/Car_Brands/Jaguar.png";
import Audi from "../../assets/Car_Brands/Audi.png";
import Tata from "../../assets/Car_Brands/Tata.png";
import Mahindra from "../../assets/Car_Brands/Mahindra.png";

gsap.registerPlugin(ScrollTrigger);

export const CarBrands = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const logos = Array.from(containerRef.current.querySelectorAll("img"));

    // GSAP Animation function
    const animateLogos = () => {
      // Animate the first three logos (from the left)
      gsap.fromTo(
        logos.slice(0, 3),
        { x: "-100%", opacity: 0 },
        {
          x: "0%",
          opacity: 1,
          duration: 1,
          ease: "power2.out",
          stagger: 0.2,
        }
      );

      // Animate the next three logos (from the right)
      gsap.fromTo(
        logos.slice(3),
        { x: "100%", opacity: 0 },
        {
          x: "0%",
          opacity: 1,
          duration: 1,
          ease: "power2.out",
          stagger: 0.2,
        }
      );
    };

    // ScrollTrigger configuration
    ScrollTrigger.create({
      trigger: containerRef.current,
      start: "bottom bottom",
      onEnter: animateLogos, 
      onLeaveBack: () => ScrollTrigger.refresh(), 
    });
  }, []);

  return (
    <section className="car-brands-section" id="rent" ref={containerRef}>
      <div className="car-heading">
        <h4>Our Partners</h4>
      </div>
      <div className="logo-container">
        <img src={Benz} alt="Benz" />
        <img className="bmw-logo" src={Bmw} alt="BMW" />
        <img src={Jaguar} alt="Jaguar" />
        <img src={Tata} alt="Tata" />
        <img src={Mahindra} alt="Mahindra" />
        <img src={Audi} alt="Audi" />
      </div>
    </section>
  );
};
