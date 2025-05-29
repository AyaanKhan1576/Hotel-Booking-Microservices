import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Row, Col } from 'react-bootstrap';
import { HotelAPI } from '../api';

const RoomList = ({ hotelId, checkIn, checkOut, selectionMode = 'single', onSelect, favoriteRoomIds = [] }) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ minPrice: '', maxPrice: '', roomType: '' });

  useEffect(() => {
    const fetchRooms = async () => {
      if (!hotelId || !checkIn || !checkOut) return;
      setLoading(true);
      try {
        const res = await HotelAPI.get('/rooms', {
          params: { hotel: hotelId, checkIn, checkOut, ...filters },
        });
        let fetchedRooms = res.data.map((room) => ({
          ...room,
          roomno: room.roomNumber || room.roomno,
          image: room.image || 'https://via.placeholder.com/150',
        }));
        const sortedRooms = [...fetchedRooms].sort((a, b) => {
          const aIsFavorite = favoriteRoomIds.includes(a._id);
          const bIsFavorite = favoriteRoomIds.includes(b._id);
          return bIsFavorite - aIsFavorite; // Favorites first
        });
        setRooms(sortedRooms);
      } catch (error) {
        console.error('Error fetching rooms:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, [hotelId, checkIn, checkOut, filters, favoriteRoomIds]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) return <p>Loading rooms...</p>;

  return (
    <div>
      <Form className="mb-3">
        <Row>
          <Col>
            <Form.Control
              type="number"
              name="minPrice"
              placeholder="Min Price"
              value={filters.minPrice}
              onChange={handleFilterChange}
            />
          </Col>
          <Col>
            <Form.Control
              type="number"
              name="maxPrice"
              placeholder="Max Price"
              value={filters.maxPrice}
              onChange={handleFilterChange}
            />
          </Col>
          <Col>
            <Form.Control
              as="select"
              name="roomType"
              value={filters.roomType}
              onChange={handleFilterChange}
            >
              <option value="">All Room Types</option>
              <option value="single">Single</option>
              <option value="double">Double</option>
              <option value="suite">Suite</option>
            </Form.Control>
          </Col>
        </Row>
      </Form>
      {rooms.map((room) => (
        <Card key={room._id} className="mb-3">
          <Card.Body>
            <Card.Title>Room {room.roomno}</Card.Title>
            <Card.Text>Type: {room.type} | Price: ${room.price}</Card.Text>
            {selectionMode === 'single' && (
              <Button variant="primary" onClick={() => onSelect(room)}>
                Book Now
              </Button>
            )}
          </Card.Body>
        </Card>
      ))}
    </div>
  );
};

export default RoomList;
