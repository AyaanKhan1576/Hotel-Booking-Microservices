import { Link } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';
import { getUsers, deleteUser } from '../../services/userService';
import { AuthContext } from '../../context/AuthContext';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getUsers();
        setUsers(data);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to fetch users');
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(userId);
        setUsers(users.filter(user => user.userId !== userId));
      } catch (err) {
        setError(err.message || 'Failed to delete user');
      }
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="user-list">
      <h2>User Management</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((userItem) => (
            <tr key={userItem.userId}>
              <td>{userItem.userId}</td>
              <td>{userItem.name}</td>
              <td>{userItem.email}</td>
              <td>{userItem.role}</td>
              <td>
              {user?.role === 'admin' && (
    <>
      <Link to={`/users/edit/${userItem.userId}`}>
        <button>Edit</button>
      </Link>
      <button onClick={() => handleDelete(userItem.userId)}>Delete</button>
    </>
  )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserList;