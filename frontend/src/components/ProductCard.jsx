import { FiShoppingCart, FiHeart } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import StarRating from './StarRating';
import { getOptimizedImage } from '../utils/imageUtils';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();

  const wishlisted = isWishlisted(product._id);

  const discountPct = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : product.discount || 0;

  return (
    <div
      className="product-card animate-fadeIn"
      onClick={() => navigate(`/product/${product._id || product.id}`)}
    >
      {/* Discount badge */}
      {discountPct > 0 && (
        <span className="discount-badge" style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 1 }}>
          -{discountPct}%
        </span>
      )}

      {/* Wishlist */}
      <button
        style={{
          position: 'absolute', top: '10px', right: '10px',
          background: wishlisted ? '#fff0f0' : 'rgba(255,255,255,.8)',
          border: 'none',
          borderRadius: '50%', width: 32, height: 32,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', zIndex: 1,
          transition: 'all 0.2s',
        }}
        onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        <FiHeart
          size={16}
          color={wishlisted ? '#e31c1c' : '#666'}
          fill={wishlisted ? '#e31c1c' : 'transparent'}
          style={{ transition: 'all 0.2s' }}
        />
      </button>

      {/* Image */}
      <div
        style={{
          height: '200px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f8f9fa',
          borderRadius: '6px',
          marginBottom: '12px',
          overflow: 'hidden',
        }}
      >
        {product.thumbnail || (product.images && product.images[0]) ? (
          <img
            src={getOptimizedImage(product.thumbnail || product.images[0], 400)}
            alt={product.name}
            loading="lazy"
            style={{
              maxHeight: '100%',
              maxWidth: '100%',
              objectFit: 'contain',
              transition: 'transform 0.3s',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            onError={e => {
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = `<span style="font-size:48px">${
                { electronics: '💻', fashion: '👗', home: '🏠', beauty: '💄' }[product.category] || '📦'
              }</span>`;
            }}
          />
        ) : (
          <div
            style={{
              width: '100%', height: '100%',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              color: '#aaa', gap: '8px',
            }}
          >
            <span style={{ fontSize: '48px' }}>
              {{ electronics: '💻', fashion: '👗', home: '🏠', beauty: '💄' }[product.category] || '📦'}
            </span>
          </div>
        )}
      </div>


      {/* Info */}
      <div>
        <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#007bff', fontWeight: 500 }}>
          {product.brand || product.vendor?.name || 'ShopSphere'}
        </p>
        <h3 className="line-clamp-2" style={{ margin: '0 0 6px', fontSize: '14px', fontWeight: 500, color: '#0f1111', lineHeight: '1.4' }}>
          {product.name}
        </h3>

        <StarRating rating={product.rating} count={product.numReviews} />

        {/* Price */}
        <div style={{ marginTop: '8px', display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '18px', fontWeight: 700, color: '#0f1111' }}>
            ₹{product.price?.toLocaleString('en-IN')}
          </span>
          {discountPct > 0 && product.originalPrice && (
            <span className="price-original">
              ₹{product.originalPrice?.toLocaleString('en-IN')}
            </span>
          )}
        </div>

        {/* Stock */}
        {product.stock !== undefined && product.stock < 10 && product.stock > 0 && (
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#cc0c39', fontWeight: 500 }}>
            Only {product.stock} left in stock!
          </p>
        )}
        {product.stock === 0 && (
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#cc0c39', fontWeight: 500 }}>
            Out of stock
          </p>
        )}

        <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--brand-green)', fontWeight: 500 }}>
          ✓ FREE Delivery
        </p>
      </div>

      {/* Hover actions */}
      <div className="product-card-actions">
        <button
          className="btn-primary"
          style={{ flex: 1, fontSize: '13px', padding: '8px 12px' }}
          onClick={(e) => {
            e.stopPropagation();
            addToCart(product);
          }}
        >
          <FiShoppingCart size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
          Add to Cart
        </button>
        <button
          className="btn-secondary"
          style={{ flex: 1, fontSize: '13px', padding: '8px 12px' }}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/product/${product._id || product.id}`);
          }}
        >
          View Details
        </button>
      </div>
    </div>
  );
}
