import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookingAPI } from '../api';

const BookingDetails = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [updateData, setUpdateData] = useState({ additionalServices: {} });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const fetchBooking = useCallback(async () => {
    try {
      const res = await BookingAPI.get(`/bookings/${id}`);
      setBooking(res.data);
      setUpdateData({
        additionalServices: res.data.additionalServices
      });
    } catch (err) {
      setMessage(err.response?.data?.msg || 'Error fetching booking details');
    }
  }, [id]);

  useEffect(() => {
    fetchBooking();
  }, [id, fetchBooking]);

  const handleUpdateChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUpdateData((prev) => ({
      ...prev,
      additionalServices: {
        ...prev.additionalServices,
        [name]: type === 'checkbox' ? checked : value
      }
    }));
  };

  const handleUpdate = async () => {
    try {
      const res = await BookingAPI.put(`/bookings/${id}`, updateData);
      setBooking(res.data);
      setMessage('Booking updated successfully!');
    } catch (err) {
      setMessage(err.response?.data?.msg || 'Error updating booking');
    }
  };

  const handleCancel = async () => {
    try {
      await BookingAPI.delete(`/bookings/${id}`);
      setMessage('Booking cancelled successfully!');
      navigate('/');
    } catch (err) {
      setMessage(err.response?.data?.msg || 'Error cancelling booking');
    }
  };

  if (!booking) return <p>Loading booking details...</p>;

  return (
    <div>
      <h2>Booking Details</h2>
      {message && <p>{message}</p>}
      <p><strong>Guest:</strong> {booking.guestName}</p>
      <p><strong>Email:</strong> {booking.guestEmail}</p>
      <p>
        <strong>Check In:</strong> {new Date(booking.checkIn).toLocaleDateString()} <br />
        <strong>Check Out:</strong> {new Date(booking.checkOut).toLocaleDateString()}
      </p>
      <p><strong>Additional Services:</strong></p>
      <ul>
        <li>Breakfast: {booking.additionalServices.breakfast ? 'Yes' : 'No'}</li>
        <li>Airport Transport: {booking.additionalServices.airportTransport ? 'Yes' : 'No'}</li>
        <li>Special Accommodations: {booking.additionalServices.specialAccommodations}</li>
      </ul>

      <hr />
      <h3>Update Booking</h3>
      <div>
        <label>Breakfast:</label>
        <input
          type="checkbox"
          name="breakfast"
          checked={updateData.additionalServices?.breakfast || false}
          onChange={handleUpdateChange}
        />
      </div>
      <div>
        <label>Airport Transport:</label>
        <input
          type="checkbox"
          name="airportTransport"
          checked={updateData.additionalServices?.airportTransport || false}
          onChange={handleUpdateChange}
        />
      </div>
      <div>
        <label>Special Accommodations:</label>
        <input
          type="text"
          name="specialAccommodations"
          value={updateData.additionalServices?.specialAccommodations || ''}
          onChange={handleUpdateChange}
        />
      </div>
      <button onClick={handleUpdate}>Update Booking</button>
      <button onClick={handleCancel} style={{ marginLeft: '1rem', color: 'red' }}>Cancel Booking</button>
    </div>
  );
};

export default BookingDetails;