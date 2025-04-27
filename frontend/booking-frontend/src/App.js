import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Navbar, Nav, Container } from 'react-bootstrap';
import BookingForm from './components/BookingForm';
import BookingList from './components/BookingList';
import BookingDetails from './components/BookingDetails';
import GroupBookingForm from './components/GroupBookingForm';
import './index.css';

function App() {
  return (
    <Router>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand as={Link} to="/">Booking Service</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/">New Booking</Nav.Link>
              <Nav.Link as={Link} to="/bookings">My Bookings</Nav.Link>
              <Nav.Link as={Link} to="/group-booking">Group Booking</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container className="mt-4">
        <Routes>
          <Route path="/" element={<BookingForm />} />
          <Route path="/bookings" element={<BookingList />} />
          <Route path="/booking/:id" element={<BookingDetails />} />
          <Route path="/group-booking" element={<GroupBookingForm />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;