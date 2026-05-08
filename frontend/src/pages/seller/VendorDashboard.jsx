import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiBox, FiShoppingBag, FiDollarSign, FiAlertCircle, FiArrowRight, FiRefreshCw } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const VendorDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: res } = await axios.get('/api/vendor/stats');
      setData(res.data);
    } catch (err) {
      console.error('Error fetching vendor stats:', err);
      setError(err.response?.data?.message || 'Failed to load vendor stats');
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
      <h3 style={{ color: '#1e293b', marginBottom: '8px' }}>Stats Unavailable</h3>
      <p style={{ color: '#64748b', marginBottom: '20px' }}>{error || 'Unable to load vendor stats.'}</p>
      <button className="btn-primary" onClick={fetchStats} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
        <FiRefreshCw size={16} /> Retry
      </button>
    </div>
  );

  const stats = [
    { label: 'Total Earnings',  value: `₹${(data.stats?.revenue || 0).toLocaleString('en-IN')}`, icon: <FiDollarSign />, color: '#059669', bg: '#ecfdf5' },
    { label: 'Orders Received', value: data.stats?.orders || 0,   icon: <FiShoppingBag />, color: '#7c3aed', bg: '#f5f3ff' },
    { label: 'My Products',     value: data.stats?.products || 0, icon: <FiBox />,         color: '#0284c7', bg: '#f0f9ff' },
    { label: 'Low Stock Items', value: data.stats?.lowStock || 0, icon: <FiAlertCircle />, color: '#dc2626', bg: '#fef2f2' },
  ];

  return (
    <div className="animate-fadeIn">
      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        {stats.map((stat) => (
          <div key={stat.label} className="section-card" style={{ padding: '24px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: 0, color: '#64748b', fontSize: '14px', fontWeight: 600 }}>{stat.label}</p>
                <h3 style={{ margin: '8px 0 0', fontSize: '28px', fontWeight: 800, color: '#1e293b' }}>{stat.value}</h3>
              </div>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: stat.bg, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0 }}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Stock Alerts */}
        <div className="section-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Stock Alerts</h3>
            <Link to="/seller/products" style={{ fontSize: '13px', color: '#0284c7', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              View All <FiArrowRight size={14} />
            </Link>
          </div>
          {!data.lowStockItems || data.lowStockItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <span style={{ fontSize: '32px' }}>✨</span>
              <p style={{ color: '#64748b', fontSize: '14px', marginTop: '8px' }}>All products are well stocked!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {data.lowStockItems.map((p) => (
                <div key={p._id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#fef2f2', borderRadius: '12px', border: '1px solid #fecaca' }}>
                  <div style={{ width: 40, height: 40, background: '#fff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                    {p.thumbnail
                      ? <img src={p.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; e.target.parentElement.textContent = '📦'; }} />
                      : '📦'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#1e293b' }} className="line-clamp-1">{p.name}</p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#dc2626', fontWeight: 500 }}>Only {p.stock} left in stock</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="section-card" style={{ padding: '24px', background: 'linear-gradient(135deg, #38bdf8, #0284c7)', color: '#fff' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: '20px', fontWeight: 800 }}>Ready to sell more?</h3>
          <p style={{ margin: '0 0 24px', fontSize: '14px', opacity: 0.9, lineHeight: 1.6 }}>
            Upload new products to reach more customers and grow your business today.
          </p>
          <Link
            to="/seller/add-product"
            style={{
              display: 'inline-block', background: '#fff', color: '#0284c7',
              padding: '12px 24px', borderRadius: '12px', fontWeight: 700,
              textDecoration: 'none', transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'; }}
          >
            + Add New Product
          </Link>

          <div style={{ marginTop: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link to="/seller/products" style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.5)', paddingBottom: '1px' }}>
              Manage Products →
            </Link>
            <Link to="/seller/orders" style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.5)', paddingBottom: '1px' }}>
              View Orders →
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .vendor-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default VendorDashboard;
