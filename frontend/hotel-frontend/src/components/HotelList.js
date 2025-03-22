import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Table, Button, Alert } from 'react-bootstrap';
import { get_avail_hotels, del_hotel } from '../services/api';

const HotelList = () => {
  const [hotels, setHotels] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const find_avail_hotels = async () => {
      try {
        const { data } = await get_avail_hotels(); 
        setHotels(data);
      } catch (err) {
        setError(err.message);
      }
    };
    find_avail_hotels();
  }, []);

  const handle_del_hotel = async (id) => {
    if (window.confirm('Are you sure you want to delete this hotel?')) {
      try {
        await del_hotel(id);
        setHotels(hotels.filter(hotel => hotel._id !== id));
      } catch (err) {
        setError(err.message);
      }
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between mb-3">
        <h2>Hotels</h2> {}
        <Button as={Link} to="/hotels/new" variant="primary">Add Hotel</Button>
      </div>
      
      {error && <Alert variant="danger">{error}</Alert>}

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Location</th>
            <th>Contact</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {hotels.map(hotel => (
            <tr key={hotel._id}>
              <td>{hotel.name}</td>
              <td>{hotel.location}</td>
              <td>{hotel.contactInfo}</td>
              <td>
                <Button as={Link} to={`/hotels/${hotel._id}`} variant="info" size="sm" className="me-2">
                  View/Edit
                </Button>
                <Button variant="danger" size="sm" onClick={() => handle_del_hotel(hotel._id)}>
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

export default HotelList;