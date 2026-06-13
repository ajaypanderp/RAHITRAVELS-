import React, { useState, useEffect, useRef, useCallback } from 'react';
import { db } from '../../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import './Places.css';

const defaultPlaces = [
  { id: 'default1', city: 'Ayodhya Darshan', name: 'Ram Mandir', photoUrls: ['https://images.unsplash.com/photo-1706692997103-6cb6388dece2?q=80&w=800&auto=format&fit=crop'] },
  { id: 'default2', city: 'Ayodhya Darshan', name: 'Kanak Bhawan', photoUrls: ['https://images.unsplash.com/photo-1622308644420-b3020689b14b?q=80&w=800&auto=format&fit=crop'] },
  { id: 'default3', city: 'Ayodhya Darshan', name: 'Hanuman Garhi', photoUrls: ['https://images.unsplash.com/photo-1561359313-0639aad49ca6?q=80&w=800&auto=format&fit=crop'] },
  { id: 'default4', city: 'Ayodhya Darshan', name: 'Saryu Ghat', photoUrls: ['https://images.unsplash.com/photo-1600078686884-934d4e339b60?q=80&w=800&auto=format&fit=crop'] },
  { id: 'default5', city: 'Varanasi Darshan', name: 'Assi Ghat', photoUrls: ['https://images.unsplash.com/photo-1583244532205-d4e511477484?q=80&w=800&auto=format&fit=crop'] },
  { id: 'default6', city: 'Varanasi Darshan', name: 'Kashi Vishwanath Temple', photoUrls: ['https://images.unsplash.com/photo-1621213596702-8618ba6b48ba?q=80&w=800&auto=format&fit=crop'] },
  { id: 'default7', city: 'Prayagraj', name: 'Sangam', photoUrls: ['https://images.unsplash.com/photo-1658428230554-dbf471e9a2b7?q=80&w=800&auto=format&fit=crop'] },
  { id: 'default8', city: 'Prayagraj', name: 'Hanuman Mandir', photoUrls: ['https://images.unsplash.com/photo-1681283737525-4c0d024621c5?q=80&w=800&auto=format&fit=crop'] },
  { id: 'default9', city: 'Prayagraj', name: 'Anand Bhawan', photoUrls: ['https://images.unsplash.com/photo-1634152962476-4b8a00e1915c?q=80&w=800&auto=format&fit=crop'] }
];

/* ─── PlaceCard ─────────────────────────────────────────────────── */
const PlaceCard = ({ place }) => {
  const image = place.photoUrl || (place.photoUrls && place.photoUrls.length > 0 ? place.photoUrls[0] : '');
  return (
    <div className="place-card">
      <div className="place-img-container">
        <img src={image} alt={place.name} className="place-img" draggable="false" />
      </div>
      <div className="place-info">
        <h3 className="place-name">{place.name}</h3>
      </div>
    </div>
  );
};

/* ─── helpers ───────────────────────────────────────────────────── */
function getVisibleCount() {
  if (typeof window !== 'undefined' && window.innerWidth <= 768) return 1;
  return 3;
}

