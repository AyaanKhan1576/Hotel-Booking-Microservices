import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Navbar, Nav, Container } from 'react-bootstrap';
import BookingForm from './components/BookingForm';
import BookingList from './components/BookingList';
import BookingDetails from './components/BookingDetails';
import GroupBookingForm from './components/GroupBookingForm';
import { UserAPI } from './api';
import './index.css';

function App() {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        // Use UserAPI instead of generic 'api'
        const response = await UserAPI.get('/users/me');
        setUserRole(response.data.role); // Assuming response contains role directly
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch user role');
        if (err.response?.status === 401) {
          window.location.href = '/login';
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, []);


  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  return (
    <Router>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand as={Link} to="/">Booking Service</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
            {userRole === 'user' && (
    <>
      <Nav.Link as={Link} to="/">New Booking</Nav.Link>
      <Nav.Link as={Link} to="/bookings">My Bookings</Nav.Link>
    </>
  )}
  
  {userRole === 'travelAgent' && (
    <Nav.Link as={Link} to="/group-booking">Group Booking</Nav.Link>
  )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container className="mt-4">
        <Routes>
        {userRole === 'user' && (
            <>
              <Route path="/" element={<BookingForm />} />
              <Route path="/bookings" element={<BookingList />} />
              <Route path="/booking/:id" element={<BookingDetails />} />
            </>
          )}
          {userRole === 'travelAgent' && (
            <Route path="/group-booking" element={<GroupBookingForm />} />
          )}
          {/* Fallback redirect for unauthorized roles */}
          <Route path="*" element={<div>Access Denied</div>} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;