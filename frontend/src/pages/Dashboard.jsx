import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import './Dashboard.css';

/* ─── Inline Icons ─────────────────────────────────────────────── */
const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1a2 2 0 0 1-1 1.7l-1 0.6a11 11 0 0 0 4.7 4.7l0.6-1a2 2 0 0 1 1.7-1h1a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2A15 15 0 0 1 5 5Z" />
  </svg>
);
const HospitalIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="9" width="18" height="13" rx="2" /><path d="M8 22V12h8v10" /><path d="M12 6V3" /><path d="M9 4.5h6" />
  </svg>
);
const BellIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 4a5 5 0 0 0-5 5v2.2c0 .8-.2 1.5-.6 2.2L5 15h14l-1.4-1.6a3.6 3.6 0 0 1-.6-2.2V9a5 5 0 0 0-5-5Z" />
    <path d="M10 18a2 2 0 0 0 4 0" />
  </svg>
);
const CalIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="5" width="16" height="15" rx="3" />
    <path d="M8 3v4" /><path d="M16 3v4" /><path d="M8 11h8" /><path d="M8 15h5" />
  </svg>
);
const PillIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M8 5h8a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3Z" />
    <path d="M9.5 9.5 14.5 14.5" />
  </svg>
);
const MealIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 19h16" />
    <path d="M7 19V8.5A2.5 2.5 0 0 1 9.5 6H10a2 2 0 0 1 2 2v11" />
    <path d="M14 19V7.5A2.5 2.5 0 0 1 16.5 5H17a2 2 0 0 1 2 2v12" />
  </svg>
);
const LogMedIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="5" width="16" height="14" rx="3" />
    <path d="M8 5V3" /><path d="M16 5V3" /><path d="M8 12h8" /><path d="M12 8v8" />
  </svg>
);
const PlusIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 13l4 4L19 7" />
  </svg>
);
const XIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);
const TrashIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
  </svg>
);
const EditIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
  </svg>
);

/* ─── Navbar ─────────────────────────────────────────────────── */
function DashNavbar({ user, onLogout, notifications = [], onToggleNotifications, isNotificationsOpen, notificationCount = 0 }) {
  return (
    <header className="db-navbar">
      <div className="db-topbar">
        <Link to="/dashboard" className="db-logo">MEDIREMIND<span>+</span></Link>
        <div className="db-topbar-info" aria-hidden="true" />
        <div className="db-user-area">
          {user && <>
            <button
              type="button"
              className="db-notification-btn"
              onClick={onToggleNotifications}
              aria-label="Open notifications"
            >
              <BellIcon />
              {notificationCount > 0 && (
                <span className="db-notification-badge">{notificationCount > 9 ? '9+' : notificationCount}</span>
              )}
            </button>
            <span className="db-username">Hi, {user.name}</span>
            <button className="db-logout-btn" onClick={onLogout}>Logout</button>
          </>}
        </div>
      </div>
      <nav className="db-navpill">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/medications">Medications</Link>
        <Link to="/schedule">My Schedule</Link>
        <Link to="/refills">Refill Tracker</Link>
      </nav>
    </header>
  );
}

/* ─── Hero ───────────────────────────────────────────────────── */
function DashHero() {
  return (
    <section className="db-hero">
      <div className="db-hero-inner">
        <div className="db-hero-img-wrap">
          <img src="/doctor.jpg" alt="Healthcare provider" className="db-hero-img" />
        </div>
        <div className="db-hero-copy">
          <h1>YOUR HEALTH,<br /><span className="db-hero-accent">RIGHT ON TIME.</span></h1>
          <p>Get smart medication reminders that keep you on track, wherever life takes you.</p>
          <div className="db-hero-actions">
            <Link to="/schedule" className="db-btn db-btn-coral">Today's Dose</Link>
          </div>
        </div>
      </div>
      <div className="db-hero-banner"><p>Healthy Habits Start with Timely Reminders</p></div>
    </section>
  );
}

