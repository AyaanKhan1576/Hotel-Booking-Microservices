import React, { useState } from 'react';
import axios from 'axios';

const GroupBookingForm = () => {
  const [agentEmail, setAgentEmail] = useState('');
  const [discountRate, setDiscountRate] = useState(0);
  const [roomsData, setRoomsData] = useState([
    {
      roomId: '',
      guestName: '',
      guestEmail: '',
      checkIn: '',
      checkOut: ''
    }
  ]);
  const [message, setMessage] = useState('');

  const handleRoomChange = (index, field, value) => {
    const updatedRooms = [...roomsData];
    updatedRooms[index][field] = value;
    setRoomsData(updatedRooms);
  };

  const addRoom = () => {
    setRoomsData([
      ...roomsData,
      {
        roomId: '',
        guestName: '',
        guestEmail: '',
        checkIn: '',
        checkOut: ''
      }
    ]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        agentEmail,
        discountRate,
        rooms: roomsData
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
    <div style={{ padding: '2rem' }}>
      <h2>Basic Group Booking Form</h2>
      {message && <p><strong>{message}</strong></p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Agent Email:</label><br />
          <input
            type="email"
            value={agentEmail}
            onChange={(e) => setAgentEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Discount Rate (%):</label><br />
          <input
            type="number"
            value={discountRate}
            onChange={(e) => setDiscountRate(e.target.value)}
          />
        </div>

        <hr />
        <h3>Room Bookings</h3>
        {roomsData.map((room, index) => (
          <div key={index} style={{ marginBottom: '1rem' }}>
            <h4>Room #{index + 1}</h4>
            <label>Room ID:</label><br />
            <input
              type="text"
              value={room.roomId}
              onChange={(e) => handleRoomChange(index, 'roomId', e.target.value)}
              required
            /><br />

            <label>Guest Name:</label><br />
            <input
              type="text"
              value={room.guestName}
              onChange={(e) => handleRoomChange(index, 'guestName', e.target.value)}
              required
            /><br />

            <label>Guest Email:</label><br />
            <input
              type="email"
              value={room.guestEmail}
              onChange={(e) => handleRoomChange(index, 'guestEmail', e.target.value)}
              required
            /><br />

            <label>Check-In:</label><br />
            <input
              type="date"
              value={room.checkIn}
              onChange={(e) => handleRoomChange(index, 'checkIn', e.target.value)}
              required
            /><br />

            <label>Check-Out:</label><br />
            <input
              type="date"
              value={room.checkOut}
              onChange={(e) => handleRoomChange(index, 'checkOut', e.target.value)}
              required
            />
          </div>
        ))}

        <button type="button" onClick={addRoom}>
          Add Another Room
        </button>

        <br /><br />
        <button type="submit">Submit Group Booking</button>
      </form>
    </div>
  );
};

export default GroupBookingForm;
