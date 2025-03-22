import React, { useState } from 'react';
import API from '../api';
import { Link } from 'react-router-dom';

const BookingList = () => {
  const [guestEmail, setGuestEmail] = useState('');
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const res = await API.get('/bookings/search', {
        params: { guestEmail }
      });
      setBookings(res.data);
      setMessage('');
    } catch (err) {
      setMessage('Error fetching bookings');
    }
  };

  return (
    <div>
      <h2>My Bookings</h2>
      <form onSubmit={handleSearch}>
        <label>Guest Email: </label>
        <input 
          type="email" 
          value={guestEmail} 
          onChange={(e) => setGuestEmail(e.target.value)} 
          required 
        />
        <button type="submit">Search</button>
      </form>
      {message && <p>{message}</p>}
      {bookings.length > 0 ? (
        <ul>
          {bookings.map((booking) => (
            <li key={booking._id}>
              <Link to={`/booking/${booking._id}`}>
                {booking.guestName} - {new Date(booking.checkIn).toLocaleDateString()} to {new Date(booking.checkOut).toLocaleDateString()}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>No bookings found.</p>
      )}
    </div>
  );
};

export default BookingList;
