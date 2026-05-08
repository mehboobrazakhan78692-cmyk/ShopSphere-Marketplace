import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiEye, FiTrash2, FiCheckCircle, FiClock } from 'react-icons/fi';
import toast from 'react-hot-toast';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get('/api/orders');
      setOrders(data.data);
    } catch (error) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      await axios.put(`/api/orders/${id}/status`, { status });
      toast.success(`Order marked as ${status}`);
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (loading) return <div className="skeleton" style={{ height: '500px', borderRadius: '12px' }} />;

  return (
    <div className="animate-fadeIn">
      <div className="section-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #edf2f7' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Order Management</h3>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f7fafc', textAlign: 'left' }}>
                <th style={{ padding: '16px 24px', color: '#718096', fontWeight: 600, fontSize: '13px' }}>ORDER ID</th>
                <th style={{ padding: '16px 24px', color: '#718096', fontWeight: 600, fontSize: '13px' }}>CUSTOMER</th>
                <th style={{ padding: '16px 24px', color: '#718096', fontWeight: 600, fontSize: '13px' }}>DATE</th>
                <th style={{ padding: '16px 24px', color: '#718096', fontWeight: 600, fontSize: '13px' }}>TOTAL</th>
                <th style={{ padding: '16px 24px', color: '#718096', fontWeight: 600, fontSize: '13px' }}>STATUS</th>
                <th style={{ padding: '16px 24px', color: '#718096', fontWeight: 600, fontSize: '13px' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} style={{ borderBottom: '1px solid #edf2f7' }}>
                  <td style={{ padding: '16px 24px', fontSize: '14px', color: '#4a5568', fontWeight: 600 }}>#{order._id.slice(-6).toUpperCase()}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 500 }}>{order.user?.name}</div>
                    <div style={{ fontSize: '12px', color: '#718096' }}>{order.user?.email}</div>
                  </td>
                  <td style={{ padding: '16px 24px', fontSize: '14px' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 700 }}>₹{order.totalPrice.toLocaleString()}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <select 
                      value={order.status}
                      onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                      style={{ 
                        padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
                        border: '1px solid #edf2f7', outline: 'none', cursor: 'pointer',
                        background: order.status === 'Delivered' ? '#c6f6d5' : order.status === 'Shipped' ? '#bee3f8' : '#fed7d7',
                        color: order.status === 'Delivered' ? '#22543d' : order.status === 'Shipped' ? '#2c5282' : '#822727'
                      }}
                    >
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button style={{ background: 'none', border: 'none', color: '#4299e1', cursor: 'pointer', fontSize: '18px' }}><FiEye /></button>
                      <button style={{ background: 'none', border: 'none', color: '#f56565', cursor: 'pointer', fontSize: '18px' }}><FiTrash2 /></button>
                    </div>
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

export default AdminOrders;
