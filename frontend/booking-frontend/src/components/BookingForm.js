import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const BookingForm = () => {
  const navigate = useNavigate();
  
  // State for hotels and rooms
  const [hotels, setHotels] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState('');
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState('');
  
  // Booking form state
  const [formData, setFormData] = useState({
    guestName: '',
    guestEmail: '',
    checkIn: '',
    checkOut: '',
    additionalServices: {
      breakfast: false,
      airportTransport: false,
      specialAccommodations: ''
    }
  });
  
  const [message, setMessage] = useState('');

  // Fetch hotels on mount
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/hotels');
        console.log('Fetched hotels:', res.data); 
        setHotels(res.data);
      } catch (error) {
        console.error('Error fetching hotels:', error);
      }
    };
    fetchHotels();
  }, []);

  // Fetch rooms when a hotel is selected
  useEffect(() => {
    const fetchRooms = async () => {
      if (!selectedHotel) return;
      try {
        // Assuming the hotel-service supports filtering by hotel id with query param "hotel"
        const res = await axios.get('http://localhost:5000/api/rooms', { 
          params: { hotel: selectedHotel }
        });
        setRooms(res.data);
      } catch (error) {
        console.error('Error fetching rooms:', error);
      }
    };
    fetchRooms();
  }, [selectedHotel]);

  const handleHotelChange = (e) => {
    setSelectedHotel(e.target.value);
    setSelectedRoom(''); // Reset room selection when hotel changes
  };

  const handleRoomChange = (e) => {
    setSelectedRoom(e.target.value);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    // Check if the field belongs to additionalServices
    if (name in formData.additionalServices) {
      setFormData((prev) => ({
        ...prev,
        additionalServices: {
          ...prev.additionalServices,
          [name]: type === 'checkbox' ? checked : value,
        }
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRoom) {
      setMessage('Please select a room.');
      return;
    }
    try {
      const bookingData = {
        roomId: selectedRoom,
        guestName: formData.guestName,
        guestEmail: formData.guestEmail,
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        additionalServices: formData.additionalServices
      };
      // Call the booking-service to create the booking
      const res = await axios.post('http://localhost:5002/api/bookings', bookingData);
      setMessage('Booking created successfully!');
      // Redirect to booking details page if needed:
      navigate(`/booking/${res.data.booking._id}`);
    } catch (error) {
      console.error('Error creating booking:', error);
      setMessage(error.response?.data?.msg || 'Error creating booking');
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Create a New Booking</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        {/* Hotel selection */}
        <div>
            <label>Select Hotel:</label>
            <select value={selectedHotel} onChange={handleHotelChange} required>
                <option value="">--Select Hotel--</option>
                {hotels.map((hotel) => (
                <option key={hotel._id} value={hotel._id}>
                    {hotel.name} - {hotel.location}
                </option>
                ))}
            </select>
        </div>
        {/* Room selection */}
        {selectedHotel && (
          <div>
            <label>Select Room:</label>
            <select value={selectedRoom} onChange={handleRoomChange} required>
              <option value="">--Select Room--</option>
              {rooms.map((room) => (
                <option key={room._id} value={room._id}>
                  {room.roomno} - {room.type} - ${room.price}
                </option>
              ))}
            </select>
          </div>
        )}
        {/* Guest details */}
        <div>
          <label>Guest Name:</label>
          <input 
            type="text" 
            name="guestName" 
            value={formData.guestName} 
            onChange={handleInputChange} 
            required 
          />
        </div>
        <div>
          <label>Guest Email:</label>
          <input 
            type="email" 
            name="guestEmail" 
            value={formData.guestEmail} 
            onChange={handleInputChange} 
            required 
          />
        </div>
        {/* Dates */}
        <div>
          <label>Check In:</label>
          <input 
            type="date" 
            name="checkIn" 
            value={formData.checkIn} 
            onChange={handleInputChange} 
            required 
          />
        </div>
        <div>
          <label>Check Out:</label>
          <input 
            type="date" 
            name="checkOut" 
            value={formData.checkOut} 
            onChange={handleInputChange} 
            required 
          />
        </div>
        {/* Additional Services */}
        <div>
          <label>Breakfast:</label>
          <input 
            type="checkbox" 
            name="breakfast" 
            checked={formData.additionalServices.breakfast} 
            onChange={handleInputChange} 
          />
        </div>
        <div>
          <label>Airport Transport:</label>
          <input 
            type="checkbox" 
            name="airportTransport" 
            checked={formData.additionalServices.airportTransport} 
            onChange={handleInputChange} 
          />
        </div>
        <div>
          <label>Special Accommodations:</label>
          <input 
            type="text" 
            name="specialAccommodations" 
            value={formData.additionalServices.specialAccommodations} 
            onChange={handleInputChange} 
          />
        </div>
        <button type="submit">Confirm Booking</button>
      </form>
    </div>
  );
};
export default BookingForm;
