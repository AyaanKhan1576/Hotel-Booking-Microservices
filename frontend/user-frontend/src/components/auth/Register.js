// src/components/auth/Register.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../../services/authService';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // register() returns the parsed JSON: { message: "...", userId: ... }
      const response = await register(formData);

      if (response?.message) {
        navigate('/login', {
          state: {
            registrationSuccess: true,
            message: 'Registration successful! Please login.'
          }
        });
      } else {
        // Should never hit this if backend adheres to the contract
        throw new Error('Unexpected response from server');
      }
    } catch (err) {
      // err may be an Axios error wrapper, so dig into err.response.data
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-form">
      <h2>Register</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter password (min 6 characters)"
            minLength="6"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="role">Account Type</label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            disabled={isSubmitting}
          >
            <option value="user">Regular User</option>
            <option value="hotelManagement">Hotel Manager</option>
            <option value="travelAgent">Travel Agent</option>
          </select>
        </div>

        <button
          type="submit"
          className="submit-btn"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="spinner"></span> Registering...
            </>
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      <div className="auth-footer">
        Already have an account? <a href="/login">Sign in</a>
      </div>
    </div>
  );
};

export default Register;
