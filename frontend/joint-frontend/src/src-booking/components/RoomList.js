import React, { useState, useEffect } from 'react';
import { HotelAPI } from '../api';
import { Card, Button, Form, Row, Col } from 'react-bootstrap';

const RoomList = ({ hotelId, checkIn, checkOut, selectionMode, onSelect, selectedRooms, onToggleRoom }) => {
  const [rooms, setRooms] = useState([]);
  const [filters, setFilters] = useState({ minPrice: 0, maxPrice: 1000, roomType: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRooms = async () => {
      if (!hotelId || !checkIn || !checkOut) return;
      setLoading(true);
      try {
        const res = await HotelAPI.get('/rooms', {
          params: { hotel: hotelId, checkIn, checkOut, ...filters }
        });
        setRooms(res.data.map(room => ({
          ...room,
          roomno: room.roomNumber || room.roomno,
          image: room.image || 'https://via.placeholder.com/150'
        })));
      } catch (error) {
        console.error('Error fetching rooms:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, [hotelId, checkIn, checkOut, filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div>
      <h3>Available Rooms</h3>
      {loading && <p>Loading rooms...</p>}
      <Form className="mb-3">
        <Row>
          <Col md={3}>
            <Form.Group>
              <Form.Label>Min Price</Form.Label>
              <Form.Control
                type="number"
                name="minPrice"
                value={filters.minPrice}
                onChange={handleFilterChange}
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>Max Price</Form.Label>
              <Form.Control
                type="number"
                name="maxPrice"
                value={filters.maxPrice}
                onChange={handleFilterChange}
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>Room Type</Form.Label>
              <Form.Control
                as="select"
                name="roomType"
                value={filters.roomType}
                onChange={handleFilterChange}
              >
                <option value="">All</option>
                <option value="Standard">Standard</option>
                <option value="Deluxe">Deluxe</option>
                <option value="Suite">Suite</option>
              </Form.Control>
            </Form.Group>
          </Col>
        </Row>
      </Form>
      <Row>
        {rooms.map((room) => (
          <Col key={room._id} md={4} className="mb-3">
            <Card>
              <Card.Img variant="top" src={room.image} style={{ height: '150px', objectFit: 'cover' }} />
              <Card.Body>
                <Card.Title>{room.roomno} - {room.type}</Card.Title>
                <Card.Text>
                  Price: ${room.price} per night<br />
                  {room.description || 'Comfortable room with essential amenities.'}
                </Card.Text>
                {selectionMode === 'single' ? (
                  <Button variant="primary" onClick={() => onSelect(room)}>
ensics                    Book Now
                  </Button>
                ) : (
                  <Form.Check
                    type="checkbox"
                    label="Select"
                    checked={selectedRooms.includes(room._id)}
                    onChange={() => onToggleRoom(room._id)}
                  />
                )}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default RoomList;