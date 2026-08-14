import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/layout/Footer';
import './Auth.css';

export default function Auth({ initialTab = 'login' }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup form state
  const [signupForm, setSignupForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    location: '',
    role: 'patient',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignupChange = (e) => {
    setSignupForm({ ...signupForm, [e.target.name]: e.target.value });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(loginEmail, loginPassword);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signup(signupForm);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    setError('');
  };

  return (
    <div className="auth-container">
      <header className="auth-header">
        <Link to="/" className="auth-logo">
          MEDIREMIND<span style={{ color: '#2F6FED' }}>+</span>
        </Link>
      </header>

      <div className="auth-card-wrapper">
        <div className="auth-card">
          <div className="auth-tabs">
            <button
              className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => switchTab('login')}
            >
              Log In
            </button>
            <button
              className={`auth-tab ${activeTab === 'signup' ? 'active' : ''}`}
              onClick={() => switchTab('signup')}
            >
              Sign Up
            </button>
          </div>

          {activeTab === 'login' ? (
            <div>
              <h2 className="auth-title">Welcome Back</h2>
              <p className="auth-subtitle">Sign in to manage your health and medication schedule</p>

              <form onSubmit={handleLoginSubmit} className="auth-form">
                <div className="auth-field">
                  <label htmlFor="login-email">Email Address</label>
                  <input
                    id="login-email"
                    type="email"
                    placeholder="name@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="auth-field">
                  <label htmlFor="login-password">Password</label>
                  <input
                    id="login-password"
                    type="password"
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="auth-submit-btn" disabled={loading}>
                  {loading ? 'Logging in...' : 'Log In'}
                </button>
              </form>

              <div className="auth-footer-text">
                Don't have an account?{' '}
                <button type="button" onClick={() => switchTab('signup')}>
                  Sign up now
                </button>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="auth-title">Create Account</h2>
              <p className="auth-subtitle">Join MediRemind Plus to keep track of medications effortlessly</p>

              <form onSubmit={handleSignupSubmit} className="auth-form">
                <div className="auth-field">
                  <label htmlFor="signup-name">Full Name</label>
                  <input
                    id="signup-name"
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    value={signupForm.name}
                    onChange={handleSignupChange}
                    required
                  />
                </div>

                <div className="auth-field">
                  <label htmlFor="signup-email">Email Address</label>
                  <input
                    id="signup-email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    value={signupForm.email}
                    onChange={handleSignupChange}
                    required
                  />
                </div>

                <div className="auth-field">
                  <label htmlFor="signup-phone">Phone Number</label>
                  <input
                    id="signup-phone"
                    name="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={signupForm.phone}
                    onChange={handleSignupChange}
                    required
                  />
                </div>

                <div className="auth-field">
                  <label htmlFor="signup-location">Location (City, Country)</label>
                  <input
                    id="signup-location"
                    name="location"
                    type="text"
                    placeholder="e.g. New York, USA"
                    value={signupForm.location}
                    onChange={handleSignupChange}
                  />
                </div>

                <div className="auth-field">
                  <label htmlFor="signup-password">Password</label>
                  <input
                    id="signup-password"
                    name="password"
                    type="password"
                    placeholder="At least 6 characters"
                    value={signupForm.password}
                    onChange={handleSignupChange}
                    required
                    minLength={6}
                  />
                </div>

                <div className="auth-field">
                  <label htmlFor="signup-role">I am a...</label>
                  <select id="signup-role" name="role" value={signupForm.role} onChange={handleSignupChange}>
                    <option value="patient">Patient</option>
                    <option value="caregiver">Caregiver / Family Member</option>
                  </select>
                </div>

                <button type="submit" className="auth-submit-btn" disabled={loading}>
                  {loading ? 'Creating Account...' : 'Sign Up'}
                </button>
              </form>

              <div className="auth-footer-text">
                Already have an account?{' '}
                <button type="button" onClick={() => switchTab('login')}>
                  Log in
                </button>
              </div>
            </div>
          )}

          {error && <div className="auth-error">{error}</div>}
        </div>
      </div>

      <Footer />
    </div>
  );
}
