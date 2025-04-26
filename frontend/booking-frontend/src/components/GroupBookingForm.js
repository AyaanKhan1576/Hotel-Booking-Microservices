import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button, Row, Col, Alert } from 'react-bootstrap';
import RoomList from './RoomList';

const GroupBookingForm = () => {
  const [agentEmail, setAgentEmail] = useState('');
  const [discountRate, setDiscountRate] = useState(0);
  const [hotels, setHotels] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [roomsData, setRoomsData] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/hotels');
        setHotels(res.data);
      } catch (error) {
        console.error('Error fetching hotels:', error);
      }
    };
    fetchHotels();
  }, []);

  const handleToggleRoom = (roomId) => {
    setRoomsData((prev) => {
      if (prev.some((r) => r.roomId === roomId)) {
        return prev.filter((r) => r.roomId !== roomId);
      } else {
        return [...prev, { roomId, guestName: '', guestEmail: '' }];
      }
    });
  };

  const handleGuestChange = (index, field, value) => {
    const updatedRooms = [...roomsData];
    updatedRooms[index][field] = value;
    setRoomsData(updatedRooms);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (roomsData.length === 0) {
      setMessage('Please select at least one room.');
      return;
    }
    if (roomsData.some((room) => !room.guestName || !room.guestEmail)) {
      setMessage('Please fill in all guest details.');
      return;
    }
    try {
      const payload = {
        agentEmail,
        discountRate,
        rooms: roomsData.map((room) => ({
          roomId: room.roomId,
          guestName: room.guestName,
          guestEmail: room.guestEmail,
          checkIn,
          checkOut
        }))
      };
      const res = await axios.post('http://localhost:5002/api/group-bookings', payload);
      setMessage('Group booking created successfully!');
      console.log(res.data);
    } catch (error) {
      console.error(error);
      setMessage('Error creating group booking');
    }
  };

  return (
    <div className="container mt-4">
      <h2>Group Booking</h2>
      {message && <Alert variant={message.includes('success') ? 'success' : 'danger'}>{message}</Alert>}
      <Form>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Agent Email</Form.Label>
              <Form.Control
                type="email"
                value={agentEmail}
                onChange={(e) => setAgentEmail(e.target.value)}
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Discount Rate (%)</Form.Label>
              <Form.Control
                type="number"
                value={discountRate}
                onChange={(e) => setDiscountRate(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={4}>
            <Form.Group>
              <Form.Label>Select Hotel</Form.Label>
              <Form.Control
                as="select"
                value={selectedHotel}
                onChange={(e) => setSelectedHotel(e.target.value)}
                required
              >
                <option value="">--Select Hotel--</option>
                {hotels.map((hotel) => (
                  <option key={hotel._id} value={hotel._id}>
                    {hotel.name} - {hotel.location}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Check In</Form.Label>
              <Form.Control type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} required />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Check Out</Form.Label>
              <Form.Control type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} required />
            </Form.Group>
          </Col>
        </Row>
      </Form>
      {selectedHotel && checkIn && checkOut && (
        <RoomList
          hotelId={selectedHotel}
          checkIn={checkIn}
          checkOut={checkOut}
          selectionMode="multiple"
          selectedRooms={roomsData.map((r) => r.roomId)}
          onToggleRoom={handleToggleRoom}
        />
      )}
      {roomsData.length > 0 && (
        <div className="mt-4">
          <h3>Guest Details for Selected Rooms</h3>
          {roomsData.map((room, index) => (
            <div key={room.roomId} className="mb-4 p-3 border rounded">
              <h5>Room {room.roomId}</h5>
              <Form.Group className="mb-3">
                <Form.Label>Guest Name</Form.Label>
                <Form.Control
                  type="text"
                  value={room.guestName}
                  onChange={(e) => handleGuestChange(index, 'guestName', e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Guest Email</Form.Label>
                <Form.Control
                  type="email"
                  value={room.guestEmail}
                  onChange={(e) => handleGuestChange(index, 'guestEmail', e.target.value)}
                  required
                />
              </Form.Group>
            </div>
          ))}
          <Button variant="success" onClick={handleSubmit}>
            Submit Group Booking
          </Button>
        </div>
      )}
    </div>
  );
};

export default GroupBookingForm;