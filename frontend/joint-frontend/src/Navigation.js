// shared/Navigation.js
import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from './src-user/context/AuthContext';

const Navigation = () => {
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/">Home</Link>
      
      {isAuthenticated ? (
        <>
          {/* Shared Links */}
          {user?.role === 'user' && <Link to="/new-booking">Book a Room</Link>}
          {user?.role === 'travelAgent' && <Link to="/group-booking">Group Booking</Link>}
          {user?.role === 'hotelManagement' && <Link to="/hotels">Manage Hotels</Link>}
          {user?.role === 'admin' && <Link to="/users">Manage Users</Link>}
          
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </>
      )}
    </nav>
  );
};

export default Navigation;