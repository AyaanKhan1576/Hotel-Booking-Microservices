import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import BookingForm from './components/BookingForm';
import BookingList from './components/BookingList';
import BookingDetails from './components/BookingDetails';

const App = () => {
  return (
    <Router>
      <div style={{ padding: '1rem' }}>
        <nav>
          <Link to="/" style={{ marginRight: '1rem' }}>New Booking</Link>
          <Link to="/bookings">My Bookings</Link>
        </nav>
        <hr />
        <Routes>
          <Route path="/" element={<BookingForm />} />
          <Route path="/bookings" element={<BookingList />} />
          <Route path="/booking/:id" element={<BookingDetails />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
