import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext); // Get user from context
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userData = await login({ email, password });
      
      switch (userData.role) {
        case 'user':
          window.location.href = 'http://localhost:3002';
          break;
        case 'travelAgent':
          window.location.href = 'http://localhost:3002/group-booking';
          break;
        case 'hotelManagement':
          window.location.href = 'http://localhost:3001/';
          break;
        default:
          navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    }
  };

  return (
    <div className="auth-form">
      <h2>Login</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;