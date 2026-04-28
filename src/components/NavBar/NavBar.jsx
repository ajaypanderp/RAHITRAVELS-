import "remixicon/fonts/remixicon.css";
import { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { useAuth } from "../../context/AuthContext";
import { LoginSignupModal } from "../Auth/LoginSignupModal";
import "./NavBar.css";

export const Navbar = () => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const drawerRef = useRef(null);
  const linksRef = useRef([]);
  const animationRef = useRef(null);
  
  const { currentUser, logout } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Function to handle smooth scroll to top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setMobileDrawerOpen(false);
  };

  // WhatsApp Redirect Function
  const openWhatsApp = () => {
    // Replace with your actual phone number
    window.open("https://wa.me/91XXXXXXXXXX", "_blank"); 
  };

  const toggleNavbar = () => {
    if (mobileDrawerOpen) {
      const timeline = gsap.timeline({
        onComplete: () => setMobileDrawerOpen(false),
      });
      timeline.to(drawerRef.current, {
        y: "-100%",
        opacity: 0,
        duration: 0.5,
        ease: "power2.in",
      });
    } else {
      setMobileDrawerOpen(true);
    }
  };

  useEffect(() => {
    if (mobileDrawerOpen) {
      const ctx = gsap.context(() => {
        const timeline = gsap.timeline();
        timeline.fromTo(
          drawerRef.current,
          { y: "-100%", opacity: 0 },
          { y: "0%", opacity: 1, duration: 0.5, ease: "power2.out" }
        );
        timeline.fromTo(
          linksRef.current,
          { y: -20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.3,
            stagger: 0.1,
            ease: "power2.out",
          },
          "-=0.2"
        );
      });
      animationRef.current = ctx;
    }
    return () => animationRef.current?.revert();
  }, [mobileDrawerOpen]);

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <div className="text-container" onClick={scrollToTop} style={{cursor: 'pointer'}}>
            <h1 className="logo-text">
              Rahi<i className="ri-map-pin-2-fill"></i>Travels
            </h1>
          </div>
          
          <ul className="nav-items">
            <li><a href="/" onClick={scrollToTop}>Home</a></li>
            <li><a href="/#rent">Rent</a></li>
            <li><a href="/#services">Services</a></li>
            {/* Redirects to an external About page or a new route */}
            <li><a href="/about-us">About Us</a></li> 
            <li><a href="#" onClick={openWhatsApp}><i className="ri-whatsapp-line"></i> WhatsApp</a></li>
            {currentUser && <li><a href="/my-bookings">My Bookings</a></li>}
          </ul>

          <div className="auth-buttons">
            {currentUser ? (
              <>
                <span style={{ marginRight: '15px', color: 'gray' }}>Hi, {currentUser.email.split('@')[0]}</span>
                <a href="#" className="btn btn-border" onClick={logout}>Logout</a>
              </>
            ) : (
              <>
                <a href="#" className="btn btn-border" onClick={() => setIsModalOpen(true)}>Sign In</a>
                <a href="#" className="btn btn-gradient" onClick={() => setIsModalOpen(true)}>Create Account</a>
              </>
            )}
          </div>

          <div className="mobile-menu">
            <button onClick={toggleNavbar}>
              {mobileDrawerOpen ? (
                <i className="ri-close-large-fill"></i>
              ) : (
                <i className="ri-menu-3-fill"></i>
              )}
            </button>
          </div>
        </div>

        {mobileDrawerOpen && (
          <div className="mobile-drawer" ref={drawerRef}>
            <ul>
              {[
                { text: "Home", icon: "ri-home-4-line", action: scrollToTop },
                { text: "Rent", icon: "ri-roadster-line", href: "#rent" },
                { text: "Services", icon: "ri-shield-flash-line", href: "#services" },
                { text: "About Us", icon: "ri-information-line", href: "/about-us" },
                { text: "WhatsApp", icon: "ri-whatsapp-line", action: openWhatsApp },
              ].map((item, index) => (
                <li key={item.text} ref={(el) => (linksRef.current[index] = el)}>
                  <a 
                    href={item.href || "#"} 
                    onClick={(e) => {
                      if(item.action) {
                        e.preventDefault();
                        item.action();
                      }
                    }}
                  >
                    <i className={item.icon}></i> {item.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <LoginSignupModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </nav>
  );
};