import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Button, Alert } from 'react-bootstrap';
import { get_hotel, create_new_hotel, update_hotel_info } from '../services/api';

const HotelForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState({
    name: '',
    location: '',
    contactInfo: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      const find_avail_hotel = async () => {
        try {
          const { data } = await get_hotel(id);
          setHotel(data);
        } catch (err) {
          setError(err.message);
        }
      };
      find_avail_hotel();
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        await update_hotel_info(id, hotel);
      } else {
        await create_new_hotel(hotel);
      }
      navigate('/hotels');
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  return (
    <div className="container mt-4">
      <h2>{id ? 'Edit Hotel' : 'Add New Hotel'}</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Hotel Name</Form.Label>
          <Form.Control
            type="text"
            value={hotel.name}
            onChange={(e) => setHotel({ ...hotel, name: e.target.value })}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Location</Form.Label>
          <Form.Control
            type="text"
            value={hotel.location}
            onChange={(e) => setHotel({ ...hotel, location: e.target.value })}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Contact Information</Form.Label>
          <Form.Control
            type="text"
            value={hotel.contactInfo}
            onChange={(e) => setHotel({ ...hotel, contactInfo: e.target.value })}
            required
          />
        </Form.Group>

        <Button variant="primary" type="submit">
          {id ? 'Update Hotel' : 'Create Hotel'}
        </Button>
      </Form>
    </div>
  );
};

export default HotelForm;