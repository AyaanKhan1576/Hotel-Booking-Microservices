import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Navigation = () => {
  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">Hotel Booking</Navbar.Brand>
        <Nav className="me-auto">
          <Nav.Link as={Link} to="/hotels">Hotels</Nav.Link>
          <Nav.Link as={Link} to="/rooms">Rooms</Nav.Link>
        </Nav>
      </Container>
    </Navbar>
  );
};

export default Navigation;