import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navigation from './components/Navigation';
import HotelList from './components/HotelList';
import HotelForm from './components/HotelForm';
import RoomList from './components/RoomList';
import RoomForm from './components/RoomForm';
import './styles.css';

function App() {
  return (
    <Router>
      <Navigation />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<HotelList />} />
          <Route path="/hotels" element={<HotelList />} />
          <Route path="/hotels/new" element={<HotelForm />} />
          <Route path="/hotels/:id" element={<HotelForm />} />
          <Route path="/rooms" element={<RoomList />} />
          <Route path="/rooms/new" element={<RoomForm />} />
          <Route path="/rooms/:id" element={<RoomForm />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;