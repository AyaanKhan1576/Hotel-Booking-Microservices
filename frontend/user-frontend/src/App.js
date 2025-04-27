import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/layout/PrivateRoute';
import Navbar from './components/layout/Navbar';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import UserList from './components/users/UserList';
import UserForm from './components/users/UserForm';
import Homepage from './components/Homepage';
// import LoyaltyEnroll from './components/loyalty/LoyaltyEnroll';
// import LoyaltyStatus from './components/loyalty/LoyaltyStatus';
import './styles.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <div className="container">
          <Routes>
          <Route path="/" element={<Homepage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<PrivateRoute />}>
              <Route path="users" element={<UserList />} />
              <Route path="users/edit/:id" element={<UserForm />} />
              {/* <Route path="loyalty/enroll" element={<LoyaltyEnroll />} />
              <Route path="loyalty/status" element={<LoyaltyStatus />} /> */}
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;