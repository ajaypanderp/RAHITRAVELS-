import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./Working.css";

gsap.registerPlugin(ScrollTrigger);

export const Working = () => {
  const sectionRef = useRef(null);
  const stepRefs = useRef([]);
  const lineRefs = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate each step with ScrollTrigger
      stepRefs.current.forEach((step, index) => {
        gsap.fromTo(
          step,
          { opacity: 0, scale: 0.8 },
          {
            opacity: 1,
            scale: 1,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: step,
              start: "center center", // Animation starts when step is in the center of the viewport
              toggleActions: "play none none reverse", // Animation reverses on scrolling up
            },
          }
        );
      });

      // Animate lines with ScrollTrigger
      lineRefs.current.forEach((line, index) => {
        gsap.fromTo(
          line,
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: stepRefs.current[index], 
              start: "center center", 
              toggleActions: "play none none reverse",
              transformOrigin: "left",
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert(); // Clear GSAP animations
  }, []);

  return (
    <section className="how-it-works" ref={sectionRef}>
      <div className="heading">
        <h4>How It Works</h4>
        <h3>
          Simple Steps to your <span>Perfect Ride</span>
        </h3>
      </div>

      <section className="steps">
        <div className="step step1" ref={(el) => (stepRefs.current[0] = el)}>
          <div className="icon">
            <i className="ri-map-pin-fill"></i>
          </div>
          <div className="step-text">
            <h5>Choose a Location</h5>
            <p>Easily select the perfect location for your car rental.</p>
          </div>
        </div>

        <div
          className="line"
          ref={(el) => (lineRefs.current[0] = el)}
        ></div>

        <div className="step step2" ref={(el) => (stepRefs.current[1] = el)}>
          <div className="icon">
            <i className="ri-calendar-schedule-fill"></i>
          </div>
          <div className="step-text">
            <h5>Pick-Up Date</h5>
            <p>Pick a convenient date to start your journey.</p>
          </div>
        </div>

        <div
          className="line"
          ref={(el) => (lineRefs.current[1] = el)}
        ></div>

        <div className="step step3" ref={(el) => (stepRefs.current[2] = el)}>
          <div className="icon">
            <i className="ri-bookmark-3-fill"></i>
          </div>
          <div className="step-text">
            <h5>Book your Car</h5>
            <p>Reserve your ideal car in just a few clicks.</p>
          </div>
        </div>
      </section>
    </section>
  );
};
