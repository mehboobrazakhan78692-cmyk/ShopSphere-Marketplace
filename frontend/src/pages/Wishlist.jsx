import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiTrash2, FiShoppingBag } from 'react-icons/fi';
import ProductCard from '../components/ProductCard';

export default function Wishlist() {
  const { wishlistItems, removeFromWishlist, wishlistCount } = useWishlist();
  const { addToCart } = useCart();

  if (wishlistCount === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <FiHeart size={64} color="#ddd" />
        <h2 style={{ marginTop: '16px', color: '#555' }}>Your wishlist is empty</h2>
        <p style={{ color: '#888', marginBottom: '24px' }}>Save items that you like in your wishlist to review them later.</p>
        <Link to="/" className="btn-primary" style={{ textDecoration: 'none', padding: '12px 28px' }}>
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <main style={{ maxWidth: '1200px', margin: '24px auto', padding: '0 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>My Wishlist ({wishlistCount})</h1>
        <Link to="/" style={{ color: '#007bff', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>
          Continue Shopping
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
        {wishlistItems.map((item) => (
          <div key={item._id} className="section-card" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative' }}>
            {/* Remove button */}
            <button
              onClick={() => removeFromWishlist(item._id)}
              style={{
                position: 'absolute', top: '8px', right: '8px',
                background: '#fff', border: '1px solid #ddd',
                borderRadius: '50%', width: 32, height: 32,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', zIndex: 1, color: '#cc0c39'
              }}
            >
              <FiTrash2 size={16} />
            </button>

            {/* Product Info Link */}
            <Link to={`/product/${item._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ height: '180px', background: '#f8f9fa', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {item.thumbnail ? (
                  <img src={item.thumbnail} alt={item.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                ) : (
                   <span style={{ fontSize: '48px' }}>📦</span>
                )}
              </div>
              <h3 className="line-clamp-2" style={{ margin: '12px 0 4px', fontSize: '14px', fontWeight: 600 }}>{item.name}</h3>
              <p style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 700 }}>₹{item.price.toLocaleString('en-IN')}</p>
            </Link>

            {/* Actions */}
            <button
              className="btn-primary"
              style={{ width: '100%', fontSize: '13px', padding: '10px' }}
              onClick={() => {
                addToCart(item);
                removeFromWishlist(item._id);
              }}
            >
              <FiShoppingCart size={14} style={{ marginRight: '6px' }} /> Move to Cart
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
