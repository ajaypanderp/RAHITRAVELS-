import React, { StrictMode, Suspense, lazy, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import './index.css'
import { db } from './firebaseConfig'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

// Auth Context & Loader
import { AuthProvider } from './context/AuthContext'
import { Loader } from './components/Loader/Loader'

// Lazy loaded Layout/Page Components
const Navbar = lazy(() => import('./components/NavBar/NavBar').then(module => ({ default: module.Navbar })));
const HeroSection = lazy(() => import('./components/HeroSection/HeroSection').then(module => ({ default: module.HeroSection })));
const CarSlideshow = lazy(() => import('./components/CarSlideshow/CarSlideshow').then(module => ({ default: module.CarSlideshow })));
const Places = lazy(() => import('./components/Places/Places').then(module => ({ default: module.Places })));
const Gallery = lazy(() => import('./components/Gallery/Gallery').then(module => ({ default: module.Gallery })));
const CarBrands = lazy(() => import('./components/CarBrands/CarBrands').then(module => ({ default: module.CarBrands })));
const CarListing = lazy(() => import('./components/CarListing/CarListing').then(module => ({ default: module.CarListing })));
const Working = lazy(() => import('./components/Working/Working').then(module => ({ default: module.Working })));
const Services = lazy(() => import('./components/Services/Services').then(module => ({ default: module.Services })));
const Download = lazy(() => import('./components/Download/Download').then(module => ({ default: module.Download })));
const Footer = lazy(() => import('./components/Footer/Footer').then(module => ({ default: module.Footer })));
const FloatingContact = lazy(() => import('./components/FloatingContact/FloatingContact').then(module => ({ default: module.FloatingContact })));

// Admin Panel
const AdminPanel = lazy(() => import('./components/Admin/AdminPanel').then(module => ({ default: module.AdminPanel })));

// Other pages
const UserHistory = lazy(() => import('./components/UserHistory/UserHistory').then(module => ({ default: module.UserHistory })));
const AboutUs = lazy(() => import('./pages/AboutUs').then(module => ({ default: module.AboutUs })));
const Terms = lazy(() => import('./pages/Terms').then(module => ({ default: module.Terms })));
const FAQ = lazy(() => import('./pages/FAQ').then(module => ({ default: module.FAQ })));
const GalleryPage = lazy(() => import('./pages/GalleryPage').then(module => ({ default: module.GalleryPage })));
const AuthPage = lazy(() => import('./pages/AuthPage').then(module => ({ default: module.AuthPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(module => ({ default: module.ProfilePage })));

// The Main Website View (Home)
const Home = () => (
  <>
    <HeroSection />
    <CarSlideshow />
    <Places />
    <Gallery />
    <CarListing />
    <Working />
    <Services />
    <Download />
    <FloatingContact />
  </>
);

// App Layout Component to hide Navbar/Footer on specific routes
const AppLayout = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const isAuth = location.pathname.startsWith('/auth');
  const hideNavFooter = isAdmin || isAuth;

  useEffect(() => {
    // Record visitor
    const recordVisit = async () => {
      const today = new Date().toDateString();
      const visited = sessionStorage.getItem('visited_today');
      
      if (visited !== today) {
        try {
          await addDoc(collection(db, 'visitors'), {
            timestamp: serverTimestamp(),
            userAgent: navigator.userAgent,
            dateString: today
          });
          sessionStorage.setItem('visited_today', today);
        } catch (error) {
          console.error("Failed to record visit", error);
        }
      }
    };
    recordVisit();
  }, []);

  return (
    <Suspense fallback={<Loader />}>
      {!hideNavFooter && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/my-bookings" element={<UserHistory />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/faqs" element={<FAQ />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
      {!hideNavFooter && <Footer />}
    </Suspense>
  );
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
)