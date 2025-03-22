import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Table, Button, Alert } from 'react-bootstrap';
import { get_avail_rooms, del_room } from '../services/api';

const RoomList = () => {
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const { data } = await get_avail_rooms();
        setRooms(data);
      } catch (err) {
        setError(err.message);
      }
    };
    loadRooms();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      try {
        await del_room(id);
        setRooms(rooms.filter(room => room._id !== id));
      } catch (err) {
        setError(err.message);
      }
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between mb-3">
        <h2>Rooms</h2>
        <Button as={Link} to="/rooms/new" variant="primary">Add Room</Button>
      </div>
      
      {error && <Alert variant="danger">{error}</Alert>}

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Room No</th>
            <th>Type</th>
            <th>Capacity</th>
            <th>Price</th>
            <th>Amenities</th>
            <th>Hotel</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map(room => (
            <tr key={room._id}>
              <td>{room.roomno}</td>
              <td>{room.type}</td>
              <td>{room.capacity}</td>
              <td>{room.price}</td>
              <td>{room.amenities.join(', ')}</td>
              <td>{room.hotel?.name}</td>
              <td>
                <Button as={Link} to={`/rooms/${room._id}`} variant="info" size="sm" className="me-2">
                  View/Edit
                </Button>
                <Button variant="danger" size="sm" onClick={() => handleDelete(room._id)}>
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default RoomList;