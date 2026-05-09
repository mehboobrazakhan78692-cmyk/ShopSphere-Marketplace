import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { FiCheckCircle, FiPackage, FiArrowRight } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import axios from 'axios';

export default function OrderSuccess() {
  const { clearCart } = useCart();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const orderId = new URLSearchParams(location.search).get('id');
  const sessionId = new URLSearchParams(location.search).get('session_id');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clearCart();
    if (orderId) {
      // 1. Confirm payment if it's a Stripe redirect
      const confirmAndFetch = async () => {
        try {
          if (sessionId) {
            await axios.post('/api/payments/confirm-payment', { orderId, sessionId });
          }
          const { data } = await axios.get(`/api/orders/${orderId}`);
          setOrder(data.data);
        } catch (err) {
          console.error('Error confirming/fetching order', err);
        } finally {
          setLoading(false);
        }
      };
      
      confirmAndFetch();
    } else {
      setLoading(false);
    }
  }, [orderId, sessionId, clearCart]);

  if (loading) return (
    <div className="container" style={{ padding: '80px 16px', textAlign: 'center', minHeight: '60vh' }}>
      <div className="loader" style={{ margin: '0 auto' }} />
      <p style={{ marginTop: '20px', color: '#666' }}>Confirming your order...</p>
    </div>
  );

  return (
    <div className="container" style={{ padding: '80px 16px', textAlign: 'center', minHeight: '60vh' }}>
      <div className="animate-fadeIn">
        <FiCheckCircle size={80} color="var(--brand-green)" style={{ marginBottom: '24px' }} />
        <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '16px' }}>Order Placed Successfully!</h1>
        <p style={{ color: '#555', fontSize: '18px', maxWidth: '600px', margin: '0 auto 32px' }}>
          Thank you for shopping with ShopSphere. Your order #{orderId?.slice(-8).toUpperCase()} has been confirmed and will be shipped soon.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <Link to="/orders" className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', padding: '12px 24px' }}>
            <FiPackage /> View My Orders
          </Link>
          <Link to="/" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', padding: '12px 24px' }}>
            Continue Shopping <FiArrowRight />
          </Link>
        </div>

        {order && (
          <div className="section-card" style={{ maxWidth: '500px', margin: '40px auto 0', textAlign: 'left' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>Delivery Estimate</h3>
            <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
              Expected Delivery: <strong>{new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
