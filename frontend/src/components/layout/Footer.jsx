import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Footer.css';

const hospitalList = {
  accra: [
    'Korle Bu Teaching Hospital',
    '37 Military Hospital',
    'Ridge Hospital',
    'Princess Marie Louise Hospital',
    'Tema General Hospital',
  ],
  kumasi: [
    'Komfo Anokye Teaching Hospital',
    'KNUST Hospital',
    'Mampong Municipal Hospital',
    'Cocoa Clinic',
  ],
  cape: [
    'Cape Coast Teaching Hospital',
    'Adisadel Hospital',
    'University of Cape Coast Hospital',
  ],
  takoradi: [
    'Effia Nkwanta Regional Hospital',
    'Takoradi Hospital',
    'Apremdo Clinic',
  ],
  default: [
    'Korle Bu Teaching Hospital',
    '37 Military Hospital',
    'Ridge Hospital',
    'Komfo Anokye Teaching Hospital',
    'Cape Coast Teaching Hospital',
  ],
};

const getNearbyHospitals = (location = '') => {
  const text = String(location || '').toLowerCase();

  if (text.includes('kumasi') || text.includes('ashanti')) return hospitalList.kumasi;
  if (text.includes('cape') || text.includes('central')) return hospitalList.cape;
  if (text.includes('takoradi') || text.includes('western')) return hospitalList.takoradi;
  if (text.includes('tema') || text.includes('accra') || text.includes('ga ')) return hospitalList.accra;

  return hospitalList.default;
};

const getDistanceKm = (lat1, lon1, lat2, lon2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  return 2 * earthRadiusKm * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const PinIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 21s7-5.6 7-11a5 5 0 0 0-9-3 5 5 0 0 0-9 3c0 5.4 7 11 7 11Z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);

export default function Footer() {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [nearbyHospitals, setNearbyHospitals] = useState(() => getNearbyHospitals(user?.location || 'Accra, Ghana'));
  const [loadingHospitals, setLoadingHospitals] = useState(false);

  useEffect(() => {
    let ignore = false;

    const resolveNearbyHospitals = async () => {
      if (user?.location) {
        const fallback = getNearbyHospitals(user.location);
        if (!ignore) setNearbyHospitals(fallback);
        return;
      }

      if (!navigator.geolocation) {
        if (!ignore) setNearbyHospitals(getNearbyHospitals('Accra, Ghana'));
        return;
      }

      setLoadingHospitals(true);

      navigator.geolocation.getCurrentPosition(async ({ latitude, longitude }) => {
        try {
          const reverseUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`;
          const reverseRes = await fetch(reverseUrl, {
            headers: {
              'Accept-Language': 'en',
            },
          });
          const reverseData = await reverseRes.json();
          const areaName = reverseData?.address?.city || reverseData?.address?.town || reverseData?.address?.village || reverseData?.address?.state || 'Accra, Ghana';

          const overpassQuery = `[out:json];(
            node["amenity"~"hospital|clinic|doctors"](around:10000,${latitude},${longitude});
            way["amenity"~"hospital|clinic|doctors"](around:10000,${latitude},${longitude});
          );out center tags 10;`;

          const overpassRes = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`);
          const overpassData = await overpassRes.json();

          const hospitalEntries = (overpassData.elements || [])
            .map((node) => {
              const name = node.tags?.name || node.tags?.['name:en'];
              const lat = Number(node.lat ?? node.center?.lat);
              const lon = Number(node.lon ?? node.center?.lon);

              if (!name || !Number.isFinite(lat) || !Number.isFinite(lon)) {
                return null;
              }

              return {
                name,
                distanceKm: getDistanceKm(latitude, longitude, lat, lon),
              };
            })
            .filter(Boolean)
            .filter((item, index, array) => array.findIndex((entry) => entry.name === item.name) === index)
            .sort((a, b) => a.distanceKm - b.distanceKm)
            .slice(0, 5)
            .map((item) => item.name);

          if (!ignore) {
            setNearbyHospitals(hospitalEntries.length ? hospitalEntries : getNearbyHospitals(areaName));
          }
        } catch (error) {
          if (!ignore) {
            setNearbyHospitals(getNearbyHospitals('Accra, Ghana'));
          }
        } finally {
          if (!ignore) setLoadingHospitals(false);
        }
      }, () => {
        if (!ignore) {
          setNearbyHospitals(getNearbyHospitals('Accra, Ghana'));
          setLoadingHospitals(false);
        }
      }, {
        enableHighAccuracy: true,
        timeout: 10000,
      });
    };

    resolveNearbyHospitals();
    return () => {
      ignore = true;
    };
  }, [user?.location]);

  return (
    <footer className="mr-footer">
      <div className="mr-footer-top">
        <span className="mr-footer-logo">MEDIREMIND</span>
        <div className="mr-footer-contact">
          <span>
            <span className="mr-footer-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1a2 2 0 0 1-1 1.7l-1 0.6a11 11 0 0 0 4.7 4.7l0.6-1a2 2 0 0 1 1.7-1h1a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2A15 15 0 0 1 5 5Z" />
              </svg>
            </span>
            Reach Us: +233547809066
          </span>
          <span>
            <span className="mr-footer-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5v-11Z" />
                <path d="m5 7 7 5 7-5" />
              </svg>
            </span>
            quashie.prince@gmail.com
          </span>
          <div className="mr-footer-locality">
            <button
              type="button"
              className="mr-footer-toggle"
              onClick={() => setExpanded((prev) => !prev)}
              aria-expanded={expanded}
            >
              <span className="mr-footer-icon" aria-hidden="true"><PinIcon /></span>
              <span>{loadingHospitals ? 'Loading nearby hospitals...' : 'Hospitals near me'}</span>
            </button>

            {expanded && (
              <div className="mr-footer-hospital-panel">
                <div className="mr-footer-hospital-list">
                  {nearbyHospitals.map((hospital) => {
                    const searchQuery = encodeURIComponent(`${hospital} ${user?.location || 'Ghana'}`);

                    return (
                      <a
                        key={hospital}
                        href={`https://www.google.com/maps/search/?api=1&query=${searchQuery}`}
                        target="_blank"
                        rel="noreferrer"
                        className="mr-footer-hospital-item"
                      >
                        {hospital}
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <nav className="mr-footer-links">
        <a href="/dashboard">Dashboard</a>
        <a href="/medications">Medications</a>
        <a href="/schedule">My Schedule</a>
        <a href="/refills">Refill Tracker</a>
      </nav>
    </footer>
  );
}
