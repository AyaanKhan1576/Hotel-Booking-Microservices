import React, { useState } from 'react';
import { BookingAPI } from '../api';
import { Link } from 'react-router-dom';
import { Form, Button, Alert, Card, Row, Col, Spinner, Container, Badge } from 'react-bootstrap';

const BookingList = () => {
  const [guestEmail, setGuestEmail] = useState('');
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await BookingAPI.get('/bookings/search', { params: { email: guestEmail } });
      setBookings(res.data.bookings || []);
      setMessage(res.data.bookings.length === 0 ? 'No bookings found for this email.' : '');
    } catch (err) {
      setMessage(err.response?.data?.msg || 'Error fetching bookings');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalPrice = (booking) => {
    if (!booking.roomDetails?.price) return 0;
    const nights = (new Date(booking.checkOut) - new Date(booking.checkIn)) / (1000 * 60 * 60 * 24);
    return (booking.roomDetails.price * nights).toFixed(2);
  };

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  return (
    <Container className="py-4">
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <h2 className="text-primary mb-4">My Bookings</h2>
          <Form onSubmit={handleSearch} className="mb-4">
            <Row className="align-items-end">
              <Col md={8}>
                <Form.Group controlId="searchEmail">
                  <Form.Label>Enter your email to view bookings:</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="your@email.com"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4} className="d-flex">
                <Button type="submit" className="w-100" disabled={loading}>
                  {loading ? (
                    <Spinner as="span" size="sm" animation="border" role="status" />
                  ) : (
                    'Search Bookings'
                  )}
                </Button>
              </Col>
            </Row>
          </Form>

          {message && (
            <Alert variant={bookings.length ? 'success' : 'warning'}>
              {message}
            </Alert>
          )}
        </Card.Body>
      </Card>

      {bookings.length > 0 ? (
        <Row xs={1} md={2} lg={3} className="g-4">
          {bookings.map((booking) => (
            <Col key={booking._id}>
              <Card className="h-100 shadow-sm card-hover">
                <Card.Header className="bg-primary text-white">
                  <Card.Title className="mb-0">{booking.guestName}</Card.Title>
                </Card.Header>
                <Card.Body>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Status:</span>
                    <Badge bg={getStatusBadge(booking.paymentStatus)}>
                      {booking.paymentStatus}
                    </Badge>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Dates:</span>
                    <span>
                      {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Room:</span>
                    <span>
                      #{booking.roomDetails?.roomNumber} ({booking.roomDetails?.type})
                    </span>
                  </div>
                  <div className="d-flex justify-content-between mb-3">
                    <span className="text-muted">Total:</span>
                    <span className="fw-bold">${calculateTotalPrice(booking)}</span>
                  </div>
                  <div className="d-grid">
                    <Button
                      as={Link}
                      to={`/booking/${booking._id}`}
                      variant="outline-primary"
                      size="sm"
                    >
                      View Booking Details
                    </Button>
                  </div>
                </Card.Body>
                <Card.Footer className="text-muted small">
                  <div className="d-flex justify-content-between">
                    <span>Booking ID: {booking._id.slice(-6)}</span>
                    <span>
                      {booking.loyalty.pointsUsed > 0 && (
                        <Badge bg="info" className="me-1">
                          {booking.loyalty.pointsUsed} pts
                        </Badge>
                      )}
                      {booking.loyalty.couponCode && (
                        <Badge bg="success">
                          {booking.loyalty.couponCode}
                        </Badge>
                      )}
                    </span>
                  </div>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Card className="text-center py-5">
          <Card.Body>
            <i className="bi bi-calendar-x text-muted" style={{ fontSize: '3rem' }}></i>
            <h5 className="mt-3 text-muted">No bookings found</h5>
            <p className="text-muted">Search with your email to find your bookings</p>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default BookingList;