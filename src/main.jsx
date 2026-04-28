import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'

// Layout/Page Components
import { Navbar } from './components/NavBar/NavBar'
import { HeroSection } from './components/HeroSection/HeroSection'
import { CarBrands } from './components/CarBrands/CarBrands'
import { Working } from './components/Working/Working'
import { Services } from './components/Services/Services'
import { Download } from './components/Download/Download'
import { Footer } from './components/Footer/Footer'

// Admin Panel
import { AdminPanel } from './components/Admin/AdminPanel'

// Floating Contact
import { FloatingContact } from './components/FloatingContact/FloatingContact'

// Auth Context
import { AuthProvider } from './context/AuthContext'
import { UserHistory } from './components/UserHistory/UserHistory'

// The Main Website View (Home)
const Home = () => (
  <>
    <HeroSection />
    <CarBrands />
    <Working />
    <Services />
    <Download />
    <FloatingContact />
  </>
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          {/* Main Website Route */}
          <Route path="/" element={<Home />} />
          
          {/* Admin Panel Route */}
          <Route path="/admin" element={<AdminPanel />} />
          
          {/* User History Route */}
          <Route path="/my-bookings" element={<UserHistory />} />
          
          {/* About Us Page Redirect (You can replace the div with a component) */}
          <Route path="/about-us" element={
            <div style={{padding: '100px 20px', textAlign: 'center'}}>
              <h1>About Rahi Travels</h1>
              <p>Welcome to Rahi Travels, your trusted partner for easy and affordable rentals.</p>
            </div>
          } />
        </Routes>
        <Footer />
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
)