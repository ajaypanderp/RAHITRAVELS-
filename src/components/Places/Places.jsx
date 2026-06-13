import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import './Places.css';

const defaultPlaces = [
  { id: 'default1', city: 'Ayodhya Darshan', name: 'Ram Mandir', photoUrls: ['https://images.unsplash.com/photo-1706692997103-6cb6388dece2?q=80&w=800&auto=format&fit=crop'] },
  { id: 'default2', city: 'Ayodhya Darshan', name: 'Kanak Bhawan', photoUrls: ['https://images.unsplash.com/photo-1622308644420-b3020689b14b?q=80&w=800&auto=format&fit=crop'] },
  { id: 'default3', city: 'Ayodhya Darshan', name: 'Hanuman Garhi', photoUrls: ['https://images.unsplash.com/photo-1561359313-0639aad49ca6?q=80&w=800&auto=format&fit=crop'] },
  { id: 'default4', city: 'Varanasi Darshan', name: 'Assi Ghat', photoUrls: ['https://images.unsplash.com/photo-1600078686884-934d4e339b60?q=80&w=800&auto=format&fit=crop'] },
  { id: 'default5', city: 'Varanasi Darshan', name: 'Namo Ghat', photoUrls: ['https://images.unsplash.com/photo-1583244532205-d4e511477484?q=80&w=800&auto=format&fit=crop'] },
  { id: 'default6', city: 'Varanasi Darshan', name: 'Kashi Vishwanath Temple', photoUrls: ['https://images.unsplash.com/photo-1621213596702-8618ba6b48ba?q=80&w=800&auto=format&fit=crop'] },
  { id: 'default7', city: 'Prayagraj', name: 'Sangam', photoUrls: ['https://images.unsplash.com/photo-1658428230554-dbf471e9a2b7?q=80&w=800&auto=format&fit=crop'] },
  { id: 'default8', city: 'Prayagraj', name: 'Hanuman Mandir', photoUrls: ['https://images.unsplash.com/photo-1681283737525-4c0d024621c5?q=80&w=800&auto=format&fit=crop'] },
  { id: 'default9', city: 'Prayagraj', name: 'Anand Bhawan', photoUrls: ['https://images.unsplash.com/photo-1634152962476-4b8a00e1915c?q=80&w=800&auto=format&fit=crop'] }
];



const PlaceCard = ({ place, countClass }) => {
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const images = place.photoUrls && place.photoUrls.length > 0 ? place.photoUrls : (place.photoUrl ? [place.photoUrl] : []);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImgIndex((prev) => (prev + 1) % images.length);
    }, 4000); 
    return () => clearInterval(interval);
  }, [images.length]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) {
      setCurrentImgIndex((prev) => (prev + 1) % images.length);
    } else if (diff < -50) {
      setCurrentImgIndex((prev) => (prev - 1 + images.length) % images.length);
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  const handleMouseDown = (e) => {
    touchStartX.current = e.clientX;
    touchEndX.current = e.clientX;
  };

  const handleMouseMove = (e) => {
    if (touchStartX.current) {
      touchEndX.current = e.clientX;
    }
  };

  const handleMouseUp = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) {
      setCurrentImgIndex((prev) => (prev + 1) % images.length);
    } else if (diff < -50) {
      setCurrentImgIndex((prev) => (prev - 1 + images.length) % images.length);
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  return (
    <div className={`place-card-wrapper ${countClass}`}>
      <div className="place-card">
        <div 
          className="place-img-container"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => { touchStartX.current = 0; touchEndX.current = 0; }}
          style={{ cursor: images.length > 1 ? 'grab' : 'default' }}
        >
          <div 
            className="place-img-slider" 
            style={{ 
              width: `${images.length * 100}%`,
              transform: `translateX(-${currentImgIndex * (100 / images.length)}%)`
            }}
          >
            {images.map((img, idx) => (
              <img 
                key={idx}
                src={img} 
                alt={`${place.name} ${idx + 1}`} 
                className="place-img place-img-slide"
                draggable="false"
              />
            ))}
          </div>
          {images.length > 1 && (
            <div className="slideshow-dots">
              {images.map((_, idx) => (
                <div key={idx} className={`slide-dot ${currentImgIndex === idx ? 'active' : ''}`}></div>
              ))}
            </div>
          )}
        </div>
        <div className="place-info">
          <h3 className="place-name">{place.name}</h3>
        </div>
      </div>
    </div>
  );
};

const CitySection = ({ city, places }) => {
  const scrollRef = useRef(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -(scrollRef.current.offsetWidth * 0.8), behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: scrollRef.current.offsetWidth * 0.8, behavior: 'smooth' });
    }
  };

  // Determine width class based on number of items
  const countClass = places.length === 1 ? 'count-1' 
                   : places.length === 2 ? 'count-2' 
                   : places.length === 3 ? 'count-3' 
                   : 'count-more';

  return (
    <div className="city-section">
      <div className="city-header">
        <div className="city-subtitle">
          <div className="city-line"></div>
          <span className="city-subtitle-text">Many Tourists Visit</span>
          <div className="city-line"></div>
        </div>
        <h2 className="city-title">{city}</h2>
      </div>
      
      <div className="carousel-container">
        {places.length > 3 && (
          <button className="carousel-button prev" onClick={scrollLeft}>
            <i className="ri-arrow-left-s-line"></i>
          </button>
        )}
        
        <div className="places-window" ref={scrollRef}>
          <div className={`places-grid ${places.length <= 3 ? 'centered' : ''}`}>
            {places.map(place => (
              <PlaceCard key={place.id} place={place} countClass={countClass} />
            ))}
          </div>
        </div>

        {places.length > 3 && (
          <button className="carousel-button next" onClick={scrollRight}>
            <i className="ri-arrow-right-s-line"></i>
          </button>
        )}
      </div>
    </div>
  );
};

export const Places = () => {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const snapshot = await getDocs(collection(db, "places"));
        const fetchedPlaces = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPlaces(fetchedPlaces.length > 0 ? fetchedPlaces : defaultPlaces);
      } catch (err) {
        console.error("Error fetching places:", err);
        setPlaces(defaultPlaces);
      }
      setLoading(false);
    };
    fetchPlaces();
  }, []);

  if (loading) return null;
  if (places.length === 0) return null;

  const groupedPlaces = places.reduce((acc, place) => {
    const city = place.city || 'Other Destinations';
    if (!acc[city]) {
      acc[city] = [];
    }
    acc[city].push(place);
    return acc;
  }, {});

  return (
    <section className="places-section">
      <div className="places-container">
        {Object.entries(groupedPlaces).map(([city, cityPlaces], index) => (
          <CitySection key={index} city={city} places={cityPlaces} />
        ))}
      </div>
    </section>
  );
};
