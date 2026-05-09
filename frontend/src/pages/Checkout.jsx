import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiCreditCard, FiTruck, FiChevronRight, FiCheckCircle } from 'react-icons/fi';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { toast } from 'react-hot-toast';

export default function Checkout() {
  const { cartItems, cartTotal, cartCount, clearCart } = useCart();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('Stripe');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (cartCount === 0 && !loading) {
      navigate('/cart');
    }
  }, [cartCount, navigate, loading]);

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      // 1. Create the order first
      const orderData = {
        items: cartItems.map(item => ({
          name: item.name,
          quantity: item.qty,
          image: item.thumbnail || (item.images && item.images[0]),
          price: item.price,
          product: item._id
        })),
        shippingAddress: {
          street: '123 Test St',
          city: 'Mumbai',
          pincode: '400001',
          state: 'Maharashtra',
          country: 'India'
        },
        paymentMethod: paymentMethod,
        itemsPrice: cartTotal,
        shippingPrice: cartTotal > 500 ? 0 : 50,
        taxPrice: Math.round(cartTotal * 0.18),
        totalPrice: Math.round(cartTotal * 1.18 + (cartTotal > 500 ? 0 : 50)),
      };

      const { data } = await axios.post('/api/orders', orderData, {
        headers: { 'X-ShopSphere-CSRF': 'shopsphere_v1' }
      });
      
      const createdOrder = data.data;

      // 2. Handle Payment
      if (paymentMethod === 'Stripe') {
        try {
          const { data: payData } = await axios.post('/api/payments/create-session', { orderId: createdOrder._id }, {
            headers: { 'X-ShopSphere-CSRF': 'shopsphere_v1' }
          });
          if (payData.url) {
            window.location.href = payData.url; // Redirect to Stripe
          }
        } catch (payErr) {
          console.error('Stripe Error:', payErr);
          toast.error('Payment gateway error. Using placeholder keys? Please configure actual Stripe keys in .env');
          // For test mode, we might want to redirect to success anyway or allow retry
          navigate(`/orders`); // Redirect to orders so they can try again later
        }
      } else {
        // COD
        const { data: codData } = await axios.post('/api/payments/cod', { orderId: createdOrder._id }, {
          headers: { 'X-ShopSphere-CSRF': 'shopsphere_v1' }
        });
        if (codData.success) {
          clearCart();
          navigate(`/order-success?id=${createdOrder._id}`);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container animate-fadeIn" style={{ padding: '40px 16px' }}>
      <h1 style={{ marginBottom: '24px', fontSize: '28px', fontWeight: 800 }}>Checkout</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '32px' }} className="checkout-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Shipping Section */}
          <section className="section-card">
            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FiTruck color="var(--brand-orange)" /> Shipping Address
            </h2>
            <div style={{ padding: '16px', border: '1px solid #ddd', borderRadius: '8px', background: '#f8f9fa' }}>
              <p style={{ fontWeight: 600, margin: '0 0 4px' }}>Default Address</p>
              <p style={{ color: '#555', fontSize: '14px', margin: 0 }}>
                123 Test Street, Mumbai, Maharashtra, 400001, India
              </p>
            </div>
          </section>

          {/* Payment Section */}
          <section className="section-card">
            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FiCreditCard color="var(--brand-orange)" /> Payment Method
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { id: 'Stripe', label: 'Credit/Debit Card (Stripe)', icon: '💳' },
                { id: 'COD',    label: 'Cash on Delivery (COD)',    icon: '💵' },
              ].map((m) => (
                <label
                  key={m.id}
                  onClick={() => setPaymentMethod(m.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '16px',
                    border: `1.5px solid ${paymentMethod === m.id ? 'var(--brand-orange)' : '#ddd'}`,
                    borderRadius: '8px', cursor: 'pointer', background: paymentMethod === m.id ? '#fff9f0' : '#fff',
                    transition: 'all 0.2s'
                  }}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === m.id}
                    onChange={() => setPaymentMethod(m.id)}
                    style={{ accentColor: 'var(--brand-orange)', width: '18px', height: '18px' }}
                  />
                  <span style={{ fontSize: '20px' }}>{m.icon}</span>
                  <span style={{ fontWeight: 500 }}>{m.label}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Order Review */}
          <section className="section-card">
            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Review Items</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {cartItems.map((item) => (
                <div key={item._id} style={{ display: 'flex', gap: '16px', paddingBottom: '12px', borderBottom: '1px solid #eee' }}>
                  <img src={item.thumbnail || (item.images && item.images[0])} style={{ width: '60px', height: '60px', objectFit: 'contain', background: '#f5f5f5', borderRadius: '4px' }} alt={item.name} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600 }} className="line-clamp-1">{item.name}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>Qty: {item.qty}</div>
                  </div>
                  <div style={{ fontWeight: 700 }}>₹{(item.price * item.qty).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Summary Sidebar */}
        <div style={{ position: 'sticky', top: '100px', height: 'fit-content' }}>
          <div className="section-card">
            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>Order Summary</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: '#555' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Items Subtotal:</span>
                <span>₹{cartTotal.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Shipping:</span>
                <span>{cartTotal > 500 ? 'FREE' : '₹50'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Tax (GST 18%):</span>
                <span>₹{Math.round(cartTotal * 0.18).toLocaleString()}</span>
              </div>
              <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '8px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: 800, color: 'var(--brand-red)' }}>
                <span>Order Total:</span>
                <span>₹{Math.round(cartTotal * 1.18 + (cartTotal > 500 ? 0 : 50)).toLocaleString()}</span>
              </div>
              
              <button
                className="btn-primary"
                onClick={handlePlaceOrder}
                disabled={loading}
                style={{ width: '100%', padding: '16px', fontSize: '16px', marginTop: '20px' }}
              >
                {loading ? 'Processing...' : `Place Your Order`}
              </button>
              
              <p style={{ textAlign: 'center', fontSize: '12px', marginTop: '12px', color: '#888' }}>
                By placing your order, you agree to ShopSphere's privacy notice and conditions of use.
              </p>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 900px) {
          .checkout-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
