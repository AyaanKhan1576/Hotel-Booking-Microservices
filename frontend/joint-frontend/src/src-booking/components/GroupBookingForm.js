import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
  Badge
} from 'react-bootstrap';
import deluxe_room from './imgs/deluxe.jpeg';
import std_room from './imgs/standard.jpeg';
import suite_room from './imgs/suite.jpeg';  // adjust if needed

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

const GroupBookingForm = () => {
  // Agent + discount
  const [agentEmail, setAgentEmail] = useState('');
  const [discountRate, setDiscountRate] = useState(0);

  // Hotels + loading
  const [hotels, setHotels] = useState([]);
  const [loadingHotels, setLoadingHotels] = useState(true);

  // Selected hotel & dates
  const [selectedHotelId, setSelectedHotelId] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');

  // Selected rooms & per-room guest info
  const [selectedRooms, setSelectedRooms] = useState([]);      // array of room objects
  const [guestDetails, setGuestDetails] = useState({});        // { [roomId]: { guestName, guestEmail } }

  // Submit loading + message
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });

  // Fetch hotels once
  useEffect(() => {
    axios.get('http://localhost:5000/api/hotels')
      .then(res => setHotels(res.data))
      .catch(() => setMessage({ type: 'danger', content: 'Error loading hotels' }))
      .finally(() => setLoadingHotels(false));
  }, []);

  // Helper to toggle room selection
  const toggleRoom = (room) => {
    setSelectedRooms(prev => {
      const exists = prev.find(r => r._id === room._id);
      if (exists) {
        // remove
        const filtered = prev.filter(r => r._id !== room._id);
        setGuestDetails(d => {
          const copy = { ...d };
          delete copy[room._id];
          return copy;
        });
        return filtered;
      } else {
        // add & init guest
        setGuestDetails(d => ({
          ...d,
          [room._id]: { guestName: '', guestEmail: '' }
        }));
        return [...prev, room];
      }
    });
  };

  // Handle guest info changes
  const handleGuestChange = (roomId, field, value) => {
    setGuestDetails(d => ({
      ...d,
      [roomId]: { ...d[roomId], [field]: value }
    }));
  };

  // Submit entire group booking
  const handleSubmit = async (e) => {
    e.preventDefault();

    // basic validation
    if (!agentEmail) {
      setMessage({ type: 'danger', content: 'Agent email is required' });
      return;
    }
    if (!selectedHotelId || !checkIn || !checkOut) {
      setMessage({ type: 'danger', content: 'Please select hotel & dates' });
      return;
    }
    if (selectedRooms.length === 0) {
      setMessage({ type: 'danger', content: 'Please select at least one room' });
      return;
    }
    // per-room guest info
    for (let room of selectedRooms) {
      const gd = guestDetails[room._id] || {};
      if (!gd.guestName || !gd.guestEmail) {
        setMessage({ type: 'danger', content: 'Fill guest name & email for every room' });
        return;
      }
    }

    // build payload
    const payload = {
      agentEmail,
      discountRate,
      rooms: selectedRooms.map(room => ({
        roomId: room._id,
        guestName: guestDetails[room._id].guestName,
        guestEmail: guestDetails[room._id].guestEmail,
        checkIn,
        checkOut
      }))
    };

    try {
      setSubmitting(true);
      await axios.post('http://localhost:5002/api/group-bookings', payload);
      setMessage({ type: 'success', content: 'Group booking created!' });

      // reset form
      setAgentEmail('');
      setDiscountRate(0);
      setSelectedHotelId('');
      setCheckIn('');
      setCheckOut('');
      setSelectedRooms([]);
      setGuestDetails({});
    } catch (err) {
      setMessage({
        type: 'danger',
        content: err.response?.data?.error || 'Error creating group booking'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // While hotels load
  if (loadingHotels) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
        <Spinner animation="border" />
      </Container>
    );
  }

  // find selected hotel object
  const selectedHotel = hotels.find(h => h._id === selectedHotelId);

  return (
    <Container className="py-4">
      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-primary text-white">
          <h2 className="mb-0">Group Booking</h2>
        </Card.Header>
        <Card.Body>
          {message.content && (
            <Alert variant={message.type} className="mb-4">
              {message.content}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>

            {/* Agent + Discount */}
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Agent Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={agentEmail}
                    onChange={e => setAgentEmail(e.target.value)}
                    placeholder="agent@agency.com"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Discount Rate (%)</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    max="100"
                    value={discountRate}
                    onChange={e => setDiscountRate(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Hotel & Dates */}
            <Row className="mb-4">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Select Hotel</Form.Label>
                  <Form.Select
                    value={selectedHotelId}
                    onChange={e => setSelectedHotelId(e.target.value)}
                    required
                  >
                    <option value="">-- Choose Hotel --</option>
                    {hotels.map(h => (
                      <option key={h._id} value={h._id}>
                        {h.name} — {h.location}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Check-In Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={checkIn}
                    onChange={e => setCheckIn(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Check-Out Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={checkOut}
                    onChange={e => setCheckOut(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Available Rooms */}
            {selectedHotel && checkIn && checkOut && (
              <Card className="mb-4">
                <Card.Header className="bg-light">
                  <h5 className="mb-0">Available Rooms</h5>
                </Card.Header>
                <Card.Body>
                  <Row xs={1} sm={2} md={3} className="g-4">
                    {selectedHotel.rooms.map(room => {
                      const cfg = ROOM_TYPES[room.type] || ROOM_TYPES.Standard;
                      const isSelected = !!selectedRooms.find(r => r._id === room._id);
                      return (
                        <Col key={room._id}>
                          <Card className={`h-100 shadow-sm ${isSelected ? 'border-primary' : ''}`}>
                            <Card.Img
                              variant="top"
                              src={cfg.image}
                              style={{ height: 150, objectFit: 'cover' }}
                            />
                            <Card.Body className="d-flex flex-column">
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <div>
                                  <h6 className="mb-1">Room #{room.roomNumber || room.roomno}</h6>
                                  <Badge bg={cfg.badgeVariant}>{room.type}</Badge>
                                </div>
                                <div>${room.price}/night</div>
                              </div>
                              <Button
                                variant={isSelected ? 'outline-danger' : 'primary'}
                                onClick={() => toggleRoom(room)}
                                className="mt-auto"
                              >
                                {isSelected ? 'Deselect' : 'Select'}
                              </Button>
                            </Card.Body>
                          </Card>
                        </Col>
                      );
                    })}
                  </Row>
                </Card.Body>
              </Card>
            )}

            {/* Guest Details for Selected Rooms */}
            {selectedRooms.length > 0 && (
              <Card className="mb-4">
                <Card.Header className="bg-primary text-white">
                  <h5 className="mb-0">Guest Details</h5>
                </Card.Header>
                <Card.Body>
                  {selectedRooms.map(room => {
                    const cfg = ROOM_TYPES[room.type] || ROOM_TYPES.Standard;
                    const gd = guestDetails[room._id] || {};
                    return (
                      <Card key={room._id} className="mb-3 shadow-sm">
                        <Card.Header className="bg-light">
                          <h6 className="mb-0">
                            Room #{room.roomNumber || room.roomno} — {room.type}
                          </h6>
                        </Card.Header>
                        <Card.Body>
                          <Row>
                            <Col md={3}>
                              <img
                                src={cfg.image}
                                alt={room.type}
                                className="img-fluid rounded"
                                style={{ height: 80, objectFit: 'cover' }}
                              />
                            </Col>
                            <Col md={9}>
                              <Form.Group className="mb-2">
                                <Form.Label>Guest Full Name</Form.Label>
                                <Form.Control
                                  type="text"
                                  value={gd.guestName || ''}
                                  onChange={e => handleGuestChange(room._id, 'guestName', e.target.value)}
                                  required
                                />
                              </Form.Group>
                              <Form.Group>
                                <Form.Label>Guest Email</Form.Label>
                                <Form.Control
                                  type="email"
                                  value={gd.guestEmail || ''}
                                  onChange={e => handleGuestChange(room._id, 'guestEmail', e.target.value)}
                                  required
                                />
                              </Form.Group>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    );
                  })}
                </Card.Body>
              </Card>
            )}

            {/* Submit */}
            <div className="text-end">
              <Button type="submit" variant="success" disabled={submitting}>
                {submitting ? (
                  <>
                    <Spinner as="span" size="sm" animation="border" className="me-2" />
                    Submitting…
                  </>
                ) : (
                  'Create Group Booking'
                )}
              </Button>
            </div>

          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default GroupBookingForm;
