import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { updateUser, getUsers } from '../../services/userService';

const UserForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const users = await getUsers();
        const user = users.find(u => u.userId === parseInt(id));
        if (user) {
          setFormData({
            name: user.name,
            email: user.email,
            role: user.role
          });
        } else {
          setError('User not found');
        }
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to fetch user');
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateUser(id, formData);
      navigate('/users');
    } catch (err) {
      setError(err.message || 'Failed to update user');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="user-form">
      <h2>Edit User</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Role</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
          >
            <option value="user">User</option>
            <option value="hotelManagement">Hotel Management</option>
            <option value="travelAgent">Travel Agent</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button type="submit">Update User</button>
        <button type="button" onClick={() => navigate('/users')}>
          Cancel
        </button>
      </form>
    </div>
  );
};

export default UserForm;