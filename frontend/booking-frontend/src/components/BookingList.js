// Updated BookingList.js
import React, { useState } from 'react';
import API from '../api';
import { Link } from 'react-router-dom';
import { Form, Button, Alert, Card, Row, Col } from 'react-bootstrap';

const BookingList = () => {
  const [guestEmail, setGuestEmail] = useState('');
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const res = await API.get('/bookings/search', { params: { guestEmail } });
      setBookings(res.data);
      setMessage('');
    } catch (err) {
      setMessage('Error fetching bookings');
    }
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
                    Total: ${b.totalPrice} <br />
                    Status: {b.paymentStatus} <br />
                    Loyalty Used: {b.loyalty.pointsUsed} pts, Coupon: {b.loyalty.couponCode} <br />
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
