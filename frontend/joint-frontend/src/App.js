// src/App.js
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider} from './src-user/context/AuthContext';
import PrivateRoute from './src-user/components/layout/PrivateRoute';
import Homepage from './src-user/components/Homepage';
import Login from './src-user/components/auth/Login';
import Register from './src-user/components/auth/Register';

// Hotel Management Components
import HotelList from './src-hotel/components/HotelList';
import HotelForm from './src-hotel/components/HotelForm';
import RoomList from './src-hotel/components/RoomList';
import RoomForm from './src-hotel/components/RoomForm';

// Booking Components
import BookingForm from './src-booking/components/BookingForm';
import BookingList from './src-booking/components/BookingList';
import BookingDetails from './src-booking/components/BookingDetails';
import GroupBookingForm from './src-booking/components/GroupBookingForm';

// User Management Components
import UserList from './src-user/components/users/UserList';
import UserForm from './src-user/components/users/UserForm';

// Shared Navigation
import Navigation from './Navigation';
import './src-user/styles.css'; 
import './src-booking/styles.css';
import './src-hotel/styles.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navigation />
        <div className="main-content">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Homepage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Private Routes - Role-Based */}
            <Route element={<PrivateRoute />}>
              {/* User Routes */}
              <Route path="/users" element={<UserList />} />
              <Route path="/users/edit/:id" element={<UserForm />} />

              {/* Hotel Management Routes */}
              <Route path="/hotels" element={<HotelList />} />
              <Route path="/hotels/new" element={<HotelForm />} />
              <Route path="/hotels/:id" element={<HotelForm />} />
              <Route path="/rooms" element={<RoomList />} />
              <Route path="/rooms/new" element={<RoomForm />} />
              <Route path="/rooms/:id" element={<RoomForm />} />

              {/* Booking Routes */}
              <Route path="/bookings" element={<BookingList />} />
              <Route path="/booking/:id" element={<BookingDetails />} />
              <Route path="/group-booking" element={<GroupBookingForm />} />
              <Route path="/new-booking" element={<BookingForm />} />
            </Route>

            {/* Fallback Routes */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;