/* ─── Stats Section ──────────────────────────────────────────── */
function DashStats({ stats, loading }) {
  const { medications = 0, takenToday = 0, upcoming = 0, missed = 0 } = stats;
  return (
    <section className="db-stats-section">
      <span className="db-pill-label">Dashboard</span>
      <div className="db-stats-header">
        <h2>Your Health,<br />Right On Time.</h2>
        <div className="db-stats-header-right">
          <p>Get smart medication reminders that keep you on track, wherever life takes you.</p>
        </div>
      </div>
      <div className="db-stats-grid">
        <div className={`db-stat-card${loading ? ' db-stat-loading' : ''}`}>
          <span className="db-dot db-dot-blue" />
          <p className="db-stat-label">Medications</p>
          <p className="db-stat-value">{loading ? '—' : medications}</p>
        </div>
        <div className={`db-stat-card${loading ? ' db-stat-loading' : ''}`}>
          <span className="db-dot db-dot-green" />
          <p className="db-stat-label">Taken Today</p>
          <p className="db-stat-value db-val-green">{loading ? '—' : takenToday}</p>
          <p className="db-stat-sub">today</p>
        </div>
        <div className={`db-stat-card${loading ? ' db-stat-loading' : ''}`}>
          <span className="db-dot db-dot-navy" />
          <p className="db-stat-label">Upcoming</p>
          <p className="db-stat-value">{loading ? '—' : upcoming}</p>
          <p className="db-stat-sub">pending</p>
        </div>
        <div className={`db-stat-card${loading ? ' db-stat-loading' : ''}`}>
          <span className="db-dot db-dot-coral" />
          <p className="db-stat-label">Missed Medications</p>
          <p className="db-stat-value db-val-coral">{loading ? '—' : missed}</p>
        </div>
      </div>
    </section>
  );
}

/* ─── Add Medication Panel ───────────────────────────────────── */
function AddMedicationPanel({ onAdded }) {
  const [form, setForm] = useState({
    name: '',
    dosage: '',
    scheduledTime: '09:00',
    mealRelation: 'before meals',
    drugType: 'pill',
  });
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setAdding(true); setError(''); setSuccess('');
    try {
      await api.post('https://mediremindplus.onrender.com/api/medications', {
        name: form.name.trim(),
        dosage: form.dosage.trim(),
        scheduledTime: form.scheduledTime,
        mealRelation: form.mealRelation,
        drugType: form.drugType,
      });
      setSuccess(`"${form.name.trim()}" added!`);
      setForm({ name: '', dosage: '', scheduledTime: '09:00', mealRelation: 'before meals', drugType: 'pill' });
      onAdded(); // trigger stats refresh
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add medication');
    } finally {
      setAdding(false);
    }
  };

  return (
    <section className="db-panel">
      <h3 className="db-panel-title">
        <span className="db-panel-title-icon"><PlusIcon /></span>
        Add a Medication
      </h3>
      <p className="db-panel-desc">Add a new medication to your schedule. The stat cards above update automatically.</p>
      <form onSubmit={handleSubmit} className="db-med-form">
        <div className="db-form-row">
          <div className="db-field">
            <label htmlFor="med-name">Medication Name *</label>
            <input id="med-name" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Amoxicillin" className="db-input" required />
          </div>
          <div className="db-field">
            <label htmlFor="med-dosage">Dosage / Notes</label>
            <input id="med-dosage" name="dosage" value={form.dosage} onChange={handleChange} placeholder="e.g. 500mg twice daily" className="db-input" />
          </div>
          <div className="db-field db-field-sm">
            <label htmlFor="med-time">Scheduled Time</label>
            <input id="med-time" type="time" name="scheduledTime" value={form.scheduledTime} onChange={handleChange} className="db-input" />
          </div>
        </div>

        <div className="db-form-row">
          <div className="db-field">
            <label htmlFor="med-meal">Meal Timing</label>
            <select id="med-meal" name="mealRelation" value={form.mealRelation} onChange={handleChange} className="db-input">
              <option value="before meals">Before meals</option>
              <option value="after meals">After meals</option>
              <option value="with meals">With meals</option>
              <option value="no preference">No preference</option>
            </select>
          </div>

          <div className="db-field">
            <label htmlFor="med-type">Medication Type</label>
            <select id="med-type" name="drugType" value={form.drugType} onChange={handleChange} className="db-input">
              <option value="pill">Pill</option>
              <option value="syrup">Syrup</option>
              <option value="injection">Injection</option>
              <option value="drops">Drops</option>
              <option value="powder">Powder</option>
              <option value="inhaler">Inhaler</option>
              <option value="others">Others</option>
            </select>
          </div>
        </div>

        <button type="submit" className="db-submit-btn" disabled={adding}>
          {adding ? 'Adding…' : '+ Add Medication'}
        </button>
      </form>
      {success && <p className="db-status db-status-ok">✓ {success}</p>}
      {error && <p className="db-status db-status-err">{error}</p>}
    </section>
  );
}

