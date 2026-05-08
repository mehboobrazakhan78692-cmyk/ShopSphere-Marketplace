import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FiPackage, FiChevronRight, FiClock } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await axios.get('/api/orders/myorders');
        setOrders(data.data);
      } catch (err) {
        toast.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <div className="container" style={{ padding: '40px' }}><div className="skeleton" style={{ height: '300px' }} /></div>;

  return (
    <div className="container" style={{ padding: '40px 16px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '24px' }}>Your Orders</h1>
      
      {orders.length === 0 ? (
        <div className="section-card" style={{ textAlign: 'center', padding: '60px' }}>
          <FiPackage size={48} color="#ccc" style={{ marginBottom: '16px' }} />
          <p style={{ color: '#666' }}>You haven't placed any orders yet.</p>
          <Link to="/" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block', marginTop: '16px', padding: '10px 24px' }}>
            Start Shopping
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {orders.map((order) => (
            <div key={order._id} className="section-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '12px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '24px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase' }}>Order Placed</div>
                    <div style={{ fontSize: '14px', fontWeight: 500 }}>{new Date(order.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase' }}>Total</div>
                    <div style={{ fontSize: '14px', fontWeight: 500 }}>₹{order.totalPrice.toLocaleString()}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase' }}>Ship To</div>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: '#007185', cursor: 'help' }}>{order.shippingAddress.city}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase' }}>Order # {order._id.toString().slice(-12).toUpperCase()}</div>
                  <Link to={`/order/${order._id}`} style={{ fontSize: '13px', color: '#007185', textDecoration: 'none' }}>View order details</Link>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {(() => {
                        const s = (order.orderStatus || order.status || 'pending');
                        const label = s.charAt(0).toUpperCase() + s.slice(1);
                        return s.toLowerCase() === 'delivered' ? `✅ ${label}` : `📦 ${label}`;
                      })()}
                    </h3>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      {order.items.map((item, idx) => (
                        <img
                          key={idx}
                          src={item.image}
                          style={{ width: '80px', height: '80px', objectFit: 'contain', border: '1px solid #eee', borderRadius: '4px', background: '#f8f9fa' }}
                          alt={item.name}
                          onError={e => { e.target.src = ''; e.target.style.display = 'none'; }}
                        />
                      ))}
                    </div>
                  </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <Link to={`/order/${order._id}`} className="btn-secondary" style={{ textDecoration: 'none', textAlign: 'center', padding: '8px 16px', fontSize: '13px' }}>
                    Track Package
                  </Link>
                  <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>Return items</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
