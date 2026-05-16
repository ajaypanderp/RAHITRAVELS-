import React, { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

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
    <div style={{ 
      borderRadius: '8px', 
      overflow: 'hidden', 
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)', 
      background: 'white', 
      transition: 'transform 0.3s, box-shadow 0.3s', 
      cursor: 'pointer',
      border: '1px solid #f1f5f9'
    }} 
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-5px)';
      e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)';
    }} 
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)';
    }}>
      <div style={{ height: '240px', overflow: 'hidden', position: 'relative' }}>
        {images.map((img, idx) => (
          <img 
            key={idx}
            src={img} 
            alt={`${place.name} ${idx + 1}`} 
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover', 
              transition: 'opacity 1s ease-in-out, transform 0.5s',
              position: idx === 0 ? 'relative' : 'absolute',
              top: 0,
              left: 0,
              opacity: currentImgIndex === idx ? 1 : 0,
              zIndex: currentImgIndex === idx ? 1 : 0
            }} 
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          />
        ))}
        {images.length > 1 && (
          <div style={{ position: 'absolute', bottom: '10px', left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: '5px', zIndex: 2 }}>
            {images.map((_, idx) => (
              <div key={idx} style={{ width: '6px', height: '6px', borderRadius: '50%', background: currentImgIndex === idx ? '#fff' : 'rgba(255,255,255,0.5)' }}></div>
            ))}
          </div>
        )}
      </div>
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h3 style={{ fontSize: '1.25rem', color: '#334155', margin: 0, fontWeight: '600' }}>{place.name}</h3>
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
    <section className="places-section" style={{ padding: '60px 20px', background: '#fff' }}>
      
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {Object.entries(groupedPlaces).map(([city, cityPlaces], index) => (
          <div key={index} style={{ marginBottom: '60px' }}>
            
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', marginBottom: '10px' }}>
                <div style={{ height: '2px', width: '40px', background: '#65a30d' }}></div>
                <span style={{ color: '#65a30d', fontWeight: 'bold', letterSpacing: '1px', fontSize: '0.9rem', textTransform: 'uppercase' }}>
                  Many Tourists Visit
                </span>
                <div style={{ height: '2px', width: '40px', background: '#65a30d' }}></div>
              </div>
              <h2 style={{ fontSize: '2.5rem', color: '#1e293b', margin: 0, fontWeight: '700' }}>{city}</h2>
            </div>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '30px', 
              justifyContent: 'center' 
            }}>
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
