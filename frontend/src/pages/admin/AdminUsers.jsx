import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiTrash2, FiUser, FiShield, FiMail } from 'react-icons/fi';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get('/api/auth/users');
      setUsers(data.data);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleUpdate = async (id, role) => {
    try {
      await axios.put(`/api/auth/users/${id}/role`, { role });
      toast.success(`User role updated to ${role}`);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update role');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this user?')) {
      try {
        await axios.delete(`/api/auth/users/${id}`);
        toast.success('User removed');
        fetchUsers();
      } catch (error) {
        toast.error('Failed to remove user');
      }
    }
  };

  if (loading) return <div className="skeleton" style={{ height: '500px', borderRadius: '12px' }} />;

  return (
    <div className="animate-fadeIn">
      <div className="section-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #edf2f7' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>User Management</h3>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f7fafc', textAlign: 'left' }}>
                <th style={{ padding: '16px 24px', color: '#718096', fontWeight: 600, fontSize: '13px' }}>USER</th>
                <th style={{ padding: '16px 24px', color: '#718096', fontWeight: 600, fontSize: '13px' }}>ROLE</th>
                <th style={{ padding: '16px 24px', color: '#718096', fontWeight: 600, fontSize: '13px' }}>JOIN DATE</th>
                <th style={{ padding: '16px 24px', color: '#718096', fontWeight: 600, fontSize: '13px' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} style={{ borderBottom: '1px solid #edf2f7' }}>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#f4f7f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-orange)', fontWeight: 700 }}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 600 }}>{user.name}</div>
                        <div style={{ fontSize: '12px', color: '#718096', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FiMail size={12} /> {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <select 
                      value={user.role}
                      onChange={(e) => handleRoleUpdate(user._id, e.target.value)}
                      style={{ 
                        padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                        border: '1px solid #edf2f7', outline: 'none', cursor: 'pointer',
                        background: user.role === 'admin' ? '#ebf8ff' : user.role === 'vendor' ? '#fffaf0' : '#f7fafc',
                        color: user.role === 'admin' ? '#2c5282' : user.role === 'vendor' ? '#7b341e' : '#4a5568'
                      }}
                    >
                      <option value="user">User</option>
                      <option value="vendor">Vendor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td style={{ padding: '16px 24px', fontSize: '14px' }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <button 
                      onClick={() => handleDelete(user._id)} 
                      style={{ background: 'none', border: 'none', color: '#f56565', cursor: 'pointer', fontSize: '18px' }}
                      title="Remove User"
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
