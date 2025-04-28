import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Button, Alert } from 'react-bootstrap';
import { get_room, cretae_new_room, update_room_info, get_avail_hotels } from '../services/api';

const RoomForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState({
    roomno: '',
    type: '',
    capacity: '',
    price: '',
    amenities: [],
    hotel: '' 
  });
  const [hotels, setHotels] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const load_avail_hotels = async () => {
      try {
        const { data } = await get_avail_hotels();
        setHotels(data);
      } catch (err) {
        setError(err.message);
      }
    };
    load_avail_hotels();

    if (id) {
      const loadRoom = async () => {
        try {
          const { data } = await get_room(id);
          setRoom(data);
        } catch (err) {
          setError(err.message);
        }
      };
      loadRoom();
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        await update_room_info(id, room);
      } else {
        await cretae_new_room(room);
      }
      navigate('/rooms');
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  return (
    <div className="container mt-4">
      <h2>{id ? 'Edit Room' : 'Add New Room'}</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Form onSubmit={handleSubmit}>
        
      <Form.Group className="mb-3">
        <Form.Label>Room Number</Form.Label>
        <Form.Control
        type="text"
        value={room.roomno}
        onChange={(e) => setRoom({ ...room, roomno: e.target.value })}
        required
        />
      </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Room Type</Form.Label>
          <Form.Select
            value={room.type}
            onChange={(e) => setRoom({ ...room, type: e.target.value })}
            required
          >
            <option value="">Select a type</option>
            <option value="Standard">Standard</option>
            <option value="Deluxe">Deluxe</option>
            <option value="Suite">Suite</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Capacity</Form.Label>
          <Form.Control
            type="number"
            value={room.capacity}
            onChange={(e) => setRoom({ ...room, capacity: e.target.value })}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Price</Form.Label>
          <Form.Control
            type="number"
            value={room.price}
            onChange={(e) => setRoom({ ...room, price: e.target.value })}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Amenities</Form.Label>
          <Form.Control
            type="text"
            value={room.amenities.join(', ')}
            onChange={(e) => setRoom({ ...room, amenities: e.target.value.split(', ') })}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Hotel</Form.Label>
          <Form.Select
            value={room.hotel}
            onChange={(e) => setRoom({ ...room, hotel: e.target.value })}
            required
          >
            <option value="">Select a hotel</option>
            {hotels.map(hotel => (
              <option key={hotel._id} value={hotel._id}>
                {hotel.name}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <Button variant="primary" type="submit">
          {id ? 'Update Room' : 'Create Room'}
        </Button>
      </Form>
    </div>
  );
};

export default RoomForm;