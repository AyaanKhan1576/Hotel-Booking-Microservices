import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookingAPI } from '../api';
import FeedbackForm from './FeedbackForm';
import {
  Container,
  Card,
  Button,
  Alert,
  Row,
  Col,
  Badge,
  Spinner,
  Form
} from 'react-bootstrap';

const BookingDetails = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [updateData, setUpdateData] = useState({ additionalServices: {} });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const navigate = useNavigate();

  const fetchBooking = useCallback(async () => {
    try {
      setLoading(true);
      const res = await BookingAPI.get(`/bookings/${id}`);
      setBooking(res.data);
      setUpdateData({
        additionalServices: res.data.additionalServices
      });
    } catch (err) {
      setMessage(err.response?.data?.msg || 'Error fetching booking details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBooking();
  }, [id, fetchBooking]);

  const handleUpdateChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUpdateData((prev) => ({
      ...prev,
      additionalServices: {
        ...prev.additionalServices,
        [name]: type === 'checkbox' ? checked : value
      }
    }));
  };

  const handleUpdate = async () => {
    try {
      setUpdating(true);
      const res = await BookingAPI.put(`/bookings/${id}`, updateData);
      setBooking(res.data);
      setMessage({ type: 'success', content: 'Booking updated successfully!' });
    } catch (err) {
      setMessage({ type: 'danger', content: err.response?.data?.msg || 'Error updating booking' });
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      setCancelling(true);
      await BookingAPI.delete(`/bookings/${id}`);
      setMessage({ type: 'success', content: 'Booking cancelled successfully!' });
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setMessage({ type: 'danger', content: err.response?.data?.msg || 'Error cancelling booking' });
    } finally {
      setCancelling(false);
    }
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

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  if (!booking) {return (
    <Container className="py-4">
      <Alert variant="danger">Booking not found</Alert>
      <Button variant="primary" onClick={() => navigate('/')}>
        Back to Home
      </Button>
    </Container>
  );}

  return (
  <Container className="py-4">
  <Button variant="outline-primary" onClick={() => navigate(-1)} className="mb-4">
  <i className="bi bi-arrow-left me-1"></i>Back
  </Button>  {message && (
    <Alert variant={message.type} className="mb-4">
      {message.content}
    </Alert>
  )}

  <Card className="shadow-sm mb-4">
    <Card.Header className="bg-primary text-white">
      <h3 className="mb-0">Booking Details</h3>
    </Card.Header>
    <Card.Body>
      <Row>
        <Col md={6}>
          <div className="mb-4">
            <h5 className="text-primary">Guest Information</h5>
            <div className="ps-3">
              <p>
                <strong>Name:</strong> {booking.guestName}
              </p>
              <p>
                <strong>Email:</strong> {booking.guestEmail}
              </p>
              <p>
                <strong>Booking ID:</strong> {booking._id}
              </p>
            </div>
          </div>

          <div className="mb-4">
            <h5 className="text-primary">Dates</h5>
            <div className="ps-3">
              <p>
                <strong>Check-In:</strong>{' '}
                {new Date(booking.checkIn).toLocaleDateString()}
              </p>
              <p>
                <strong>Check-Out:</strong>{' '}
                {new Date(booking.checkOut).toLocaleDateString()}
              </p>
              <p>
                <strong>Status:</strong>{' '}
                <Badge bg={getStatusBadge(booking.paymentStatus)}>
                  {booking.paymentStatus}
                </Badge>
              </p>
            </div>
          </div>
        </Col>

        <Col md={6}>
          <div className="mb-4">
            <h5 className="text-primary">Room Information</h5>
            <div className="ps-3">
              <p>
                <strong>Room Number:</strong>{' '}
                {booking.roomDetails?.roomNumber || 'N/A'}
              </p>
              <p>
                <strong>Room Type:</strong> {booking.roomDetails?.type || 'N/A'}
              </p>
              <p>
                <strong>Price per night:</strong> $
                {booking.roomDetails?.price || 'N/A'}
              </p>
            </div>
          </div>

          <div className="mb-4">
            <h5 className="text-primary">Loyalty Program</h5>
            <div className="ps-3">
              <p>
                <strong>Points Used:</strong> {booking.loyalty.pointsUsed}
              </p>
              <p>
                <strong>Coupon Code:</strong>{' '}
                {booking.loyalty.couponCode || 'None'}
              </p>
              <p>
                <strong>Discount Applied:</strong>{' '}
                {booking.loyalty.isPercentage
                  ? `${booking.loyalty.discountApplied}%`
                  : `$${booking.loyalty.discountApplied}`}
              </p>
            </div>
          </div>
        </Col>
      </Row>
    </Card.Body>
  </Card>

  <Card className="shadow-sm mb-4">
    <Card.Header className="bg-light">
      <h5 className="mb-0">Additional Services</h5>
    </Card.Header>
    <Card.Body>
      <Row>
        <Col md={6}>
          <Form.Check
            type="checkbox"
            label="Breakfast"
            name="breakfast"
            checked={updateData.additionalServices?.breakfast || false}
            onChange={handleUpdateChange}
            className="mb-3"
          />
          <Form.Check
            type="checkbox"
            label="Airport Transport"
            name="airportTransport"
            checked={updateData.additionalServices?.airportTransport || false}
            onChange={handleUpdateChange}
            className="mb-3"
          />
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Special Accommodations</Form.Label>
            <Form.Control
              type="text"
              name="specialAccommodations"
              value={updateData.additionalServices?.specialAccommodations || ''}
              onChange={handleUpdateChange}
            />
          </Form.Group>
        </Col>
      </Row>
      <div className="d-flex justify-content-end mt-3 gap-2">
        <Button
          variant="outline-primary"
          onClick={handleUpdate}
          disabled={updating}
        >
          {updating ? (
            <Spinner as="span" size="sm" animation="border" />
          ) : (
            'Update Services'
          )}
        </Button>
        <Button
          variant="outline-danger"
          onClick={handleCancel}
          disabled={cancelling}
        >
          {cancelling ? (
            <Spinner as="span" size="sm" animation="border" />
          ) : (
            'Cancel Booking'
          )}
        </Button>
      </div>
    </Card.Body>
  </Card>

  <FeedbackForm
    bookingId={id}
    guestEmail={booking.guestEmail}
    checkOut={booking.checkOut}
    onSubmit={fetchBooking}
  />
</Container>);
};

export default BookingDetails;