/* ─── CitySection — one-by-one conveyor-belt carousel ─────────── */
const CitySection = ({ city, places }) => {
  const [visibleCount, setVisibleCount] = useState(getVisibleCount);
  const [startIdx, setStartIdx]         = useState(0);
  const [sliding, setSliding]           = useState(false);

  const outerRef = useRef(null);   // clips overflow
  const trackRef = useRef(null);   // slides left/right
  const timerRef = useRef(null);

  const needsCarousel = places.length > visibleCount;

  /* How many DOM cards we render (hidden leading + visible + hidden trailing) */
  /* renderCount = visibleCount + 2 so we have 1 card peeking each side */
  const renderCount = visibleCount + 2;

  /* Which cards to put in the track starting from (startIdx - 1) */
  const buildTrack = useCallback(
    (sIdx) =>
      Array.from({ length: renderCount }, (_, i) =>
        places[((sIdx - 1 + i) % places.length + places.length) % places.length]
      ),
    [places, renderCount]
  );

  const [trackCards, setTrackCards] = useState(() => buildTrack(0));

  /* Reposition track to hide the leading ghost card (slot index 1 = translateX -slotWidth) */
  const resetTrack = useCallback(() => {
    const outer = outerRef.current;
    const track = trackRef.current;
    if (!outer || !track) return;
    const slotWidth = outer.getBoundingClientRect().width / visibleCount;
    track.style.transition = 'none';
    track.style.transform  = `translateX(-${slotWidth}px)`;
  }, [visibleCount]);

  /* After a state change that updates trackCards, re-apply the neutral position */
  useEffect(() => {
    requestAnimationFrame(() => requestAnimationFrame(resetTrack));
  }, [trackCards, resetTrack]);

  /* Resize listener */
  useEffect(() => {
    const onResize = () => setVisibleCount(getVisibleCount());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  /* Core slide function: direction +1 (forward) or -1 (backward) */
  const slide = useCallback(
    (direction) => {
      if (sliding || !needsCarousel) return;

      const outer = outerRef.current;
      const track = trackRef.current;
      if (!outer || !track) return;

      const slotWidth = outer.getBoundingClientRect().width / visibleCount;
      /* neutral = -slotWidth; forward = -2*slotWidth; backward = 0 */
      const target = direction === 1 ? -(slotWidth * 2) : 0;

      setSliding(true);
      track.style.transition = 'transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      track.style.transform  = `translateX(${target}px)`;

      setTimeout(() => {
        const nextIdx =
          ((startIdx + direction) % places.length + places.length) % places.length;
        setStartIdx(nextIdx);
        setTrackCards(buildTrack(nextIdx));
        setSliding(false);
        /* resetTrack fires via the useEffect above after trackCards updates */
      }, 460);
    },
    [sliding, needsCarousel, visibleCount, startIdx, places.length, buildTrack]
  );

  /* Auto-advance every 2 s */
  useEffect(() => {
    if (!needsCarousel) return;
    timerRef.current = setInterval(() => slide(1), 2000);
    return () => clearInterval(timerRef.current);
  }, [needsCarousel, slide]);

  /* Manual buttons */
  const handlePrev = () => {
    clearInterval(timerRef.current);
    slide(-1);
    timerRef.current = setInterval(() => slide(1), 2000);
  };
  const handleNext = () => {
    clearInterval(timerRef.current);
    slide(1);
    timerRef.current = setInterval(() => slide(1), 2000);
  };

  /* CSS: each card slot = 1/visibleCount of outer; track = renderCount slots */
  const slotPercent = `${100 / visibleCount}%`;
  const trackWidth  = `${(renderCount / visibleCount) * 100}%`;

  return (
    <div className="city-section">
      {/* Header */}
      <div className="city-header">
        <div className="city-subtitle">
          <div className="city-line" />
          <span className="city-subtitle-text">Many Tourists Visit</span>
          <div className="city-line" />
        </div>
        <h2 className="city-title">{city}</h2>
      </div>

      {/* Carousel */}
      <div className="carousel-container">
        {needsCarousel && (
          <button className="carousel-button prev" onClick={handlePrev} aria-label="Previous">
            <i className="ri-arrow-left-s-line" />
          </button>
        )}

        {/* Clipping box */}
        <div className="carousel-outer" ref={outerRef}>
          {/* Sliding track */}
          <div
            className="places-track"
            ref={trackRef}
            style={{ width: trackWidth }}
          >
            {trackCards.map((place, i) => (
              <div
                key={`${place.id}-slot-${i}`}
                className="place-card-slot"
                style={{ width: slotPercent }}
              >
                <PlaceCard place={place} />
              </div>
            ))}
          </div>
        </div>

        {needsCarousel && (
          <button className="carousel-button next" onClick={handleNext} aria-label="Next">
            <i className="ri-arrow-right-s-line" />
          </button>
        )}
      </div>

      {/* Dot indicators */}
      {needsCarousel && (
        <div className="carousel-dots">
          {places.map((_, i) => (
            <span
              key={i}
              className={`carousel-dot${i === startIdx ? ' active' : ''}`}
              onClick={() => {
                clearInterval(timerRef.current);
                const diff = ((i - startIdx) % places.length + places.length) % places.length;
                let count = diff <= places.length / 2 ? diff : -(places.length - diff);
                if (count === 0) return;
                /* simple: just set directly */
                setStartIdx(i);
                setTrackCards(buildTrack(i));
                timerRef.current = setInterval(() => slide(1), 2000);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── Places (main export) ──────────────────────────────────────── */
export const Places = () => {
  const [places, setPlaces]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'places'));
        const fetched  = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPlaces(fetched.length > 0 ? fetched : defaultPlaces);
      } catch {
        setPlaces(defaultPlaces);
      }
      setLoading(false);
    };
    fetchPlaces();
  }, []);

  if (loading || places.length === 0) return null;

  const grouped = places.reduce((acc, p) => {
    const city = p.city || 'Other Destinations';
    if (!acc[city]) acc[city] = [];
    acc[city].push(p);
    return acc;
  }, {});

  return (
    <section className="places-section">
      <div className="places-container">
        {Object.entries(grouped).map(([city, cityPlaces], i) => (
          <CitySection key={i} city={city} places={cityPlaces} />
        ))}
      </div>
    </section>
  );
};
