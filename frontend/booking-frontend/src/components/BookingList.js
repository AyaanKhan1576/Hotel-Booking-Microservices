import React, { useState } from 'react';
import { BookingAPI } from '../api';
import { Link } from 'react-router-dom';
import { Form, Button, Alert, Card, Row, Col } from 'react-bootstrap';

const BookingList = () => {
  const [guestEmail, setGuestEmail] = useState('');
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const res = await BookingAPI.get('/bookings/search', { params: { email: guestEmail } });
      setBookings(res.data.bookings || []);
      setMessage(res.data.bookings.length === 0 ? 'No bookings found.' : '');
    } catch (err) {
      setMessage(err.response?.data?.msg || 'Error fetching bookings');
    }
  };

  const calculateTotalPrice = (booking) => {
    if (!booking.roomDetails?.price) return 0;
    const nights = (new Date(booking.checkOut) - new Date(booking.checkIn)) / (1000 * 60 * 60 * 24);
    return (booking.roomDetails.price * nights).toFixed(2);
  };

  return (
    <div className="p-4">
      <h2>My Bookings</h2>
      <form onSubmit={handleSearch} className="mb-4 d-flex gap-2 align-items-end">
        <Form.Group controlId="searchEmail">
          <Form.Label>Guest Email:</Form.Label>
          <Form.Control
            type="email"
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
            required
          />
        </Form.Group>
        <Button type="submit">Search</Button>
      </form>

      {message && <Alert variant="warning">{message}</Alert>}

      {bookings.length > 0 ? (
        <Row xs={1} md={2} lg={3} className="g-4">
          {bookings.map((b) => (
            <Col key={b._id}>
              <Card>
                <Card.Body>
                  <Card.Title>{b.guestName}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    {new Date(b.checkIn).toLocaleDateString()} to {new Date(b.checkOut).toLocaleDateString()}
                  </Card.Subtitle>
                  <Card.Text>
                    Room: {b.roomDetails?.roomNumber || 'N/A'} ({b.roomDetails?.type || 'N/A'})<br />
                    Total: ${calculateTotalPrice(b)}<br />
                    Status: {b.paymentStatus}<br />
                    Loyalty Used: {b.loyalty.pointsUsed} pts, Coupon: {b.loyalty.couponCode || 'None'}<br />
                    Discount: {b.loyalty.isPercentage ? `${b.loyalty.discountApplied}%` : `$${b.loyalty.discountApplied}`}
                  </Card.Text>
                  <Link to={`/booking/${b._id}`}>View Details</Link>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <p>No bookings found.</p>
      )}
    </div>
  );
};

export default BookingList;