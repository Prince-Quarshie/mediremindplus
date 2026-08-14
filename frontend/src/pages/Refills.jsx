import { useEffect, useState } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import api from '../api/axios';

export default function Refills() {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [amounts, setAmounts] = useState({});

  const formatQuantity = (med) => {
    const unit = med.quantityUnit || (med.drugType === 'syrup' || med.drugType === 'powder' ? 'ml' : 'count');
    const suffix = unit === 'ml' ? 'ml' : unit === 'g' ? 'g' : 'count';
    return `${Number(med.quantity) || 0} ${suffix}`;
  };

  const fetchMedications = async () => {
    try {
      const res = await api.get('/medications');
      const medList = res.data || [];
      setMedications(medList);

      const lowStock = medList.filter((med) => (Number(med.quantity) || 0) <= 5);
      if (lowStock.length) {
        const names = lowStock.map((med) => med.name).join(', ');
        setWarning(`Low stock warning: ${names} is running low.`);
      } else {
        setWarning('');
      }
    } catch (err) {
      setError('Could not load refill data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedications();
  }, []);

  const handleQuantityChange = (id, value) => {
    setAmounts((prev) => ({ ...prev, [id]: value }));
  };

  const handleIncrease = async (id) => {
    const med = medications.find((item) => (item._id || item.id) === id);
    const current = Number(med?.quantity) || 0;
    const added = Number(amounts[id] || 0);

    if (!added || added < 0) return;

    try {
      const res = await api.patch(`/medications/${id}`, {
        name: med.name,
        dosage: med.dosage || '',
        quantity: current + added,
        quantityUnit: med.quantityUnit || (med.drugType === 'syrup' || med.drugType === 'powder' ? 'ml' : 'count'),
        scheduledTime: med.scheduledTime || '09:00',
        mealRelation: med.mealRelation || 'before meals',
        drugType: med.drugType || 'pill',
      });

      setMedications((prev) => prev.map((item) => ((item._id || item.id) === id ? res.data : item)));
      setAmounts((prev) => ({ ...prev, [id]: '' }));

      const updatedMedList = medications.map((item) => ((item._id || item.id) === id ? res.data : item));
      const lowStock = updatedMedList.filter((item) => (Number(item.quantity) || 0) <= 5);
      if (lowStock.length) {
        const names = lowStock.map((item) => item.name).join(', ');
        setWarning(`Low stock warning: ${names} is running low.`);
      } else {
        setWarning('');
      }
    } catch (err) {
      setError('Could not update quantity.');
    }
  };

  const handleNotifyCaregiver = async () => {
    const lowStock = medications.filter((med) => (Number(med.quantity) || 0) <= 5);
    if (!lowStock.length) return;

    try {
      const payload = {
        medicationName: lowStock.map((med) => med.name).join(', '),
        quantity: Math.min(...lowStock.map((med) => Number(med.quantity) || 0)),
      };
      await api.post('/caregivers/low-stock-alert', payload);
      setWarning('Low stock alert sent to your caregiver/family member.');
    } catch (err) {
      setError('Could not notify caregiver.');
    }
  };

  return (
    <div>
      <Navbar />
      <main style={{ padding: '24px', maxWidth: '960px', margin: '0 auto' }}>
        <section style={{ marginBottom: '24px' }}>
          <h1 style={{ marginBottom: '8px' }}>Refill Tracker</h1>
          <p style={{ color: '#4B5563', margin: 0 }}>Track your medication stock and add more when you refill.</p>
        </section>

        {error && <p style={{ color: '#B91C1C', marginBottom: '16px' }}>{error}</p>}

        {warning && (
          <div style={{ background: '#FFF4E5', border: '1px solid #F59E0B', color: '#92400E', padding: '14px 16px', borderRadius: '12px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <strong>Warning:</strong> {warning}
            <button
              onClick={handleNotifyCaregiver}
              style={{ border: 'none', background: '#F59E0B', color: '#fff', borderRadius: '10px', padding: '8px 12px', cursor: 'pointer' }}
            >
              Notify caregiver
            </button>
          </div>
        )}

        {loading ? (
          <p>Loading refill data…</p>
        ) : medications.length === 0 ? (
          <div style={{ background: '#fff', padding: '24px', borderRadius: '18px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
            <p style={{ margin: 0 }}>No medications available for refill tracking.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '14px' }}>
            {medications.map((med) => {
              const id = med._id || med.id;
              const qty = Number(med.quantity) || 0;

              return (
                <div key={id} style={{ background: '#fff', padding: '18px 20px', borderRadius: '18px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', border: '1px solid #e5e9f2' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{med.name}</div>
                      {med.dosage && <div style={{ color: '#6B7A99', marginTop: '4px' }}>{med.dosage}</div>}
                    </div>
                    <span style={{ background: '#EAF2FF', color: '#1B2A6B', fontWeight: 700, borderRadius: '999px', padding: '6px 12px' }}>
                      {formatQuantity(med)} left
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 18px', marginTop: '12px', color: '#374151', fontSize: '0.95rem' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="8" />
                        <path d="M12 7v5l3 2" />
                      </svg>
                      {med.scheduledTime || 'Not set'}
                    </span>
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

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
                    <input
                      type="number"
                      min="0"
                      value={amounts[id] ?? ''}
                      onChange={(e) => handleQuantityChange(id, e.target.value)}
                      placeholder="Add quantity"
                      style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid #d0d7e5', minWidth: '160px' }}
                    />
                    <button
                      onClick={() => handleIncrease(id)}
                      style={{ border: 'none', background: '#2F6FED', color: '#fff', borderRadius: '10px', padding: '10px 14px', cursor: 'pointer' }}
                    >
                      Increase Stock
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
