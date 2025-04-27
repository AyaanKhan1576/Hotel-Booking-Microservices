// Homepage.jsx
import { Link } from 'react-router-dom';
import './Homepage.css'; 

const Homepage = () => {
  return (
    <div className="homepage-container">
      <div className="hero-section">
        <h1 className="hero-title">Welcome to TravelStay</h1>
        <p className="hero-subtitle">Your Perfect Getaway Awaits</p>
        
        <div className="auth-buttons">
          <Link to="/login" className="auth-btn login-btn">
            <span className="btn-icon">🔒</span>
            Sign In
          </Link>
          <Link to="/register" className="auth-btn register-btn">
            <span className="btn-icon">📝</span>
            Create Account
          </Link>
        </div>
      </div>

      <div className="features-section">
        <div className="feature-card">
          <h3>✈️ Travel Agents</h3>
          <p>Special group booking tools and commission management</p>
        </div>
        <div className="feature-card">
          <h3>🏨 Hotel Managers</h3>
          <p>Manage your property listings and reservations</p>
        </div>
        <div className="feature-card">
          <h3>🌍 Regular Users</h3>
          <p>Find the best deals for your next adventure</p>
        </div>
      </div>
    </div>
  );
};

export default Homepage;