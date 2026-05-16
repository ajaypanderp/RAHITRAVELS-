import React, { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import './Places.css'; // Import the new CSS file

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

const PlaceCard = ({ place }) => {
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const images = place.photoUrls && place.photoUrls.length > 0 ? place.photoUrls : (place.photoUrl ? [place.photoUrl] : []);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImgIndex((prev) => (prev + 1) % images.length);
    }, 3000); // Change image every 3 seconds
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="place-card-wrapper">
      <div className="place-card">
        <div className="place-img-container">
          {images.map((img, idx) => (
            <img 
              key={idx}
              src={img} 
              alt={`${place.name} ${idx + 1}`} 
              className="place-img"
              style={{ 
                position: idx === 0 ? 'relative' : 'absolute',
                top: 0,
                left: 0,
                opacity: currentImgIndex === idx ? 1 : 0,
                zIndex: currentImgIndex === idx ? 1 : 0
              }} 
            />
          ))}
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

export const Places = () => {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const snapshot = await getDocs(collection(db, "places"));
        const fetchedPlaces = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // If DB has places, but they don't have a city, group them nicely anyway.
        // If DB is completely empty, we use defaults.
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

  // Group places by city
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
          <div key={index} className="city-section">
            
            <div className="city-header">
              <div className="city-subtitle">
                <div className="city-line"></div>
                <span className="city-subtitle-text">
                  Many Tourists Visit
                </span>
                <div className="city-line"></div>
              </div>
              <h2 className="city-title">{city}</h2>
            </div>
            
            <div className="places-grid">
              {cityPlaces.map(place => (
                <PlaceCard key={place.id} place={place} />
              ))}
            </div>

          </div>
        ))}
      </div>
    </section>
  );
};
