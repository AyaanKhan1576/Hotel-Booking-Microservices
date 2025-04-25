// src/App.js
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import BookingForm from './components/BookingForm';
import BookingList from './components/BookingList';
import BookingDetails from './components/BookingDetails';
import GroupBookingForm from './components/GroupBookingForm';

function App() {
  return (
    <Router>
      <nav style={{ padding: '1rem' }}>
        <Link to="/" style={{ marginRight: 10 }}>New Booking</Link>
        <Link to="/bookings" style={{ marginRight: 10 }}>My Bookings</Link>
        <Link to="/group-booking">Group Booking</Link>
      </nav>
      <hr/>
      <Routes>
        <Route path="/" element={<BookingForm />} />
        <Route path="/bookings" element={<BookingList />} />
        <Route path="/booking/:id" element={<BookingDetails />} />
        <Route path="/group-booking" element={<GroupBookingForm />} />
      </Routes>
    </Router>
  );
}

export default App;
