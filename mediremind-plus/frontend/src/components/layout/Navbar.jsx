import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <header className="mr-navbar">
      <div className="mr-topbar">
        <Link to={user ? '/dashboard' : '/'} className="mr-logo">
          MEDIREMIND<span style={{ color: '#2F6FED' }}>+</span>
        </Link>
        <div className="mr-user">
          {user ? (
            <>
              <span className="mr-username">Hello, {user.name}</span>
              <button className="mr-logout" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/signup">Sign up</Link>
            </>
          )}
        </div>
      </div>

      <nav className="mr-navpill">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/medications">Medications</Link>
        <Link to="/schedule">My Schedule</Link>
        <Link to="/refills">Refill Tracker</Link>
      </nav>
    </header>
  );
}
