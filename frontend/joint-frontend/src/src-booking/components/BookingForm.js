// src/components/BookingForm.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HotelAPI, BookingAPI, UserAPI } from '../api';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  ListGroup,
  ListGroupItem,
  Badge
} from 'react-bootstrap';
import deluxe_room from './imgs/deluxe.jpeg';
import std_room    from './imgs/standard.jpeg';
import suite_room  from './imgs/deluxe.jpeg';

const ROOM_TYPES = {
  Deluxe: {
    image: deluxe_room,
    description: 'Spacious room with premium amenities',
    badgeVariant: 'warning',
  },
  Standard: {
    image: std_room,
    description: 'Comfortable room with essential amenities',
    badgeVariant: 'primary',
  },
  Suite: {
    image: suite_room,
    description: 'Luxurious suite with separate living area',
    badgeVariant: 'danger',
  },
};

const BookingForm = () => {
  const navigate = useNavigate();
  const [hotels, setHotels]               = useState([]);
  const [selectedRoom, setSelectedRoom]   = useState(null);
  const [isLoyaltyCustomer, setLoyalty]   = useState(false);
  const [formData, setFormData]           = useState({
    checkIn: '',
    checkOut: '',
    guestName: '',
    guestEmail: '',
    loyaltyPoints: 0,
    loyaltyCoupon: '',
    additionalServices: {
      breakfast: false,
      airportTransport: false,
      specialAccommodations: '',
    },
  });
  const [message, setMessage]             = useState({ type: '', content: '' });

  // Load hotels on mount
  useEffect(() => {
    HotelAPI.get('/hotels')
      .then(res => setHotels(res.data))
      .catch(() =>
        setMessage({ type: 'danger', content: 'Error loading hotels' })
      );
  }, []);

  // Handle form inputs
  const handleInputChange = e => {
    const { name, value, type, checked } = e.target;
    if (['breakfast','airportTransport','specialAccommodations'].includes(name)) {
      setFormData(f => ({
        ...f,
        additionalServices: {
          ...f.additionalServices,
          [name]: type === 'checkbox' ? checked : value,
        },
      }));
    } else {
      setFormData(f => ({
        ...f,
        [name]: type === 'number' ? Number(value) : value,
      }));
    }
  };

  // Loyalty toggle
  const handleLoyaltyCheckbox = e => {
    const on = e.target.checked;
    setLoyalty(on);
    if (!on) {
      setFormData(f => ({ ...f, loyaltyPoints: 0, loyaltyCoupon: '' }));
    }
  };

  // Add a room to favorites
  const handleAddFavorite = async room => {
    try {
      const token  = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      if (!token || !userId) {
        throw new Error('You must be logged in to favorite rooms.');
      }

      await UserAPI.post(
        `/${userId}/favorites`,        // <-- Correct endpoint
        { itemId: room._id, type: 'room' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage({ type: 'success', content: 'Room added to favorites!' });
    } catch (err) {
      setMessage({
        type: 'danger',
        content: err.response?.data?.message || err.message
      });
    }
  };

  // Submit booking
  const handleSubmit = async e => {
    e.preventDefault();
    if (!selectedRoom) {
      return setMessage({ type: 'danger', content: 'Please select a room' });
    }

    const { checkIn, checkOut, guestName, guestEmail } = formData;
    if (!checkIn || !checkOut || !guestName || !guestEmail) {
      return setMessage({ type: 'danger', content: 'Please fill all fields' });
    }

    const inDate  = new Date(checkIn);
    const outDate = new Date(checkOut);
    if (outDate <= inDate) {
      return setMessage({ type: 'danger', content: 'Check-out must be after check-in' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
      return setMessage({ type: 'danger', content: 'Invalid email address' });
    }

    const payload = {
      roomId: selectedRoom._id,
      guestName,
      guestEmail,
      checkIn: inDate.toISOString(),
      checkOut: outDate.toISOString(),
      additionalServices: formData.additionalServices,
      loyaltyPoints: isLoyaltyCustomer ? formData.loyaltyPoints : 0,
      loyaltyCoupon: isLoyaltyCustomer ? formData.loyaltyCoupon : '',
    };

    try {
      const res = await BookingAPI.post('/bookings', payload);
      navigate(`/booking/${res.data.booking._id}`);
    } catch (err) {
      setMessage({
        type: 'danger',
        content: err.response?.data?.msg || 'Booking failed'
      });
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <Container className="my-5">
      <Button variant="info" onClick={() => navigate('/bookings')} className="mb-4">
        My Bookings
      </Button>
      {message.content && <Alert variant={message.type}>{message.content}</Alert>}

      {!selectedRoom ? (
        <>
          <h2 className="mb-4">Available Hotels</h2>
          <Row>
            {hotels.map(hotel => (
              <Col key={hotel._id} md={6} className="mb-4">
                <Card className="h-100 shadow">
                  <Card.Body>
                    <Card.Title>{hotel.name}</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">
                      {hotel.location}
                    </Card.Subtitle>
                    <Card.Text>{hotel.description}</Card.Text>
                    <h5>Rooms</h5>
                    {hotel.rooms?.length > 0 ? (
                      <ListGroup variant="flush">
                        {hotel.rooms.map(room => {
                          const cfg = ROOM_TYPES[room.type] || ROOM_TYPES.Standard;
                          return (
                            <ListGroupItem
                              key={room._id}
                              className="d-flex justify-content-between align-items-center"
                            >
                              <div className="d-flex align-items-center">
                                <img
                                  src={cfg.image}
                                  alt={room.type}
                                  style={{
                                    width: '100px',
                                    height: '70px',
                                    objectFit: 'cover',
                                    borderRadius: '5px',
                                    marginRight: '1rem'
                                  }}
                                />
                                <div>
                                  <strong>Room #{room.roomNumber || room.roomno}</strong>
                                  <div className="text-muted small">
                                    {cfg.description}
                                  </div>
                                  <div className="text-success">
                                    ${room.price}/night
                                  </div>
                                </div>
                              </div>
                              <div>
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() => setSelectedRoom(room)}
                                >
                                  Select
                                </Button>{' '}
                                <Button
                                  variant="outline-success"
                                  size="sm"
                                  onClick={() => handleAddFavorite(room)}
                                >
                                  Favorite
                                </Button>
                              </div>
                            </ListGroupItem>
                          );
                        })}
                      </ListGroup>
                    ) : (
                      <Alert variant="info">No rooms available</Alert>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </>
      ) : (
        <Card className="p-4 shadow">
          <h3>Complete Your Booking</h3>
          <Form onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Check-In</Form.Label>
                  <Form.Control
                    type="date"
                    name="checkIn"
                    value={formData.checkIn}
                    onChange={handleInputChange}
                    min={today}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Check-Out</Form.Label>
                  <Form.Control
                    type="date"
                    name="checkOut"
                    value={formData.checkOut}
                    onChange={handleInputChange}
                    min={formData.checkIn || today}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Guest Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="guestName"
                    value={formData.guestName}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Guest Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="guestEmail"
                    value={formData.guestEmail}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Room Selected</Form.Label>
              <Form.Control
                plaintext
                readOnly
                value={`${selectedRoom.roomNumber || selectedRoom.roomno} — ${
                  selectedRoom.type
                } ($${selectedRoom.price}/night)`}
              />
            </Form.Group>

            <h5>Additional Services</h5>
            <Form.Check
              type="checkbox"
              label="Breakfast"
              name="breakfast"
              checked={formData.additionalServices.breakfast}
              onChange={handleInputChange}
            />
            <Form.Check
              type="checkbox"
              label="Airport Transport"
              name="airportTransport"
              checked={formData.additionalServices.airportTransport}
              onChange={handleInputChange}
            />
            <Form.Group className="mb-3">
              <Form.Label>Special Accommodations</Form.Label>
              <Form.Control
                type="text"
                name="specialAccommodations"
                value={formData.additionalServices.specialAccommodations}
                onChange={handleInputChange}
              />
            </Form.Group>

            <h5>Loyalty Program</h5>
            <Form.Check
              type="checkbox"
              label="I am a loyalty customer"
              checked={isLoyaltyCustomer}
              onChange={handleLoyaltyCheckbox}
            />
            {isLoyaltyCustomer && (
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Use Points</Form.Label>
                    <Form.Control
                      type="number"
                      name="loyaltyPoints"
                      value={formData.loyaltyPoints}
                      onChange={handleInputChange}
                      min="0"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Coupon Code</Form.Label>
                    <Form.Control
                      type="text"
                      name="loyaltyCoupon"
                      value={formData.loyaltyCoupon}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
            )}

            <div className="d-flex justify-content-between mt-4">
              <Button variant="secondary" onClick={() => setSelectedRoom(null)}>
                Back to Rooms
              </Button>
              <Button variant="primary" type="submit">
                Complete Booking
              </Button>
            </div>
          </Form>
        </Card>
      )}
    </Container>
  );
};

export default BookingForm;