/* ─── Medication List Panel ──────────────────────────────────── */
function MedicationListPanel({ meds, loading, onStatusChange, onDelete, onEdit }) {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', dosage: '', scheduledTime: '09:00', mealRelation: 'before meals', drugType: 'pill' });
  const currentMeds = (meds || []).filter((med) => !['taken', 'missed'].includes(med.status));

  const startEdit = (med) => {
    const id = med._id || med.id;
    setEditingId(id);
    setEditForm({
      name: med.name || '',
      dosage: med.dosage || '',
      scheduledTime: med.scheduledTime || '09:00',
      mealRelation: med.mealRelation || 'before meals',
      drugType: med.drugType || 'pill',
    });
  };

  const handleEditChange = (e) => setEditForm({ ...editForm, [e.target.name]: e.target.value });

  const saveEdit = async (id) => {
    try {
      await onEdit(id, editForm);
      setEditingId(null);
    } catch (_) {}
  };

  if (loading) return <section className="db-panel"><p className="db-panel-empty">Loading medications…</p></section>;

  return (
    <section className="db-panel">
      <h3 className="db-panel-title">Upcoming <span className="db-count-badge">{currentMeds.length}</span></h3>
      {!currentMeds.length ? (
        <p className="db-panel-empty">No upcoming medications right now.</p>
      ) : (
        <div className="db-med-list">
          {currentMeds.map((med) => {
          const id = med._id || med.id;
          const statusClass = med.status === 'taken' ? 'db-med-taken' : med.status === 'missed' ? 'db-med-missed' : 'db-med-pending';
          const isEditing = editingId === id;

          return (
            <div key={id} className={`db-med-row ${statusClass}`}>
              {isEditing ? (
                <div className="db-med-info" style={{ width: '100%' }}>
                  <div className="db-form-row" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
                    <div className="db-field">
                      <label>Medication Name</label>
                      <input className="db-input" name="name" value={editForm.name} onChange={handleEditChange} />
                    </div>
                    <div className="db-field">
                      <label>Dosage / Notes</label>
                      <input className="db-input" name="dosage" value={editForm.dosage} onChange={handleEditChange} />
                    </div>
                    <div className="db-field db-field-sm">
                      <label>Time</label>
                      <input className="db-input" type="time" name="scheduledTime" value={editForm.scheduledTime} onChange={handleEditChange} />
                    </div>
                  </div>
                  <div className="db-form-row" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginTop: '12px' }}>
                    <div className="db-field">
                      <label>Meal Timing</label>
                      <select className="db-input" name="mealRelation" value={editForm.mealRelation} onChange={handleEditChange}>
                        <option value="before meals">Before meals</option>
                        <option value="after meals">After meals</option>
                        <option value="with meals">With meals</option>
                        <option value="no preference">No preference</option>
                      </select>
                    </div>
                    <div className="db-field">
                      <label>Medication Type</label>
                      <select className="db-input" name="drugType" value={editForm.drugType} onChange={handleEditChange}>
                        <option value="pill">Pill</option>
                        <option value="syrup">Syrup</option>
                        <option value="injection">Injection</option>
                        <option value="drops">Drops</option>
                        <option value="powder">Powder</option>
                        <option value="inhaler">Inhaler</option>
                        <option value="others">Others</option>
                      </select>
                    </div>
                  </div>
                  <div className="db-med-actions" style={{ justifyContent: 'flex-end', marginTop: '12px' }}>
                    <button type="button" className="db-action-btn db-btn-take" onClick={() => saveEdit(id)}>Save</button>
                    <button type="button" className="db-action-btn db-btn-miss" onClick={() => setEditingId(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="db-med-info">
                    <div className="db-med-name">{med.name}</div>
                    {med.dosage && <div className="db-med-dosage">{med.dosage}</div>}
                    <div className="db-med-meta">
                      {med.scheduledTime && <span><CalIcon /> {med.scheduledTime}</span>}
                      {med.mealRelation && <span><MealIcon /> {med.mealRelation}</span>}
                      {med.drugType && <span><PillIcon /> {med.drugType}</span>}
                      <span className={`db-status-badge db-badge-${med.status}`}>{med.status}</span>
                    </div>
                  </div>
                  <div className="db-med-actions">
                    <button className="db-action-btn db-btn-take" onClick={() => startEdit(med)} title="Edit medication">
                      <EditIcon /> Edit
                    </button>
                    {med.status !== 'taken' && (
                      <button className="db-action-btn db-btn-take" onClick={() => onStatusChange(id, 'taken')} title="Mark as taken">
                        <CheckIcon /> Taken
                      </button>
                    )}
                    {med.status !== 'missed' && (
                      <button className="db-action-btn db-btn-miss" onClick={() => onStatusChange(id, 'missed')} title="Mark as missed">
                        <XIcon /> Missed
                      </button>
                    )}
                    {(med.status === 'taken' || med.status === 'missed') && (
                      <button className="db-action-btn db-btn-reset" onClick={() => onStatusChange(id, 'pending')} title="Reset to pending">
                        ↺ Reset
                      </button>
                    )}
                    <button className="db-action-btn db-btn-del" onClick={() => onDelete(id)} title="Delete">
                      <TrashIcon />
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
        </div>
      )}
    </section>
  );
}

function NotificationsPanel({ notifications, onDeleteNotification }) {
  const recent = (notifications || []).slice(0, 10);

  return (
    <section className="db-panel">
      <h3 className="db-panel-title">Notifications</h3>
      {recent.length === 0 ? (
        <p className="db-panel-empty">No medication updates yet.</p>
      ) : (
        <div className="db-invite-list">
          {recent.map((note) => (
            <div key={note._id || `${note.title}-${note.createdAt}`} className="db-patient-row" style={{ borderLeft: `4px solid ${note.type === 'missed-dose' ? '#DC2626' : '#10B981'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <strong>{note.title}</strong>
                  <div className="db-invite-rel">Patient: {note.patientName || note.sender?.name || 'Patient'}</div>
                  <div className="db-invite-rel">Medication: {note.medicationName || 'Medication'}</div>
                  <div className="db-invite-rel">{note.message}</div>
                </div>
                {onDeleteNotification && (
                  <button
                    type="button"
                    className="db-notification-delete-btn"
                    onClick={() => onDeleteNotification(note._id)}
                    aria-label="Delete notification"
                    title="Delete notification"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ─── Main Dashboard Page ────────────────────────────────────── */
export default function Dashboard() {
  const { user, logout } = useAuth();

  // Stats state
  const [stats, setStats] = useState({ medications: 0, takenToday: 0, upcoming: 0, missed: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  // Medication list state
  const [meds, setMeds] = useState([]);
  const [medsLoading, setMedsLoading] = useState(true);

  // Scroll-to-add-panel ref
  const [showAddPanel, setShowAddPanel] = useState(false);

  // Patient invite state
  const [caregiverEmail, setCaregiverEmail] = useState('');
  const [relationship, setRelationship] = useState('');
  const [inviteStatus, setInviteStatus] = useState('');

  // Caregiver state
  const [pendingInvites, setPendingInvites] = useState([]);
  const [patients, setPatients] = useState([]);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [message, setMessage] = useState('');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [lastViewedAt, setLastViewedAt] = useState(() => {
    try {
      const raw = localStorage.getItem('mediremind-last-viewed-notification');
      return raw ? Number(raw) : 0;
    } catch (_) {
      return 0;
    }
  });
  const notificationsRef = useRef(null);

  const unreadNotifications = (notifications || []).filter((note) => {
    const time = new Date(note?.createdAt || 0).getTime();
    return !Number.isNaN(time) && time > lastViewedAt;
  });

  useEffect(() => {
    localStorage.setItem('mediremind-last-viewed-notification', String(lastViewedAt));
  }, [lastViewedAt]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!isNotificationsOpen) return;
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isNotificationsOpen]);

  /* ── Fetch stats ─────────────────────────────────────────── */
  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const res = await api.get('/medications/stats');
      setStats(res.data);
    } catch (_) { /* silently fail */ }
    finally { setStatsLoading(false); }
  }, []);

  /* ── Fetch medication list ───────────────────────────────── */
  const fetchMeds = useCallback(async () => {
    try {
      setMedsLoading(true);
      const res = await api.get('/medications');
      setMeds(res.data);
    } catch (_) { }
    finally { setMedsLoading(false); }
  }, []);

  /* ── Refresh both stats + list ───────────────────────────── */
  const refresh = useCallback(() => {
    fetchStats();
    fetchMeds();
  }, [fetchStats, fetchMeds]);

  useEffect(() => {
    refresh();
    if (user?.role === 'caregiver') fetchCaregiverData();
  }, [user]);

  /* ── Update status (taken / missed / pending) ────────────── */
  const handleStatusChange = async (id, status) => {
    try {
      const res = await api.patch(`/medications/${id}/status`, { status });
      setMeds((prev) => prev.map((m) => (m._id === id || m.id === id) ? res.data : m));
      fetchStats();
      if (user?.role === 'caregiver') fetchCaregiverData();
    } catch (err) {
      console.error('Status update failed', err);
    }
  };

  /* ── Delete medication ───────────────────────────────────── */
  const handleDelete = async (id) => {
    try {
      await api.delete(`/medications/${id}`);
      setMeds((prev) => prev.filter((m) => m._id !== id && m.id !== id));
      fetchStats();
    } catch (_) { }
  };

  const handleDeleteNotification = async (id) => {
    try {
      await api.delete(`/caregivers/notifications/${id}`);
      setNotifications((prev) => prev.filter((note) => (note._id || note.id) !== id));
    } catch (_) { }
  };

  const handleClearAllNotifications = async () => {
    try {
      await api.delete('/caregivers/notifications');
      setNotifications([]);
      setIsNotificationsOpen(true);
    } catch (_) { }
  };

  /* ── Caregiver actions ───────────────────────────────────── */
  const fetchCaregiverData = async () => {
    try {
      const [pendingRes, patientsRes, alertsRes, notificationsRes] = await Promise.all([
        api.get('/caregivers/pending-invites'),
        api.get('/caregivers/my-patients'),
        api.get('/caregivers/alerts'),
        api.get('/caregivers/notifications'),
      ]);
      setPendingInvites(pendingRes.data.invites || []);
      setPatients(patientsRes.data.patients || []);
      setLowStockAlerts(alertsRes.data.alerts || []);
      setNotifications(notificationsRes.data.notifications || []);
    } catch (err) { console.error(err); }
  };

  const handleInviteCaregiver = async (e) => {
    e.preventDefault(); setInviteStatus('');
    try {
      await api.post('https://mediremindplus.onrender.com/api/caregivers/invite', { caregiverEmail, relationship });
      setInviteStatus('Caregiver invited successfully!');
      setCaregiverEmail(''); setRelationship('');
    } catch (err) {
      setInviteStatus(err.response?.data?.message || 'Failed to send invite');
    }
  };

  const handleAcceptInvite = async (linkId) => {
    try {
      await api.put(`/caregivers/accept/${linkId}`);
      setMessage('Invite accepted successfully!');
      fetchCaregiverData();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to accept invite');
    }
  };

  const handleLogout = () => { logout(); window.location.href = '/'; };

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const res = await api.get('/caregivers/notifications');
        setNotifications(res.data.notifications || []);
      } catch (_) {
        setNotifications([]);
      }
    };

    if (user?.role === 'caregiver' || user?.role === 'patient') {
      loadNotifications();
    }
  }, [user]);

  return (
    <div className="db-page">
      <DashNavbar
        user={user}
        onLogout={handleLogout}
        notifications={notifications}
        onToggleNotifications={() => {
          setIsNotificationsOpen((prev) => {
            const next = !prev;
            if (next && notifications.length) {
              const newestTimestamp = notifications.reduce((max, note) => {
                const time = new Date(note?.createdAt || 0).getTime();
                return Number.isNaN(time) ? max : Math.max(max, time);
              }, 0);
              if (newestTimestamp > lastViewedAt) {
                setLastViewedAt(newestTimestamp);
              }
            }
            return next;
          });
        }}
        isNotificationsOpen={isNotificationsOpen}
        notificationCount={unreadNotifications.length}
      />

      {isNotificationsOpen && (
        <aside ref={notificationsRef} className="db-notifications-popover">
          <div className="db-notifications-header">
            <h3>Notifications</h3>
            <div className="db-notification-header-actions">
              {notifications.length > 0 && (
                <button type="button" className="db-notification-clear-btn" onClick={handleClearAllNotifications}>Clear all</button>
              )}
              <button type="button" className="db-notifications-close" onClick={() => setIsNotificationsOpen(false)}>Close</button>
            </div>
          </div>

          {notifications.length === 0 ? (
            <p className="db-panel-empty">No medication updates yet.</p>
          ) : (
            <div className="db-notifications-scroll">
              <div className="db-invite-list">
                {notifications.map((note) => (
                  <div key={note._id || `${note.title}-${note.createdAt}`} className="db-patient-row" style={{ borderLeft: `4px solid ${note.type === 'missed-dose' ? '#DC2626' : '#10B981'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <strong>{note.title}</strong>
                        <div className="db-invite-rel">Patient: {note.patientName || note.sender?.name || 'Patient'}</div>
                        <div className="db-invite-rel">Medication: {note.medicationName || 'Medication'}</div>
                        <div className="db-invite-rel">{note.message}</div>
                      </div>
                      <button
                        type="button"
                        className="db-notification-delete-btn"
                        onClick={() => handleDeleteNotification(note._id)}
                        aria-label="Delete notification"
                        title="Delete notification"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      )}

      <DashHero />
      <DashStats stats={stats} loading={statsLoading} />

      <div className="db-management">
        {/* ── Medication list with status controls ── */}
        <MedicationListPanel
          meds={meds}
          loading={medsLoading}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
          onEdit={async (id, payload) => {
            const res = await api.patch(`/medications/${id}`, payload);
            setMeds((prev) => prev.map((m) => (m._id === id || m.id === id ? res.data : m)));
            fetchStats();
          }}
        />

        {/* ── Patient: invite caregiver ── */}
        {user?.role === 'patient' && (
          <section className="db-panel">
            <h3 className="db-panel-title">Invite a Caregiver / Family Member</h3>
            <p className="db-panel-desc">Enter the registered email of your caregiver or family member.</p>
            <form onSubmit={handleInviteCaregiver} className="db-invite-form">
              <input type="email" placeholder="Caregiver's Email" value={caregiverEmail}
                onChange={(e) => setCaregiverEmail(e.target.value)} required className="db-input" />
              <input type="text" placeholder="Relationship (e.g. Daughter, Nurse)" value={relationship}
                onChange={(e) => setRelationship(e.target.value)} className="db-input" />
              <button type="submit" className="db-submit-btn">Send Invite</button>
            </form>
            {inviteStatus && (
              <p className={`db-status ${inviteStatus.includes('success') ? 'db-status-ok' : 'db-status-err'}`}>{inviteStatus}</p>
            )}
          </section>
        )}

        {/* ── Caregiver: invites + patients ── */}
        {user?.role === 'caregiver' && (
          <div className="db-caregiver-grid">
            {message && <p className="db-status db-status-ok">{message}</p>}
            <section className="db-panel">
              <h3 className="db-panel-title">Pending Patient Invitations</h3>
              {pendingInvites.length === 0 ? (
                <p className="db-panel-empty">No pending invitations.</p>
              ) : (
                <div className="db-invite-list">
                  {pendingInvites.map((invite) => (
                    <div key={invite._id} className="db-invite-row">
                      <div>
                        <strong>{invite.patient?.name}</strong> ({invite.patient?.email})
                        <div className="db-invite-rel">Relationship: {invite.relationship || 'Not specified'}</div>
                      </div>
                      <button onClick={() => handleAcceptInvite(invite._id)} className="db-accept-btn">Accept Invite</button>
                    </div>
                  ))}
                </div>
              )}
            </section>
            <section className="db-panel">
              <h3 className="db-panel-title">Missed Dose Alerts</h3>
              {notifications.length === 0 ? (
                <p className="db-panel-empty">No missed-dose alerts right now.</p>
              ) : (
                <div className="db-invite-list">
                  {notifications.map((note) => (
                    <div key={note._id} className="db-patient-row" style={{ borderLeft: '4px solid #DC2626' }}>
                      <strong>{note.title}</strong>
                      <div className="db-invite-rel">Patient: {note.patientName || note.sender?.name || 'Patient'}</div>
                      <div className="db-invite-rel">Medication: {note.medicationName || 'Medication'}</div>
                      <div className="db-invite-rel">{note.message}</div>
                    </div>
                  ))}
                </div>
              )}
            </section>
            <section className="db-panel">
              <h3 className="db-panel-title">Low-Stock Alerts</h3>
              {lowStockAlerts.length === 0 ? (
                <p className="db-panel-empty">No medication refill warnings right now.</p>
              ) : (
                <div className="db-invite-list">
                  {lowStockAlerts.map((alert, index) => (
                    <div key={`${alert.patientEmail}-${alert.medicationName}-${index}`} className="db-patient-row" style={{ borderLeft: '4px solid #F59E0B' }}>
                      <strong>{alert.patientName}</strong>
                      <div className="db-invite-rel">Medication: {alert.medicationName}</div>
                      <div className="db-invite-rel">Quantity left: {alert.quantity}</div>
                      <div className="db-invite-rel">Dosage: {alert.dosage || 'Not specified'}</div>
                    </div>
                  ))}
                </div>
              )}
            </section>
            <section className="db-panel">
              <h3 className="db-panel-title">Linked Patients</h3>
              {patients.length === 0 ? (
                <p className="db-panel-empty">No active patients linked yet.</p>
              ) : (
                <div className="db-invite-list">
                  {patients.map((link) => (
                    <div key={link._id} className="db-patient-row">
                      <strong>{link.patient?.name}</strong>
                      <div className="db-invite-rel">Email: {link.patient?.email} | Phone: {link.patient?.phone}</div>
                      <div className="db-invite-rel">Relationship: {link.relationship || 'N/A'}</div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>

      <footer className="db-footer">
        <span className="db-footer-logo">MEDIREMIND<span>+</span></span>
        <nav className="db-footer-nav">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/medications">Medications</Link>
          <Link to="/schedule">My Schedule</Link>
          <Link to="/refills">Refill Tracker</Link>
        </nav>
        <p className="db-footer-copy">© 2026 MediRemind+. All rights reserved.</p>
      </footer>
    </div>
  );
}
