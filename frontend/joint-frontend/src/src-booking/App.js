import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Navbar, Nav, Container, Spinner } from 'react-bootstrap';
import { FaHotel, FaUser, FaUsers, FaArrowLeft, FaCalendarAlt } from 'react-icons/fa';
import BookingForm from './components/BookingForm';
import BookingList from './components/BookingList';
import BookingDetails from './components/BookingDetails';
import GroupBookingForm from './components/GroupBookingForm';
import { UserAPI } from './api';
import './style.css';

const NavigationHeader = ({ userRole }) => {
  const location = useLocation();
  const isBookingDetails = location.pathname.includes('/booking/');
  const isBookingForm = location.pathname === '/';
  const isBookingsList = location.pathname === '/bookings';
  const isGroupBooking = location.pathname === '/group-booking';

  return (
    <Navbar bg="primary" variant="dark" expand="lg" className="shadow">
      <Container>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <FaHotel className="me-2" />
          <span>Booking Service</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            {isBookingDetails && (
              <Nav.Link as={Link} to={isBookingsList ? '/bookings' : '/'} className="d-flex align-items-center">
                <FaArrowLeft className="me-1" />
                Back
              </Nav.Link>
            )}
            {userRole === 'user' && (
              <>
                {!isBookingForm && (
                  <Nav.Link as={Link} to="/" className="d-flex align-items-center">
                    <FaUser className="me-1" />
                    New Booking
                  </Nav.Link>
                )}
                {!isBookingsList && (
                  <Nav.Link as={Link} to="/bookings" className="d-flex align-items-center">
                    <FaCalendarAlt className="me-1" />
                    View Bookings
                  </Nav.Link>
                )}
              </>
            )}
            {userRole === 'travelAgent' && !isGroupBooking && (
              <Nav.Link as={Link} to="/group-booking" className="d-flex align-items-center">
                <FaUsers className="me-1" />
                Group Booking
              </Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

function App() {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await UserAPI.get('/users/me');
        setUserRole(response.data.role);
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

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <Alert variant="danger" className="text-center">
          {error}
        </Alert>
      </div>
    );
  }

  return (
    <Router>
      <NavigationHeader userRole={userRole} />
      <Container className="py-4">
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
          <Route path="*" element={
            <div className="text-center py-5">
              <h3 className="text-muted">Access Denied</h3>
              <p>You don't have permission to access this page.</p>
              <Button as={Link} to="/" variant="primary">
                Go to Home
              </Button>
            </div>
          } />
        </Routes>
      </Container>
      <footer className="bg-light py-4 mt-5">
        <Container className="text-center text-muted">
          <p className="mb-0">© 2023 Hotel Booking System. All rights reserved.</p>
        </Container>
      </footer>
    </Router>
  );
}

export default App;