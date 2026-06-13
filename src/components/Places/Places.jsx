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
  const image = place.photoUrl || (place.photoUrls && place.photoUrls.length > 0 ? place.photoUrls[0] : '');

  return (
    <div className={`place-card-wrapper ${countClass}`}>
      <div className="place-card">
        <div className="place-img-container">
          <img 
            src={image} 
            alt={place.name} 
            className="place-img"
            draggable="false"
          />
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
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);

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

  const handleMouseDown = (e) => {
    if (places.length <= 3) return;
    isDown.current = true;
    scrollRef.current.classList.add('active');
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeftStart.current = scrollRef.current.scrollLeft;
  };

  const handleMouseLeave = () => {
    isDown.current = false;
    if (scrollRef.current) {
      scrollRef.current.classList.remove('active');
    }
  };

  const handleMouseUp = () => {
    isDown.current = false;
    if (scrollRef.current) {
      scrollRef.current.classList.remove('active');
    }
  };

  const handleMouseMove = (e) => {
    if (!isDown.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5; // scroll speed
    scrollRef.current.scrollLeft = scrollLeftStart.current - walk;
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
        
        <div 
          className="places-window" 
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
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
