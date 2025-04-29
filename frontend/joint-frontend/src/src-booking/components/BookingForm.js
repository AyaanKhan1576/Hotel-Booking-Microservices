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
  Badge,
  Spinner
} from 'react-bootstrap';
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
  const [isLoyaltyCustomer, setLoyalty] = useState(false);
  const [loading, setLoading] = useState(true);
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
      } finally {
        setLoading(false);
      }
    };
    fetchHotels();
  }, []);

  const handleInputChange = e => {
    const { name, value, type, checked } = e.target;
    if (['breakfast', 'airportTransport', 'specialAccommodations'].includes(name)) {
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

  const handleLoyaltyCheckbox = e => {
    const on = e.target.checked;
    setLoyalty(on);
    if (!on) {
      setFormData(f => ({ ...f, loyaltyPoints: 0, loyaltyCoupon: '' }));
    }
  };

  const handleAddFavorite = async room => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      if (!token || !userId) {
        throw new Error('You must be logged in to favorite rooms.');
      }

      await UserAPI.post(
        `/${userId}/favorites`,
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

  const handleSubmit = async e => {
    e.preventDefault();
    if (!selectedRoom) {
      return setMessage({ type: 'danger', content: 'Please select a room' });
    }

    const { checkIn, checkOut, guestName, guestEmail } = formData;
    if (!checkIn || !checkOut || !guestName || !guestEmail) {
      return setMessage({ type: 'danger', content: 'Please fill all fields' });
    }

    const inDate = new Date(checkIn);
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
      setLoading(true);
      const res = await BookingAPI.post('/bookings', payload);
      navigate(`/booking/${res.data.booking._id}`);
    } catch (err) {
      setMessage({
        type: 'danger',
        content: err.response?.data?.msg || 'Booking failed'
      });
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <Button variant="outline-primary" onClick={() => navigate('/bookings')} className="mb-4">
        <i className="bi bi-arrow-left me-2"></i>View My Bookings
      </Button>
      
      {message.content && (
        <Alert variant={message.type} className="rounded-lg">
          {message.content}
        </Alert>
      )}

      {!selectedRoom ? (
        <>
          <h2 className="mb-4 text-primary">Available Hotels</h2>
          <Row>
            {hotels.map(hotel => (
              <Col key={hotel._id} md={6} className="mb-4">
                <Card className="h-100 shadow-sm">
                  <Card.Header className="bg-primary text-white">
                    <Card.Title className="mb-0">{hotel.name}</Card.Title>
                    <Card.Subtitle className="text-white-50">{hotel.location}</Card.Subtitle>
                  </Card.Header>
                  <Card.Body>
                    <Card.Text className="text-muted">{hotel.description}</Card.Text>
                    <h5 className="text-primary">Available Rooms</h5>
                    {hotel.rooms?.length > 0 ? (
                      <ListGroup variant="flush">
                        {hotel.rooms.map(room => {
                          const cfg = ROOM_TYPES[room.type] || ROOM_TYPES.Standard;
                          return (
                            <ListGroup.Item key={room._id} className="py-3">
                              <Row className="align-items-center">
                                <Col xs={4} md={3}>
                                  <img
                                    src={cfg.image}
                                    alt={room.type}
                                    className="img-fluid rounded"
                                    style={{
                                      height: '80px',
                                      objectFit: 'cover'
                                    }}
                                  />
                                </Col>
                                <Col xs={8} md={6}>
                                  <div className="d-flex align-items-center mb-1">
                                    <h6 className="mb-0 me-2">Room #{room.roomNumber || room.roomno}</h6>
                                    <Badge bg={cfg.badgeVariant} pill>
                                      {room.type}
                                    </Badge>
                                  </div>
                                  <p className="small text-muted mb-1">{cfg.description}</p>
                                  <p className="text-success fw-bold mb-0">${room.price}/night</p>
                                </Col>
                                <Col xs={12} md={3} className="mt-2 mt-md-0">
                                  <div className="d-flex flex-column gap-2">
                                    <Button
                                      variant="primary"
                                      size="sm"
                                      onClick={() => setSelectedRoom(room)}
                                      className="w-100"
                                    >
                                      Select
                                    </Button>
                                    <Button
                                      variant="outline-success"
                                      size="sm"
                                      onClick={() => handleAddFavorite(room)}
                                      className="w-100"
                                    >
                                      <i className="bi bi-heart me-1"></i>Favorite
                                    </Button>
                                  </div>
                                </Col>
                              </Row>
                            </ListGroup.Item>
                          );
                        })}
                      </ListGroup>
                    ) : (
                      <Alert variant="info" className="mb-0">No rooms available</Alert>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </>
      ) : (
        <Card className="shadow">
          <Card.Header className="bg-primary text-white">
            <h3 className="mb-0">Complete Your Booking</h3>
          </Card.Header>
          <Card.Body>
            <Form onSubmit={handleSubmit}>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group className="mb-3">
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
                  <Form.Group className="mb-3">
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
                  <Form.Group className="mb-3">
                    <Form.Label>Full Name</Form.Label>
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
                  <Form.Group className="mb-3">
                    <Form.Label>Email Address</Form.Label>
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

              <Card className="mb-4 bg-light">
                <Card.Body>
                  <h5 className="text-primary mb-3">Selected Room</h5>
                  <div className="d-flex align-items-center">
                    <img
                      src={ROOM_TYPES[selectedRoom.type]?.image || std_room}
                      alt={selectedRoom.type}
                      className="rounded me-3"
                      style={{ width: '100px', height: '70px', objectFit: 'cover' }}
                    />
                    <div>
                      <h6 className="mb-1">
                        Room #{selectedRoom.roomNumber || selectedRoom.roomno} - {selectedRoom.type}
                        <Badge bg={ROOM_TYPES[selectedRoom.type]?.badgeVariant || 'primary'} className="ms-2">
                          ${selectedRoom.price}/night
                        </Badge>
                      </h6>
                      <p className="small text-muted mb-0">
                        {ROOM_TYPES[selectedRoom.type]?.description || 'Comfortable accommodation'}
                      </p>
                    </div>
                  </div>
                </Card.Body>
              </Card>

              <Card className="mb-4">
                <Card.Body>
                  <h5 className="text-primary mb-3">Additional Services</h5>
                  <Form.Check
                    type="checkbox"
                    id="breakfast"
                    label="Breakfast ($15 per day)"
                    name="breakfast"
                    checked={formData.additionalServices.breakfast}
                    onChange={handleInputChange}
                    className="mb-2"
                  />
                  <Form.Check
                    type="checkbox"
                    id="airportTransport"
                    label="Airport Transport ($30 one way)"
                    name="airportTransport"
                    checked={formData.additionalServices.airportTransport}
                    onChange={handleInputChange}
                    className="mb-2"
                  />
                  <Form.Group className="mt-3">
                    <Form.Label>Special Accommodations</Form.Label>
                    <Form.Control
                      as="textarea"
                      name="specialAccommodations"
                      value={formData.additionalServices.specialAccommodations}
                      onChange={handleInputChange}
                      rows={2}
                      placeholder="Any special requests or needs"
                    />
                  </Form.Group>
                </Card.Body>
              </Card>

              <Card className="mb-4">
                <Card.Body>
                  <h5 className="text-primary mb-3">Loyalty Program</h5>
                  <Form.Check
                    type="checkbox"
                    id="loyaltyCustomer"
                    label="I am a loyalty program member"
                    checked={isLoyaltyCustomer}
                    onChange={handleLoyaltyCheckbox}
                    className="mb-3"
                  />
                  {isLoyaltyCustomer && (
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Loyalty Points to Use</Form.Label>
                          <Form.Control
                            type="number"
                            name="loyaltyPoints"
                            value={formData.loyaltyPoints}
                            onChange={handleInputChange}
                            min="0"
                            placeholder="Enter points to redeem"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
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
                </Card.Body>
              </Card>

              <div className="d-flex justify-content-between mt-4">
                <Button variant="outline-secondary" onClick={() => setSelectedRoom(null)}>
                  <i className="bi bi-arrow-left me-1"></i>Back to Rooms
                </Button>
                <Button variant="primary" type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Spinner as="span" size="sm" animation="border" role="status" aria-hidden="true" className="me-2" />
                      Processing...
                    </>
                  ) : (
                    'Complete Booking'
                  )}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default BookingForm;