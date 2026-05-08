import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiBox, FiUsers, FiShoppingBag, FiTrendingUp, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: res } = await axios.get('/api/dashboard/stats');
      setData(res.data);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  if (loading) return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
      {[...Array(4)].map((_, i) => (
        <div key={i} className="skeleton" style={{ height: '120px', borderRadius: '12px' }} />
      ))}
    </div>
  );

  if (error || !data) return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <FiAlertCircle size={48} color="#dc2626" style={{ marginBottom: '16px' }} />
      <h3 style={{ color: '#1a202c', marginBottom: '8px' }}>Dashboard Unavailable</h3>
      <p style={{ color: '#718096', marginBottom: '20px' }}>{error || 'Unable to load stats.'}</p>
      <button className="btn-primary" onClick={fetchStats} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
        <FiRefreshCw size={16} /> Retry
      </button>
    </div>
  );

  const stats = [
    { label: 'Total Revenue',  value: `₹${(data.stats.revenue || 0).toLocaleString('en-IN')}`, icon: <FiTrendingUp />, color: '#48bb78', bg: '#f0fff4' },
    { label: 'Total Orders',   value: data.stats.orders || 0,   icon: <FiShoppingBag />, color: '#ed8936', bg: '#fffaf0' },
    { label: 'Total Products', value: data.stats.products || 0, icon: <FiBox />,         color: '#4299e1', bg: '#ebf8ff' },
    { label: 'Active Users',   value: data.stats.users || 0,    icon: <FiUsers />,       color: '#9f7aea', bg: '#faf5ff' },
  ];

  const STATUS_COLORS = {
    delivered:  { bg: '#c6f6d5', color: '#22543d' },
    shipped:    { bg: '#bee3f8', color: '#2c5282' },
    processing: { bg: '#feebc8', color: '#7b341e' },
    cancelled:  { bg: '#fed7d7', color: '#822727' },
    pending:    { bg: '#fef3c7', color: '#78350f' },
  };

  return (
    <div className="animate-fadeIn">
      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        {stats.map((stat) => (
          <div key={stat.label} className="section-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', border: '1px solid #e2e8f0' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: stat.bg, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0 }}>
              {stat.icon}
            </div>
            <div>
              <p style={{ margin: 0, color: '#718096', fontSize: '14px', fontWeight: 500 }}>{stat.label}</p>
              <h3 style={{ margin: '4px 0 0', fontSize: '24px', fontWeight: 700, color: '#1a202c' }}>{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Recent Orders */}
        <div className="section-card" style={{ padding: '24px', overflowX: 'auto' }}>
          <h3 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: 700 }}>Recent Orders</h3>
          {data.recentOrders && data.recentOrders.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '400px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #edf2f7' }}>
                  {['Order ID', 'Customer', 'Total', 'Status'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', color: '#718096', fontWeight: 600, fontSize: '13px', textAlign: 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.map((order) => {
                  const statusKey = (order.orderStatus || order.status || 'pending').toLowerCase();
                  const sc = STATUS_COLORS[statusKey] || STATUS_COLORS.pending;
                  return (
                    <tr key={order._id} style={{ borderBottom: '1px solid #edf2f7', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f7fafc'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}>
                      <td style={{ padding: '16px', fontSize: '13px', color: '#4a5568', fontFamily: 'monospace' }}>#{(order._id || '').slice(-6).toUpperCase()}</td>
                      <td style={{ padding: '16px', fontSize: '14px', fontWeight: 500 }}>{order.user?.name || 'Guest'}</td>
                      <td style={{ padding: '16px', fontSize: '14px', fontWeight: 600 }}>₹{(order.totalPrice || 0).toLocaleString('en-IN')}</td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, background: sc.bg, color: sc.color, textTransform: 'capitalize' }}>
                          {order.orderStatus || order.status || 'pending'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p style={{ color: '#a0aec0', textAlign: 'center', padding: '40px 0' }}>No orders yet.</p>
          )}
        </div>

        {/* Inventory Overview */}
        <div className="section-card" style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: 700 }}>Inventory by Category</h3>
          {data.categories && data.categories.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {data.categories.map((cat) => {
                const total = data.stats.products || 1;
                const pct = Math.round((cat.count / total) * 100);
                return (
                  <div key={cat._id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '14px' }}>
                      <span style={{ textTransform: 'capitalize', fontWeight: 500 }}>{cat._id || 'Unknown'}</span>
                      <span style={{ color: '#718096' }}>{cat.count} items ({pct}%)</span>
                    </div>
                    <div style={{ height: '8px', background: '#edf2f7', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: 'var(--brand-orange)', borderRadius: '4px', transition: 'width 0.8s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ color: '#a0aec0', textAlign: 'center' }}>No products yet.</p>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .admin-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
