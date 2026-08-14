import { useEffect, useState } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import api from '../api/axios';

const formatTime = (time) => {
  if (!time) return 'Time not set';

  const [hours, minutes] = time.split(':').map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return time;

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
};

const getTimeOfDayLabel = (time) => {
  if (!time) return 'Any time';

  const [hours] = time.split(':').map(Number);

  if (hours >= 5 && hours < 12) return 'Morning';
  if (hours >= 12 && hours < 17) return 'Afternoon';
  if (hours >= 17 && hours < 21) return 'Evening';
  return 'Night';
};

const getMedicationTimes = (med) => {
  if (Array.isArray(med.scheduledTimes) && med.scheduledTimes.length) {
    return med.scheduledTimes.filter(Boolean);
  }
  if (med.scheduledTime) return [med.scheduledTime];
  return ['09:00'];
};

const sortUpcomingTimes = (times) => {
  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
  return [...times].sort((a, b) => {
    const aMinutes = Number(a?.split(':')[0] || 0) * 60 + Number(a?.split(':')[1] || 0);
    const bMinutes = Number(b?.split(':')[0] || 0) * 60 + Number(b?.split(':')[1] || 0);
    const aDelta = (aMinutes - nowMinutes + 1440) % 1440;
    const bDelta = (bMinutes - nowMinutes + 1440) % 1440;
    return aDelta - bDelta;
  });
};

const getDoseFrequencyLabel = (med) => {
  const times = getMedicationTimes(med);
  return times.length <= 1 ? '1x daily' : `${times.length}x daily`;
};

const groupMedicationsByTime = (items) => {
  const groups = {
    Morning: [],
    Afternoon: [],
    Evening: [],
    Night: [],
  };

  items.forEach((med) => {
    const times = getMedicationTimes(med);
    times.forEach((time) => {
      const label = getTimeOfDayLabel(time);
      if (groups[label]) {
        groups[label].push({ ...med, scheduledTime: time });
      }
    });
  });

  return Object.entries(groups)
    .filter(([, meds]) => meds.length)
    .map(([label, meds]) => ({
      label,
      meds: meds.sort((a, b) => (a.scheduledTime || '23:59').localeCompare(b.scheduledTime || '23:59')),
    }));
};

export default function Schedule() {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get('/medications');
        if (active) {
          const sorted = [...res.data].sort((a, b) => {
            const timeA = a.scheduledTime || '23:59';
            const timeB = b.scheduledTime || '23:59';
            return timeA.localeCompare(timeB);
          });
          setMedications(sorted);
        }
      } catch (err) {
        if (active) setError('Could not load your schedule.');
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div>
      <Navbar />
      <main style={{ padding: '24px', maxWidth: '960px', margin: '0 auto' }}>
        <section style={{ marginBottom: '24px' }}>
          <h1 style={{ marginBottom: '8px' }}>My Schedule</h1>
          <p style={{ color: '#4B5563', margin: 0 }}>Your medications and the time each one should be taken.</p>
        </section>

        {error && (
          <p style={{ color: '#B91C1C', marginBottom: '16px' }}>{error}</p>
        )}

        {loading ? (
          <p>Loading schedule…</p>
        ) : medications.length === 0 ? (
          <div style={{ background: '#fff', padding: '24px', borderRadius: '18px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
            <p style={{ margin: 0 }}>No medications have been added yet.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '18px' }}>
            {groupMedicationsByTime(medications).map((group) => (
              <section key={group.label} style={{ background: '#fff', padding: '18px', borderRadius: '18px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
                <h2 style={{ margin: '0 0 12px', color: '#1B2A6B', fontSize: '1.1rem' }}>{group.label}</h2>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {group.meds.map((med) => {
                    const medId = med._id || med.id;
                    return (
                      <div key={medId} style={{ background: '#F7FAFF', padding: '16px 18px', borderRadius: '16px', border: '1px solid #e5e9f2' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{med.name}</div>
                            {med.dosage && <div style={{ color: '#6B7A99', marginTop: '4px' }}>{med.dosage}</div>}
                          </div>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <span style={{ background: '#EDF3FF', color: '#1B2A6B', fontWeight: 700, borderRadius: '999px', padding: '6px 12px' }}>
                              {getDoseFrequencyLabel(med)}
                            </span>
                            <span style={{ background: '#EAF2FF', color: '#1B2A6B', fontWeight: 700, borderRadius: '999px', padding: '6px 12px' }}>
                              {med.status || 'pending'}
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 18px', marginTop: '12px', color: '#374151', fontSize: '0.95rem' }}>
                          {(sortUpcomingTimes(getMedicationTimes(med))).map((time) => (
                            <span key={`${medId}-${time}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <circle cx="12" cy="12" r="8" />
                                <path d="M12 7v5l3 2" />
                              </svg>
                              {formatTime(time)}
                            </span>
                          ))}
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M4 19h16" />
                              <path d="M7 19V8.5A2.5 2.5 0 0 1 9.5 6H10a2 2 0 0 1 2 2v11" />
                              <path d="M14 19V7.5A2.5 2.5 0 0 1 16.5 5H17a2 2 0 0 1 2 2v12" />
                            </svg>
                            {med.mealRelation || 'No preference'}
                          </span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M8 5h8a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3Z" />
                              <path d="M9.5 9.5 14.5 14.5" />
                            </svg>
                            {med.drugType || 'Pill'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
