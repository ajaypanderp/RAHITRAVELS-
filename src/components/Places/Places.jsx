import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
} from 'react';
import { db } from '../../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import './Places.css';

/* ─── Fallback data ──────────────────────────────────────────── */
const defaultPlaces = [
  { id: 'd1', city: 'Ayodhya Darshan', name: 'Ram Mandir',         photoUrls: ['https://images.unsplash.com/photo-1706692997103-6cb6388dece2?q=80&w=900&auto=format&fit=crop'] },
  { id: 'd2', city: 'Ayodhya Darshan', name: 'Kanak Bhawan',       photoUrls: ['https://images.unsplash.com/photo-1622308644420-b3020689b14b?q=80&w=900&auto=format&fit=crop'] },
  { id: 'd3', city: 'Ayodhya Darshan', name: 'Hanuman Garhi',      photoUrls: ['https://images.unsplash.com/photo-1561359313-0639aad49ca6?q=80&w=900&auto=format&fit=crop'] },
  { id: 'd4', city: 'Ayodhya Darshan', name: 'Saryu Ghat',         photoUrls: ['https://images.unsplash.com/photo-1600078686884-934d4e339b60?q=80&w=900&auto=format&fit=crop'] },
  { id: 'd5', city: 'Varanasi Darshan', name: 'Assi Ghat',         photoUrls: ['https://images.unsplash.com/photo-1583244532205-d4e511477484?q=80&w=900&auto=format&fit=crop'] },
  { id: 'd6', city: 'Varanasi Darshan', name: 'Kashi Vishwanath',  photoUrls: ['https://images.unsplash.com/photo-1621213596702-8618ba6b48ba?q=80&w=900&auto=format&fit=crop'] },
  { id: 'd7', city: 'Varanasi Darshan', name: 'Namo Ghat',         photoUrls: ['https://images.unsplash.com/photo-1635865403483-8a3e16d3e78f?q=80&w=900&auto=format&fit=crop'] },
  { id: 'd8', city: 'Prayagraj',       name: 'Sangam',             photoUrls: ['https://images.unsplash.com/photo-1658428230554-dbf471e9a2b7?q=80&w=900&auto=format&fit=crop'] },
  { id: 'd9', city: 'Prayagraj',       name: 'Anand Bhawan',       photoUrls: ['https://images.unsplash.com/photo-1634152962476-4b8a00e1915c?q=80&w=900&auto=format&fit=crop'] },
];

/* ─── helpers ────────────────────────────────────────────────── */
function getVC() {
  return typeof window !== 'undefined' && window.innerWidth <= 768 ? 1 : 3;
}

function mod(n, m) {
  return ((n % m) + m) % m;
}

