import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FiPackage, FiTruck, FiMapPin, FiCheckCircle, FiClock } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await axios.get(`/api/orders/${id}`);
        setOrder(data.data);
      } catch (err) {
        toast.error('Order not found');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) return <div className="container" style={{ padding: '40px' }}><div className="skeleton" style={{ height: '400px' }} /></div>;
  if (!order) return <div className="container" style={{ padding: '40px' }}>Order not found.</div>;

  const steps = [
    { status: 'placed', label: 'Ordered', icon: <FiPackage /> },
    { status: 'confirmed', label: 'Confirmed', icon: <FiCheckCircle /> },
    { status: 'shipped', label: 'Shipped', icon: <FiTruck /> },
    { status: 'out-for-delivery', label: 'Out for Delivery', icon: <FiMapPin /> },
    { status: 'delivered', label: 'Delivered', icon: <FiCheckCircle /> },
  ];

  const currentStatusIndex = steps.findIndex(s => s.status === order.orderStatus);

  return (
    <div className="container animate-fadeIn" style={{ padding: '40px 16px' }}>
      <nav style={{ marginBottom: '20px', fontSize: '14px', color: '#666' }}>
        <Link to="/orders" style={{ color: '#007185', textDecoration: 'none' }}>Your Orders</Link>
        <span style={{ margin: '0 8px' }}>›</span>
        <span>Order Details</span>
      </nav>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800 }}>Order Details</h1>
        <div style={{ fontSize: '14px', color: '#555' }}>
          Ordered on {new Date(order.createdAt).toLocaleDateString()} | Order# {order._id.toString().toUpperCase()}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }} className="details-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Tracking Timeline */}
          <section className="section-card" style={{ padding: '32px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '32px' }}>Track Package</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '15px', left: '40px', right: '40px', height: '4px', background: '#eee', zIndex: 0 }} />
              <div style={{ position: 'absolute', top: '15px', left: '40px', width: `${(currentStatusIndex / (steps.length - 1)) * 88}%`, height: '4px', background: 'var(--brand-green)', zIndex: 1, transition: 'width 1s ease-in-out' }} />
              
              {steps.map((step, index) => {
                const isActive = index <= currentStatusIndex;
                const isCurrent = index === currentStatusIndex;
                return (
                  <div key={step.status} style={{ zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
                    <div style={{ 
                      width: '32px', height: '32px', borderRadius: '50%', 
                      background: isActive ? 'var(--brand-green)' : '#fff', 
                      color: isActive ? '#fff' : '#ccc',
                      border: `2px solid ${isActive ? 'var(--brand-green)' : '#eee'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: isCurrent ? '0 0 0 4px rgba(0, 128, 0, 0.2)' : 'none'
                    }}>
                      {step.icon}
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: isActive ? 700 : 400, color: isActive ? '#333' : '#999', textAlign: 'center' }}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
            
            {order.trackingId && (
              <div style={{ marginTop: '32px', padding: '16px', background: '#f8f9fa', borderRadius: '8px', fontSize: '14px' }}>
                <strong>Tracking ID:</strong> {order.trackingId} | <strong>Carrier:</strong> {order.carrier || 'Standard Shipping'}
              </div>
            )}
          </section>

          {/* Items Section */}
          <section className="section-card">
            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Items Ordered</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {order.items.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '16px' }}>
                  <img src={item.image} style={{ width: '80px', height: '80px', objectFit: 'contain', border: '1px solid #eee', borderRadius: '4px' }} alt={item.name} />
                  <div style={{ flex: 1 }}>
                    <Link to={`/product/${item.product}`} style={{ fontSize: '15px', color: '#007185', textDecoration: 'none', fontWeight: 500 }}>{item.name}</Link>
                    <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>Sold by: ShopSphere</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, marginTop: '8px' }}>₹{item.price.toLocaleString()}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <Link to={`/product/${item.product}`} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px', textDecoration: 'none', textAlign: 'center' }}>Buy it again</Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <section className="section-card">
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>Shipping Address</h3>
            <p style={{ fontSize: '14px', color: '#333', margin: 0 }}>
              {order.shippingAddress.street}<br />
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}<br />
              {order.shippingAddress.country}
            </p>
          </section>

          <section className="section-card">
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>Payment Method</h3>
            <p style={{ fontSize: '14px', color: '#333', margin: '0 0 8px' }}>{order.paymentMethod}</p>
            <p style={{ fontSize: '13px', color: order.isPaid ? 'var(--brand-green)' : 'var(--brand-red)', fontWeight: 600 }}>
              {order.isPaid ? `Paid on ${new Date(order.paidAt).toLocaleDateString()}` : 'Payment Pending'}
            </p>
          </section>

          <section className="section-card">
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>Order Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Item(s) Subtotal:</span> <span>₹{order.itemsPrice.toLocaleString()}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Shipping:</span> <span>₹{order.shippingPrice.toLocaleString()}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Tax:</span> <span>₹{order.taxPrice.toLocaleString()}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '15px', marginTop: '8px', borderTop: '1px solid #eee', paddingTop: '8px' }}>
                <span>Grand Total:</span> <span>₹{order.totalPrice.toLocaleString()}</span>
              </div>
            </div>
          </section>
        </div>
      </div>
      <style>{`
        @media (max-width: 900px) {
          .details-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
