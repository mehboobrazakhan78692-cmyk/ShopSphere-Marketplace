import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiShoppingBag, FiUser, FiCalendar, FiCreditCard } from 'react-icons/fi';
import toast from 'react-hot-toast';

const VendorOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get('/api/orders/vendor-orders');
      setOrders(data.data);
    } catch (error) {
      toast.error('Failed to fetch your orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) return <div className="skeleton" style={{ height: '500px', borderRadius: '16px' }} />;

  return (
    <div className="animate-fadeIn">
      {orders.length === 0 ? (
        <div className="section-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#94a3b8' }}>
            <FiShoppingBag size={32} />
          </div>
          <h3>No orders yet</h3>
          <p style={{ color: '#64748b' }}>When customers buy your products, they will appear here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {orders.map((order) => (
            <div key={order._id} className="section-card" style={{ padding: '0', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
              {/* Order Header */}
              <div style={{ padding: '16px 24px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '24px' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Order ID</p>
                    <p style={{ margin: '2px 0 0', fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>#{order._id.slice(-8).toUpperCase()}</p>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Date</p>
                    <p style={{ margin: '2px 0 0', fontSize: '14px', color: '#1e293b' }}>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ 
                    padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700,
                    background: order.status === 'Delivered' ? '#dcfce7' : '#fee2e2',
                    color: order.status === 'Delivered' ? '#166534' : '#991b1b'
                  }}>
                    {order.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Order Content */}
              <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 300px', gap: '40px' }}>
                <div>
                  <h4 style={{ margin: '0 0 16px', fontSize: '13px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Your Items in Order</h4>
                  {order.items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '16px', marginBottom: idx === order.items.length - 1 ? 0 : '16px' }}>
                      <div style={{ width: 60, height: 60, borderRadius: '8px', background: '#f1f5f9', overflow: 'hidden', flexShrink: 0 }}>
                        {item.image ? <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '📦'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#1e293b' }}>{item.name}</p>
                        <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b' }}>Qty: {item.qty} × ₹{item.price.toLocaleString()}</p>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '15px' }}>
                        ₹{(item.price * item.qty).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ borderLeft: '1px solid #f1f5f9', paddingLeft: '24px' }}>
                  <h4 style={{ margin: '0 0 16px', fontSize: '13px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Customer Info</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                      <FiUser color="#94a3b8" />
                      <span style={{ fontWeight: 500 }}>{order.user?.name}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                      <FiCalendar color="#94a3b8" />
                      <span>{order.user?.email}</span>
                    </div>
                    <div style={{ marginTop: '12px', padding: '12px', background: '#f8fafc', borderRadius: '10px', fontSize: '13px' }}>
                      <p style={{ margin: '0 0 4px', fontWeight: 600, color: '#64748b' }}>Shipping Address:</p>
                      <p style={{ margin: 0, color: '#1e293b', lineHeight: 1.4 }}>
                        {order.shippingAddress.address}, {order.shippingAddress.city}<br />
                        {order.shippingAddress.postalCode}, {order.shippingAddress.country}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorOrders;