/* ─── CitySection ────────────────────────────────────────────── */
const CitySection = ({ city, places }) => {
  const [vc, setVc]           = useState(getVC);         // visible count
  const [idx, setIdx]         = useState(0);             // index of first visible card
  const [busy, setBusy]       = useState(false);

  const trackRef = useRef(null);
  const timerRef = useRef(null);

  const n  = places.length;
  const rc = vc + 2;                       // render count: 1 ghost each side
  const needsCarousel = n > vc;            // only carousel when more cards than visible slots

  /* Build array of rc cards around idx: [prev-ghost, ...visible..., next-ghost] */
  const buildDeck = useCallback(
    (i) => Array.from({ length: rc }, (_, k) => places[mod(i - 1 + k, n)]),
    [places, n, rc]
  );

  const [deck, setDeck] = useState(() => buildDeck(0));

  /* Percentage helpers (all relative to TRACK width, not outer) */
  /* One slot = 100% / rc of track = 100% / vc of outer */
  const slotPct   = 100 / rc;           // % of track per slot
  const initPct   = -slotPct;           // position 1: hide leading ghost
  const fwdPct    = -slotPct * 2;       // position 2: forward
  const bwdPct    = 0;                  // position 0: backward

  /* Set track translateX with NO transition (snap) */
  const snapTo = useCallback((pct) => {
    const t = trackRef.current;
    if (!t) return;
    t.style.transition = 'none';
    t.style.transform  = `translateX(${pct}%)`;
  }, []);

  /* After deck changes, snap track back to neutral (useLayoutEffect = before paint → no flash) */
  useLayoutEffect(() => {
    snapTo(initPct);
  }, [deck, snapTo, initPct]);

  /* Window resize */
  useEffect(() => {
    const onResize = () => setVc(getVC());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  /* Core slide: direction +1 = forward, -1 = backward */
  const slide = useCallback(
    (dir) => {
      if (busy || !needsCarousel) return;
      const t = trackRef.current;
      if (!t) return;

      setBusy(true);
      clearInterval(timerRef.current);

      const targetPct = dir === 1 ? fwdPct : bwdPct;

      /* Animate */
      t.style.transition = 'transform 0.55s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      t.style.transform  = `translateX(${targetPct}%)`;

      /* When done: update state (deck rebuild + snap back happens in useLayoutEffect) */
      const onEnd = () => {
        t.removeEventListener('transitionend', onEnd);
        const nextIdx = mod(idx + dir, n);
        setIdx(nextIdx);
        setDeck(buildDeck(nextIdx));
        setBusy(false);
      };
      t.addEventListener('transitionend', onEnd);

      /* Safety net in case transitionend doesn't fire */
      setTimeout(() => {
        t.removeEventListener('transitionend', onEnd);
        if (busy) {
          const nextIdx = mod(idx + dir, n);
          setIdx(nextIdx);
          setDeck(buildDeck(nextIdx));
          setBusy(false);
        }
      }, 700);
    },
    [busy, needsCarousel, fwdPct, bwdPct, idx, n, buildDeck]
  );

  /* Auto-advance */
  useEffect(() => {
    if (!needsCarousel) return;
    timerRef.current = setInterval(() => slide(1), 2500);
    return () => clearInterval(timerRef.current);
  }, [needsCarousel, slide]);

  const handlePrev = () => { slide(-1); timerRef.current = setInterval(() => slide(1), 2500); };
  const handleNext = () => { slide( 1); timerRef.current = setInterval(() => slide(1), 2500); };

  /* Track width (inline) */
  const trackStyle = {
    width:     `${(rc / vc) * 100}%`,
    transform: `translateX(${initPct}%)`,   /* initial — overridden by useLayoutEffect anyway */
  };

  /* Each slot width (inline) */
  const slotStyle = { width: `${slotPct}%`, flexShrink: 0 };

  /* ── Simple grid: fewer cards than visible slots ── */
  if (!needsCarousel) {
    return (
      <div className="city-section">
        <div className="city-header">
          <div className="city-subtitle">
            <div className="city-line" />
            <span className="city-subtitle-text">Many Tourists Visit</span>
            <div className="city-line" />
          </div>
          <h2 className="city-title">{city}</h2>
        </div>
        <div className="places-simple-row">
          {places.map((place) => {
            const img =
              place.photoUrl ||
              (place.photoUrls && place.photoUrls.length > 0 ? place.photoUrls[0] : '');
            return (
              <div
                key={place.id}
                className="place-slot-static"
                style={{ width: `${100 / Math.min(n, vc)}%` }}
              >
                <div className="place-card">
                  <div className="place-img-wrap">
                    <img
                      src={img}
                      alt={place.name}
                      className="place-img"
                      draggable="false"
                      loading="lazy"
                    />
                  </div>
                  <p className="place-name">{place.name}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

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

        {/* Clipping window */}
        <div className="carousel-outer">
          <div className="places-track" ref={trackRef} style={trackStyle}>
            {deck.map((place, i) => {
              const img = place.photoUrl ||
                (place.photoUrls && place.photoUrls.length > 0 ? place.photoUrls[0] : '');
              return (
                <div key={`${place.id}-${i}`} className="place-slot" style={slotStyle}>
                  <div className="place-card">
                    <div className="place-img-wrap">
                      <img
                        src={img}
                        alt={place.name}
                        className="place-img"
                        draggable="false"
                        loading="lazy"
                      />
                    </div>
                    <p className="place-name">{place.name}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {needsCarousel && (
          <button className="carousel-button next" onClick={handleNext} aria-label="Next">
            <i className="ri-arrow-right-s-line" />
          </button>
        )}
      </div>

      {/* Dots */}
      {needsCarousel && (
        <div className="carousel-dots">
          {places.map((_, i) => (
            <span
              key={i}
              className={`carousel-dot${i === idx ? ' active' : ''}`}
              onClick={() => {
                if (busy || i === idx) return;
                clearInterval(timerRef.current);
                const newIdx = i;
                setIdx(newIdx);
                setDeck(buildDeck(newIdx));
                timerRef.current = setInterval(() => slide(1), 2500);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── Places ─────────────────────────────────────────────────── */
export const Places = () => {
  const [places,  setPlaces]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(collection(db, 'places'));
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setPlaces(list.length > 0 ? list : defaultPlaces);
      } catch {
        setPlaces(defaultPlaces);
      }
      setLoading(false);
    })();
  }, []);

  if (loading || places.length === 0) return null;

  const grouped = places.reduce((acc, p) => {
    const city = p.city || 'Other Destinations';
    if (!acc[city]) acc[city] = [];

    // Collect all image URLs for this place
    const urls = [];
    if (p.photoUrls && p.photoUrls.length > 0) urls.push(...p.photoUrls);
    if (p.photoUrl && !urls.includes(p.photoUrl)) urls.unshift(p.photoUrl);

    if (urls.length <= 1) {
      // Single image — add as-is (new-style landmark card)
      acc[city].push(p);
    } else {
      // Multiple images (old-style destination) — expand into one card per image
      urls.forEach((url, i) => {
        // Use individual photo name if available, else fall back to parent place name
        const cardName = (p.photoNames && p.photoNames[i] && p.photoNames[i].trim())
          ? p.photoNames[i].trim()
          : p.name;
        acc[city].push({
          ...p,
          id: `${p.id}-img${i}`,
          name: cardName,
          photoUrl: url,
          photoUrls: [url],
        });
      });
    }

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
