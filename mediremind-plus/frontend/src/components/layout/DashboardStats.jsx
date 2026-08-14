import './DashboardStats.css';

export default function DashboardStats({ stats }) {
  const { medications = 0, takenToday = 0, upcoming = 0, missed = 0 } = stats || {};

  return (
    <section className="mr-stats-section">
      <span className="mr-pill-label">Dashboard</span>

      <div className="mr-stats-header">
        <h2>
          Your Health,
          <br />
          Right On Time.
        </h2>
        <div className="mr-stats-header-right">
          <p>Get smart medication reminders that keep you on track, wherever life takes you.</p>
          <button className="mr-log-med">
            <span className="mr-log-med-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="5" width="16" height="14" rx="3" />
                <path d="M8 5V3" />
                <path d="M16 5V3" />
                <path d="M8 12h8" />
                <path d="M12 8v8" />
              </svg>
            </span>
            Log Medication
          </button>
        </div>
      </div>

      <div className="mr-stats-grid">
        <div className="mr-stat-card">
          <span className="mr-dot mr-dot-blue" />
          <p className="mr-stat-label">Medications</p>
          <p className="mr-stat-value" style={{ color: 'black' }}>{medications}</p>
        </div>
        <div className="mr-stat-card">
          <span className="mr-dot mr-dot-green" />
          <p className="mr-stat-label">Taken Today</p>
          <p className="mr-stat-value" style={{ color: 'black' }}>{takenToday}</p>
          <p className="mr-stat-sub">at 9:00am</p>
        </div>
        <div className="mr-stat-card">
          <span className="mr-dot mr-dot-navy" />
          <p className="mr-stat-label">Upcoming</p>
          <p className="mr-stat-value" style={{ color: 'black' }}>{upcoming}</p>
          <p className="mr-stat-sub">at 9:00am</p>
        </div>
        <div className="mr-stat-card">
          <span className="mr-dot mr-dot-coral" />
          <p className="mr-stat-label">Missed Medications</p>
          <p className="mr-stat-value" style={{ color: 'black' }}>{missed}</p>
        </div>
      </div>

      <div className="mr-stats-footer-cards">
        <div className="mr-info-card">
          <span className="mr-info-card-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 4a5 5 0 0 0-5 5v2.2c0 .8-.2 1.5-.6 2.2L5 15h14l-1.4-1.6a3.6 3.6 0 0 1-.6-2.2V9a5 5 0 0 0-5-5Z" />
              <path d="M10 18a2 2 0 0 0 4 0" />
            </svg>
          </span>
          Notifications
        </div>
        <div className="mr-info-card">
          <span className="mr-info-card-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="5" width="16" height="15" rx="3" />
              <path d="M8 3v4" />
              <path d="M16 3v4" />
              <path d="M8 11h8" />
              <path d="M8 15h5" />
            </svg>
          </span>
          Medischedule
        </div>
      </div>
    </section>
  );
}
