import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HotelAPI, BookingAPI, UserAPI } from '../api';
import { Container, Row, Col, Card, Form, Button, Alert, ListGroup, ListGroupItem, Badge } from 'react-bootstrap';
import deluxe_room from './imgs/deluxe.jpeg';
import std_room from './imgs/standard.jpeg';
import suite_room from './imgs/deluxe.jpeg';

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
  const [hotels, setHotels] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isLoyaltyCustomer, setIsLoyaltyCustomer] = useState(false);
  const [formData, setFormData] = useState({
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
  const [message, setMessage] = useState({ type: '', content: '' });

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const res = await HotelAPI.get('/hotels');
        setHotels(res.data);
      } catch (error) {
        setMessage({ type: 'danger', content: 'Error loading hotels' });
      }
    };
    fetchHotels();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (['breakfast', 'airportTransport', 'specialAccommodations'].includes(name)) {
      setFormData((prev) => ({
        ...prev,
        additionalServices: {
          ...prev.additionalServices,
          [name]: type === 'checkbox' ? checked : value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'number' ? Number(value) : value,
      }));
    }
  };

  const handleLoyaltyCheckbox = (e) => {
    setIsLoyaltyCustomer(e.target.checked);
    if (!e.target.checked) {
      setFormData((prev) => ({
        ...prev,
        loyaltyPoints: 0,
        loyaltyCoupon: '',
      }));
    }
  };

  const handleAddFavorite = async (room) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('You must be logged in to favorite rooms.');
      }
      
      await UserAPI.post(
        '/users/favorites',  // Correct endpoint path
        { 
          roomId: room._id,  // Use MongoDB _id instead of room number
          type: 'room'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMessage({ type: 'success', content: 'Room added to favorites!' });
    } catch (error) {
      setMessage({ type: 'danger', content: error.response?.data?.message || error.message });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRoom) {
      setMessage({ type: 'danger', content: 'Please select a room' });
      return;
    }

    const checkInDate = new Date(formData.checkIn);
    const checkOutDate = new Date(formData.checkOut);

    if (!formData.checkIn || !formData.checkOut) {
      setMessage({ type: 'danger', content: 'Please select check-in and check-out dates' });
      return;
    }

    if (checkOutDate <= checkInDate) {
      setMessage({ type: 'danger', content: 'Check-out date must be after check-in date' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.guestEmail)) {
      setMessage({ type: 'danger', content: 'Please enter a valid email address' });
      return;
    }

    const bookingData = {
      roomId: selectedRoom._id,
      guestName: formData.guestName,
      guestEmail: formData.guestEmail,
      checkIn: checkInDate.toISOString(),
      checkOut: checkOutDate.toISOString(),
      additionalServices: formData.additionalServices,
      loyaltyPoints: isLoyaltyCustomer ? formData.loyaltyPoints : 0,
      loyaltyCoupon: isLoyaltyCustomer ? formData.loyaltyCoupon : '',
    };

    console.log('Booking Data:', bookingData);

    try {
      const res = await BookingAPI.post('/bookings', bookingData);
      navigate(`/booking/${res.data.booking._id}`);
    } catch (error) {
      setMessage({ type: 'danger', content: error.response?.data?.msg || 'Booking failed' });
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <Container className="my-5">
      {message.content && <Alert variant={message.type}>{message.content}</Alert>}

      {!selectedRoom ? (
        <div>
          <h2 className="mb-4">Available Hotels</h2>
          <Row>
            {hotels.map((hotel) => (
              <Col key={hotel._id} md={6} className="mb-4">
                <Card className="h-100 shadow">
                  <Card.Body>
                    <Card.Title>{hotel.name}</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">{hotel.location}</Card.Subtitle>
                    <Card.Text>{hotel.description}</Card.Text>

                    <h5>Available Rooms</h5>
                    {hotel.rooms && hotel.rooms.length > 0 ? (
                      <ListGroup variant="flush">
                        {hotel.rooms.map((room) => {
                          const roomTypeConfig = ROOM_TYPES[room.type] || {
                            image: std_room,
                            description: 'Standard room',
                            badgeVariant: 'secondary',
                          };

                          return (
                            <ListGroupItem
                              key={room._id}
                              className="d-flex justify-content-between align-items-center"
                            >
                              <div className="d-flex align-items-center">
                                <div className="position-relative me-3">
                                  <img
                                    src={roomTypeConfig.image}
                                    alt={room.type}
                                    style={{
                                      width: '100px',
                                      height: '70px',
                                      objectFit: 'cover',
                                      borderRadius: '5px',
                                    }}
                                  />
                                  <Badge
                                    pill
                                    bg={roomTypeConfig.badgeVariant}
                                    className="position-absolute top-0 start-100 translate-middle"
                                  >
                                    {room.type}
                                  </Badge>
                                </div>
                                <div>
                                  <strong>Room #{room.roomNumber || room.roomno}</strong>
                                  <div className="text-muted small">{roomTypeConfig.description}</div>
                                  <div className="text-success">
                                    ${room.price} <small>per night</small>
                                  </div>
                                </div>
                              </div>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => setSelectedRoom(room)}
                              >
                                Select
                              </Button>
                              <Button
                variant="outline-success"
                size="sm"
                onClick={() => handleAddFavorite(room)}
                style={{ marginLeft: '8px' }}
              >
                Favorite
              </Button>
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
        </div>
      ) : (
        <Card className="p-4 shadow">
          <h3>Complete Your Booking</h3>
          <Form onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Check-In Date</Form.Label>
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
                  <Form.Label>Check-Out Date</Form.Label>
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
            <Row className="mb-3">
              <Col>
                <Form.Group>
                  <Form.Label>Room Selected</Form.Label>
                  <Form.Control
                    plaintext
                    readOnly
                    value={`${selectedRoom.roomNumber || selectedRoom.roomno} - ${selectedRoom.type} ($${selectedRoom.price}/night)`}
                  />
                </Form.Group>
              </Col>
            </Row>

            <h5>Additional Services</h5>
            <Row className="mb-3">
              <Col>
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
              </Col>
              <Col>
                <Form.Group>
                  <Form.Label>Special Accommodations</Form.Label>
                  <Form.Control
                    type="text"
                    name="specialAccommodations"
                    value={formData.additionalServices.specialAccommodations}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <h5>Loyalty Program</h5>
            <Row className="mb-3">
              <Col>
                <Form.Check
                  type="checkbox"
                  label="I am a loyalty customer"
                  checked={isLoyaltyCustomer}
                  onChange={handleLoyaltyCheckbox}
                />
              </Col>
            </Row>
            {isLoyaltyCustomer && (
              <Row className="mb-4">
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
                      placeholder="Enter coupon code"
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