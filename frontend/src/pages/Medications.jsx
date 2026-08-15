import { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import '../styles/tokens.css';
import api from '../api/axios';

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="8" />
    <path d="M12 7v5l3 2" />
  </svg>
);

const MealIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 19h16" />
    <path d="M7 19V8.5A2.5 2.5 0 0 1 9.5 6H10a2 2 0 0 1 2 2v11" />
    <path d="M14 19V7.5A2.5 2.5 0 0 1 16.5 5H17a2 2 0 0 1 2 2v12" />
  </svg>
);

const PillIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M8 5h8a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3Z" />
    <path d="M9.5 9.5 14.5 14.5" />
  </svg>
);

export default function Medications() {
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    quantity: 0,
    quantityUnit: 'count',
    scheduledTime: '09:00',
    scheduledTimes: ['09:00'],
    mealRelation: 'before meals',
    drugType: 'pill',
  });
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);

  const getDefaultUnitForType = (type) => (type === 'syrup' || type === 'powder' ? 'ml' : 'count');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => {
      if (name === 'drugType') {
        return { ...prev, [name]: value, quantityUnit: getDefaultUnitForType(value) };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleTimeChange = (index, value) => {
    setFormData((prev) => {
      const nextTimes = [...(prev.scheduledTimes || ['09:00'])];
      nextTimes[index] = value;
      return {
        ...prev,
        scheduledTimes: nextTimes,
        scheduledTime: nextTimes[0] || '09:00',
      };
    });
  };

  const addTimeSlot = () => {
    setFormData((prev) => ({
      ...prev,
      scheduledTimes: [...(prev.scheduledTimes || ['09:00']), '09:00'],
      scheduledTime: prev.scheduledTime || '09:00',
    }));
  };

  const removeTimeSlot = (index) => {
    setFormData((prev) => {
      const nextTimes = [...(prev.scheduledTimes || ['09:00'])];
      nextTimes.splice(index, 1);
      return {
        ...prev,
        scheduledTimes: nextTimes.length ? nextTimes : ['09:00'],
        scheduledTime: nextTimes[0] || '09:00',
      };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.name.trim()) return;
    try {
      const res = await api.post('https://mediremindplus.onrender.com/api/medications', {
        name: formData.name.trim(),
        dosage: formData.dosage.trim(),
        quantity: Number(formData.quantity) || 0,
        quantityUnit: formData.quantityUnit || getDefaultUnitForType(formData.drugType),
        scheduledTime: formData.scheduledTime,
        scheduledTimes: formData.scheduledTimes || [formData.scheduledTime || '09:00'],
        mealRelation: formData.mealRelation,
        drugType: formData.drugType,
      });
      setMedications((prev) => [res.data, ...prev]);
      setFormData({ name: '', dosage: '', quantity: 0, quantityUnit: 'count', scheduledTime: '09:00', scheduledTimes: ['09:00'], mealRelation: 'before meals', drugType: 'pill' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add medication');
    }
  };

  const handleEdit = (med) => {
    setEditingId(med._id || med.id);
    const times = Array.isArray(med.scheduledTimes) && med.scheduledTimes.length ? med.scheduledTimes : [med.scheduledTime || '09:00'];
    setFormData({
      name: med.name || '',
      dosage: med.dosage || '',
      quantity: Number(med.quantity) || 0,
      quantityUnit: med.quantityUnit || getDefaultUnitForType(med.drugType || 'pill'),
      scheduledTime: times[0] || '09:00',
      scheduledTimes: times,
      mealRelation: med.mealRelation || 'before meals',
      drugType: med.drugType || 'pill',
    });
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    try {
      const res = await api.patch(`/medications/${editingId}`, {
        name: formData.name.trim(),
        dosage: formData.dosage.trim(),
        quantity: Number(formData.quantity) || 0,
        quantityUnit: formData.quantityUnit || getDefaultUnitForType(formData.drugType),
        scheduledTime: formData.scheduledTime,
        scheduledTimes: formData.scheduledTimes || [formData.scheduledTime || '09:00'],
        mealRelation: formData.mealRelation,
        drugType: formData.drugType,
      });
      setMedications((prev) => prev.map((med) => ((med._id || med.id) === editingId ? res.data : med)));
      setEditingId(null);
      setFormData({ name: '', dosage: '', quantity: 0, quantityUnit: 'count', scheduledTime: '09:00', scheduledTimes: ['09:00'], mealRelation: 'before meals', drugType: 'pill' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update medication');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/medications/${id}`);
      setMedications((prev) => prev.filter((med) => med._id !== id && med.id !== id));
    } catch (err) {
      setError('Failed to delete');
    }
  };

  const formatQuantity = (med) => {
    const normalizedUnit = med.quantityUnit || getDefaultUnitForType(med.drugType || 'pill');
    const label = normalizedUnit === 'ml' ? 'ml' : normalizedUnit === 'g' ? 'g' : 'count';
    return `${Number(med.quantity) || 0} ${label}`;
  };

  const getSortedTimes = (med) => {
    const times = Array.isArray(med.scheduledTimes) && med.scheduledTimes.length ? med.scheduledTimes : [med.scheduledTime || '09:00'];
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
    const times = Array.isArray(med.scheduledTimes) && med.scheduledTimes.length ? med.scheduledTimes : [med.scheduledTime || '09:00'];
    const count = times.filter(Boolean).length;
    return count <= 1 ? '1x daily' : `${count}x daily`;
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get('/medications');
        if (mounted) setMedications(res.data);
      } catch (err) {
        setError('Could not load medications');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => (mounted = false);
  }, []);

  return (
    <div>
      <Navbar />
      <main style={{ padding: '24px', maxWidth: '960px', margin: '0 auto' }}>
        <section style={{ marginBottom: '32px' }}>
          <h1>Medication Manager</h1>
          <p>Use this section to add medications and remove them as needed.</p>
        </section>

        <section style={{ background: '#fff', padding: '24px', borderRadius: '18px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
          <h2>{editingId ? 'Edit Medication' : 'Add a Medication'}</h2>
          <form onSubmit={editingId ? (event) => { event.preventDefault(); handleUpdate(); } : handleSubmit} style={{ display: 'grid', gap: '12px', marginTop: '16px' }}>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Medication name"
              style={{ padding: '12px', borderRadius: '12px', border: '1px solid #d0d7e5' }}
            />
            <input
              name="dosage"
              value={formData.dosage}
              onChange={handleChange}
              placeholder="Dosage / notes"
              style={{ padding: '12px', borderRadius: '12px', border: '1px solid #d0d7e5' }}
            />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
              <label style={{ display: 'grid', gap: '6px', color: '#374151', fontWeight: 600 }}>
                Quantity / Pack Size
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="number"
                    min="0"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #d0d7e5' }}
                  />
                  <select
                    name="quantityUnit"
                    value={formData.quantityUnit}
                    onChange={handleChange}
                    style={{ padding: '12px', borderRadius: '12px', border: '1px solid #d0d7e5', minWidth: '150px' }}
                  >
                    <option value="count">Count</option>
                    <option value="ml">Volume (mL)</option>
                    <option value="g">Weight (g)</option>
                  </select>
                </div>
              </label>

              <div style={{ display: 'grid', gap: '8px' }}>
                <span style={{ color: '#374151', fontWeight: 600 }}>Times to take</span>
                {(formData.scheduledTimes || ['09:00']).map((time, index) => (
                  <div key={`${time}-${index}`} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="time"
                      value={time}
                      onChange={(event) => handleTimeChange(index, event.target.value)}
                      style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #d0d7e5' }}
                    />
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeTimeSlot(index)}
                        style={{ border: '1px solid #d0d7e5', background: '#fff', borderRadius: '10px', padding: '10px 12px', cursor: 'pointer' }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addTimeSlot}
                  style={{ alignSelf: 'flex-start', border: '1px solid #2F6FED', background: '#EAF2FF', color: '#1B2A6B', borderRadius: '10px', padding: '8px 12px', cursor: 'pointer' }}
                >
                  + Add another time
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
              <label style={{ display: 'grid', gap: '6px', color: '#374151', fontWeight: 600 }}>
                Meal timing
                <select
                  name="mealRelation"
                  value={formData.mealRelation}
                  onChange={handleChange}
                  style={{ padding: '12px', borderRadius: '12px', border: '1px solid #d0d7e5' }}
                >
                  <option value="before meals">Before meals</option>
                  <option value="after meals">After meals</option>
                  <option value="with meals">With meals</option>
                  <option value="no preference">No preference</option>
                </select>
              </label>

              <label style={{ display: 'grid', gap: '6px', color: '#374151', fontWeight: 600 }}>
                Form
                <select
                  name="drugType"
                  value={formData.drugType}
                  onChange={handleChange}
                  style={{ padding: '12px', borderRadius: '12px', border: '1px solid #d0d7e5' }}
                >
                  <option value="pill">Pill</option>
                  <option value="syrup">Syrup</option>
                  <option value="injection">Injection</option>
                  <option value="drops">Drops</option>
                  <option value="powder">Powder</option>
                  <option value="inhaler">Inhaler</option>
                  <option value="others">Others</option>
                </select>
              </label>
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button type="submit" style={{ padding: '12px 18px', borderRadius: '12px', border: 'none', background: '#2F6FED', color: '#fff', cursor: 'pointer' }}>
                {editingId ? 'Save Changes' : 'Add Medication'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                      setEditingId(null);
                    setFormData({ name: '', dosage: '', quantity: 0, quantityUnit: 'count', scheduledTime: '09:00', scheduledTimes: ['09:00'], mealRelation: 'before meals', drugType: 'pill' });
                  }}
                  style={{ padding: '12px 18px', borderRadius: '12px', border: '1px solid #d0d7e5', background: '#fff', color: '#374151', cursor: 'pointer' }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section style={{ marginTop: '32px' }}>
          <h2>Current Medications</h2>
          {medications.length === 0 ? (
            <p style={{ marginTop: '12px' }}>No medications added yet.</p>
          ) : (
            <div style={{ display: 'grid', gap: '14px', marginTop: '16px' }}>
              {medications.map((med) => {
                const medId = med._id || med.id;
                return (
                  <div key={medId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '16px', borderRadius: '16px', border: '1px solid #e5e9f2' }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{med.name}</div>
                      {med.dosage && <div style={{ color: '#6B7A99' }}>{med.dosage}</div>}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px', color: '#49566b', fontSize: '0.9rem' }}>
                        <span><strong>Qty:</strong> {formatQuantity(med)}</span>
                        <span style={{ background: '#EDF3FF', color: '#1B2A6B', borderRadius: '999px', padding: '4px 8px', fontWeight: 700 }}>{getDoseFrequencyLabel(med)}</span>
                        {getSortedTimes(med).map((time) => (
                          <span key={`${medId}-${time}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><ClockIcon /> {time}</span>
                        ))}
                        {med.mealRelation && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><MealIcon /> {med.mealRelation}</span>}
                        {med.drugType && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><PillIcon /> {med.drugType}</span>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => handleEdit(med)}
                        style={{ border: 'none', background: '#2F6FED', color: '#fff', borderRadius: '12px', padding: '10px 14px', cursor: 'pointer' }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(medId)}
                        style={{ border: 'none', background: '#FF7A5C', color: '#fff', borderRadius: '12px', padding: '10px 14px', cursor: 'pointer' }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
