import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Table, Button, Alert, Form, Row, Col } from 'react-bootstrap';
import { get_avail_rooms, del_room } from '../services/api';

const RoomList = () => {
    const [rooms, setRooms] = useState([]);
    const [error, setError] = useState('');
    const [amenities, setAmenities] = useState('');
    const [capacity, setCapacity] = useState('');
    const [sortBy, setSortBy] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // load while typing -> callback
    const loadRooms = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data } = await get_avail_rooms({ amenities, capacity, sortBy });
            setRooms(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [amenities, capacity, sortBy]); 

    useEffect(() => {
        loadRooms();
    }, [loadRooms]); 

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this room?')) {
            try {
                await del_room(id);
                setRooms(rooms.filter(room => room._id !== id));
            } catch (err) {
                setError(err.message);
            }
        }
    };

    const handleApply = () => {
        loadRooms();
    };

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between mb-3">
                <h2>Rooms</h2>
                <Button as={Link} to="/rooms/new" variant="primary">Add Room</Button>
            </div>

            {/* Filter and Search Sec*/}
            <Row className="mb-3">
                <Col>
                    <Form.Control
                        type="text"
                        placeholder="Filter by amenities (comma-separated)"
                        value={amenities}
                        onChange={(e) => setAmenities(e.target.value)}
                    />
                    <Button variant="secondary" onClick={handleApply} className="mt-2">
                        Apply Filter
                    </Button>
                </Col>
                <Col>
                    <Form.Control
                        type="number"
                        placeholder="Filter by capacity"
                        value={capacity}
                        onChange={(e) => setCapacity(e.target.value)}
                    />
                    <Button variant="secondary" onClick={handleApply} className="mt-2">
                        Apply Filter
                    </Button>
                </Col>
                <Col>
                    <Form.Select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="">Sort by</option>
                        <option value="price_asc">Price (Low to High)</option>
                        <option value="price_desc">Price (High to Low)</option>
                    </Form.Select>
                    <Button variant="secondary" onClick={handleApply} className="mt-2">
                        Apply Sort
                    </Button>
                </Col>
            </Row>

            {error && <Alert variant="danger">{error}</Alert>}
            {isLoading && <Alert variant="info">Loading...</Alert>}

            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Room Number</th>
                        <th>Type</th>
                        <th>Capacity</th>
                        <th>Price</th>
                        <th>Amenities</th>
                        <th>Hotel</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {rooms.map(room => (
                        <tr key={room._id}>
                            <td>{room.roomno}</td>
                            <td>{room.type}</td>
                            <td>{room.capacity}</td>
                            <td>{room.price}</td>
                            <td>{room.amenities.join(', ')}</td>
                            <td>{room.hotel?.name}</td>
                            <td>
                                <Button as={Link} to={`/rooms/${room._id}`} variant="info" size="sm" className="me-2">
                                    View/Edit
                                </Button>
                                <Button variant="danger" size="sm" onClick={() => handleDelete(room._id)}>
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

export default RoomList;