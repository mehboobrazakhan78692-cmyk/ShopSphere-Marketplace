import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { FiTrash2, FiPlus, FiMinus, FiShoppingBag } from 'react-icons/fi';

export default function Cart() {
  const { cartItems, removeFromCart, updateQty, cartTotal, clearCart } = useCart();

  if (cartItems.length === 0) return (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
      <FiShoppingBag size={64} color="#ddd" />
      <h2 style={{ marginTop: '16px', color: '#555' }}>Your cart is empty</h2>
      <p style={{ color: '#888', marginBottom: '24px' }}>Looks like you haven't added anything yet.</p>
      <Link to="/" className="btn-primary" style={{ textDecoration: 'none', padding: '12px 28px' }}>
        Continue Shopping
      </Link>
    </div>
  );

  const tax = cartTotal * 0.18;
  const delivery = cartTotal > 499 ? 0 : 49;
  const total = cartTotal + tax + delivery;

  return (
    <main style={{ maxWidth: '1200px', margin: '24px auto', padding: '0 16px', display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>Shopping Cart</h1>
        {cartItems.map((item) => (
          <div key={item._id} className="section-card" style={{ display: 'flex', gap: '16px', marginBottom: '12px', padding: '16px' }}>
            <div style={{ width: 80, height: 80, background: '#f8f9fa', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
              {item.thumbnail ? <img src={item.thumbnail} alt={item.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} /> : <span style={{ fontSize: '32px' }}>📦</span>}
            </div>
            <div style={{ flex: 1 }}>
              <h3 className="line-clamp-2" style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 500 }}>{item.name}</h3>
              <p style={{ margin: '0 0 8px', fontSize: '12px', color: 'var(--brand-green)', fontWeight: 500 }}>✓ In Stock — FREE Delivery</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '6px', overflow: 'hidden' }}>
                  <button onClick={() => updateQty(item._id, item.qty - 1)} style={{ width: 32, height: 32, background: '#f8f9fa', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiMinus size={14} /></button>
                  <span style={{ width: 40, textAlign: 'center', fontWeight: 600 }}>{item.qty}</span>
                  <button onClick={() => updateQty(item._id, item.qty + 1)} style={{ width: 32, height: 32, background: '#f8f9fa', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiPlus size={14} /></button>
                </div>
                <button onClick={() => removeFromCart(item._id)} style={{ background: 'none', border: 'none', color: '#cc0c39', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 500 }}>
                  <FiTrash2 size={14} /> Remove
                </button>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontWeight: 700, fontSize: '18px', margin: 0 }}>₹{(item.price * item.qty).toLocaleString('en-IN')}</p>
              <p style={{ color: '#666', fontSize: '12px', margin: '4px 0 0' }}>₹{item.price.toLocaleString('en-IN')} × {item.qty}</p>
            </div>
          </div>
        ))}
        <button onClick={clearCart} style={{ background: 'none', border: '1px solid #ddd', borderRadius: '6px', padding: '8px 16px', cursor: 'pointer', color: '#666', fontSize: '13px' }}>
          Clear Cart
        </button>
      </div>

      {/* Order Summary */}
      <div className="section-card" style={{ height: 'fit-content', position: 'sticky', top: '80px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Order Summary</h2>
        {[
          { label: `Items (${cartItems.length})`, value: cartTotal },
          { label: 'GST (18%)', value: tax },
          { label: 'Delivery', value: delivery, free: delivery === 0 },
        ].map((row) => (
          <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px' }}>
            <span style={{ color: '#555' }}>{row.label}</span>
            <span style={{ fontWeight: 500 }}>{row.free ? <span style={{ color: 'var(--brand-green)' }}>FREE</span> : `₹${row.value.toFixed(2)}`}</span>
          </div>
        ))}
        <div style={{ borderTop: '1px solid #eee', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '18px', marginBottom: '16px' }}>
          <span>Total</span>
          <span>₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
        </div>
        <Link
          to="/checkout"
          className="btn-primary"
          style={{ width: '100%', padding: '14px', fontSize: '16px', display: 'block', textAlign: 'center', textDecoration: 'none' }}
        >
          Proceed to Checkout
        </Link>
        <p style={{ textAlign: 'center', marginTop: '10px', fontSize: '12px', color: '#666' }}>
          🔒 Safe & Secure Payments
        </p>
      </div>
    </main>
  );
}
