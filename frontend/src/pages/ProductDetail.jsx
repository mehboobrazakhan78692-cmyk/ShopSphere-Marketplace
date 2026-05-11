import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiShare2, FiTruck, FiShield, FiRotateCcw, FiMinus, FiPlus, FiChevronRight, FiStar } from 'react-icons/fi';
import axios from 'axios';
import StarRating from '../components/StarRating';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import toast from 'react-hot-toast';
import { getOptimizedImage } from '../utils/imageUtils';

const MOCK_PRODUCTS = [
  { _id: '1', name: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones', description: 'Industry-leading noise cancellation. Exceptionally natural and accurate sound quality. Crystal-clear hands-free calling with 4 beamforming microphones. Up to 30 hours battery life. Multipoint connection for 2 devices. Ultracomfortable with lighter design.', price: 24990, originalPrice: 34990, category: 'electronics', brand: 'Sony', rating: 4.8, numReviews: 12450, stock: 8, thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop', images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&h=600&fit=crop'], specifications: { 'Driver Size': '30mm', 'Frequency Response': '4Hz - 40,000Hz', 'Battery Life': '30 hours', 'Weight': '250g', 'Connectivity': 'Bluetooth 5.2', 'Noise Cancellation': 'Yes — Adaptive' }, reviews: [{ _id: 'r1', name: 'Rahul S.', rating: 5, comment: 'Best headphones I have ever used. The noise cancellation is outstanding!', createdAt: '2024-03-15' }, { _id: 'r2', name: 'Priya M.', rating: 4, comment: 'Great sound quality and comfortable fit. Battery lasts all day.', createdAt: '2024-02-20' }] },
  { _id: '2', name: 'Samsung Galaxy S24 Ultra 256GB Titanium Black', description: 'The ultimate smartphone experience with Galaxy AI. 200MP camera, Snapdragon 8 Gen 3, and the built-in S Pen. 6.8" Dynamic AMOLED 2X display with titanium frame.', price: 129999, originalPrice: 134999, category: 'electronics', brand: 'Samsung', rating: 4.7, numReviews: 8930, stock: 15, thumbnail: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&h=600&fit=crop', images: ['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&h=600&fit=crop'], specifications: { 'Display': '6.8" Dynamic AMOLED 2X', 'Processor': 'Snapdragon 8 Gen 3', 'RAM': '12GB', 'Storage': '256GB', 'Camera': '200MP + 50MP + 12MP + 10MP', 'Battery': '5000mAh' }, reviews: [] },
  { _id: '3', name: 'Apple MacBook Air M3 Chip 15-inch Laptop', description: 'Supercharged by the M3 chip. Up to 18 hours of battery life. Stunningly thin design in four gorgeous colors. 15.3-inch Liquid Retina display.', price: 134900, originalPrice: 149900, category: 'electronics', brand: 'Apple', rating: 4.9, numReviews: 5670, stock: 5, thumbnail: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=600&fit=crop', images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=600&fit=crop'], specifications: { 'Chip': 'Apple M3', 'Display': '15.3" Liquid Retina', 'RAM': '8GB Unified Memory', 'Storage': '256GB SSD', 'Battery': '18 hours', 'Weight': '1.51 kg' }, reviews: [] },
  { _id: '4', name: "Men's Premium Casual Cotton Shirt - Pack of 3", description: 'Premium quality cotton shirts, breathable and comfortable. Perfect for daily wear and casual outings. Available in multiple sizes.', price: 1299, originalPrice: 2499, category: 'fashion', brand: 'FashionHub', rating: 4.2, numReviews: 3210, stock: 50, thumbnail: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=600&fit=crop', images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=600&fit=crop'], specifications: { 'Material': '100% Cotton', 'Fit': 'Regular', 'Sleeve': 'Full Sleeve', 'Pack': '3 Shirts', 'Wash': 'Machine Washable' }, reviews: [] },
  { _id: '5', name: 'Minimalist Nordic Coffee Table - White & Walnut', description: 'Elegant minimalist coffee table with Scandinavian design. Made from solid walnut wood with a white lacquered finish.', price: 8999, originalPrice: 14999, category: 'home', brand: 'HomeStyle', rating: 4.5, numReviews: 892, stock: 12, thumbnail: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=600&fit=crop', images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=600&fit=crop'], specifications: { 'Material': 'Solid Walnut + MDF', 'Dimensions': '100 × 50 × 45 cm', 'Weight Capacity': '50 kg', 'Assembly': 'Required' }, reviews: [] },
  { _id: '6', name: "L'Oréal Paris Revitalift Face Serum 30ml", description: 'Hyaluronic acid serum for intense hydration. Visible anti-wrinkle results in 2 weeks. Dermatologically tested.', price: 649, originalPrice: 999, category: 'beauty', brand: "L'Oréal", rating: 4.4, numReviews: 6780, stock: 100, thumbnail: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&h=600&fit=crop', images: ['https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&h=600&fit=crop'], specifications: { 'Volume': '30ml', 'Key Ingredient': '1.5% Hyaluronic Acid', 'Skin Type': 'All Skin Types', 'Usage': 'Daily AM/PM' }, reviews: [] },
  { _id: '7', name: 'boAt Airdopes 141 Bluetooth Truly Wireless Earbuds', description: 'Truly wireless earbuds with 42H total playtime. IPX4 water resistance. Signature boAt sound with 8mm drivers.', price: 1299, originalPrice: 2990, category: 'electronics', brand: 'boAt', rating: 4.3, numReviews: 45670, stock: 200, thumbnail: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&h=600&fit=crop', images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&h=600&fit=crop'], specifications: { 'Driver Size': '8mm', 'Playtime': '42 hours total', 'Charging': 'USB Type-C', 'Bluetooth': 'v5.1', 'Water Resistance': 'IPX4' }, reviews: [] },
  { _id: '8', name: "Women's Floral Printed Anarkali Kurta", description: 'Beautiful floral printed Anarkali kurta. Perfect for festive occasions and daily wear. Made from premium quality fabric.', price: 899, originalPrice: 1999, category: 'fashion', brand: 'Myntra', rating: 4.1, numReviews: 2340, stock: 35, thumbnail: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=600&fit=crop', images: ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=600&fit=crop'], specifications: { 'Material': 'Rayon', 'Length': 'Ankle Length', 'Pattern': 'Floral Print', 'Wash': 'Hand Wash' }, reviews: [] },
];

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`/api/products/${id}`);
        if (data.data) {
          setProduct(data.data);
          // Now fetch related in background without blocking the UI if possible
          axios.get(`/api/products?category=${data.data.category}&limit=4`)
            .then(({ data: related }) => {
              if (related.data) setRelatedProducts(related.data.filter(p => p._id !== id));
            })
            .catch(() => {}); // silently fail related
        } else throw new Error('fallback');
      } catch {
        const mock = MOCK_PRODUCTS.find(p => p._id === id);
        setProduct(mock || MOCK_PRODUCTS[0]);
        setRelatedProducts(MOCK_PRODUCTS.filter(p => p._id !== id && p.category === (mock || MOCK_PRODUCTS[0]).category).slice(0, 4));
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return (
    <main style={{ maxWidth: '1200px', margin: '24px auto', padding: '0 16px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        <div className="skeleton" style={{ height: '500px', borderRadius: '12px' }} />
        <div><div className="skeleton" style={{ height: '32px', width: '60%', marginBottom: '12px' }} /><div className="skeleton" style={{ height: '20px', width: '40%', marginBottom: '20px' }} /><div className="skeleton" style={{ height: '40px', width: '30%', marginBottom: '20px' }} /><div className="skeleton" style={{ height: '120px', marginBottom: '20px' }} /><div className="skeleton" style={{ height: '48px', width: '50%' }} /></div>
      </div>
    </main>
  );

  if (!product) return (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
      <h2>Product not found</h2>
      <Link to="/" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block', padding: '12px 28px', marginTop: '16px' }}>Back to Home</Link>
    </div>
  );

  const wishlisted = isWishlisted(product._id);
  const discountPct = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
  const images = product.images && product.images.length > 0 ? product.images : [product.thumbnail].filter(Boolean);
  const specs = product.specifications ? (product.specifications instanceof Map ? Object.fromEntries(product.specifications) : product.specifications) : {};

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 16px' }}>
      {/* Breadcrumb */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#555', marginBottom: '16px', flexWrap: 'wrap' }}>
        <Link to="/" style={{ color: '#007bff', textDecoration: 'none' }}>Home</Link>
        <FiChevronRight size={12} />
        <Link to={`/category/${product.category}`} style={{ color: '#007bff', textDecoration: 'none', textTransform: 'capitalize' }}>{product.category}</Link>
        <FiChevronRight size={12} />
        <span className="line-clamp-2" style={{ color: '#333' }}>{product.name}</span>
      </nav>

      <div className="section-card animate-fadeIn detail-container" style={{ padding: '28px' }}>
        <div className="detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>

          {/* ── Left: Images ────────────────────────────────────── */}
          <div>
            <div style={{ background: '#f8f9fa', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '420px', overflow: 'hidden', marginBottom: '12px', position: 'relative' }}>
              {discountPct > 0 && (
                <span className="discount-badge" style={{ position: 'absolute', top: '12px', left: '12px', fontSize: '13px', padding: '4px 10px' }}>-{discountPct}%</span>
              )}
              {images[selectedImage] ? (
                <img 
                  src={getOptimizedImage(images[selectedImage], 800)} 
                  alt={product.name} 
                  loading="lazy"
                  style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', transition: 'opacity 0.3s' }} 
                />
              ) : (
                <span style={{ fontSize: '80px' }}>{{ electronics: '💻', fashion: '👗', home: '🏠', beauty: '💄' }[product.category] || '📦'}</span>
              )}
            </div>
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    style={{
                      width: 64, height: 64, borderRadius: '8px', overflow: 'hidden',
                      border: `2px solid ${i === selectedImage ? 'var(--brand-orange)' : '#ddd'}`,
                      cursor: 'pointer', background: '#f8f9fa', padding: 0,
                      transition: 'border-color 0.2s',
                    }}
                  >
                    <img 
                      src={getOptimizedImage(img, 100)} 
                      alt="" 
                      loading="lazy"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Right: Info ────────────────────────────────────── */}
          <div>
            <p style={{ margin: '0 0 4px', fontSize: '14px', color: '#007bff', fontWeight: 600 }}>
              {product.brand || product.vendor?.name || 'ShopSphere'}
            </p>
            <h1 style={{ margin: '0 0 8px', fontSize: '24px', fontWeight: 700, lineHeight: 1.3, color: '#0f1111' }}>{product.name}</h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <StarRating rating={product.rating} count={product.numReviews} size={16} />
              <span style={{ fontSize: '13px', color: '#555' }}>|</span>
              <span style={{ fontSize: '13px', color: product.stock > 0 ? 'var(--brand-green)' : '#cc0c39', fontWeight: 600 }}>
                {product.stock > 0 ? (product.stock < 10 ? `Only ${product.stock} left!` : 'In Stock') : 'Out of Stock'}
              </span>
            </div>

            {/* Price */}
            <div style={{ background: '#fef9ee', borderRadius: '8px', padding: '16px', marginBottom: '20px', border: '1px solid #f0e6d0' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap' }}>
                {discountPct > 0 && <span style={{ color: '#cc0c39', fontSize: '20px', fontWeight: 600 }}>-{discountPct}%</span>}
                <span style={{ fontSize: '32px', fontWeight: 700, color: '#0f1111' }}>₹{product.price?.toLocaleString('en-IN')}</span>
              </div>
              {discountPct > 0 && product.originalPrice && (
                <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#565959' }}>
                  M.R.P.: <span className="price-original">₹{product.originalPrice?.toLocaleString('en-IN')}</span>
                  <span style={{ color: 'var(--brand-green)', fontWeight: 600, marginLeft: '8px' }}>
                    You save ₹{(product.originalPrice - product.price)?.toLocaleString('en-IN')}
                  </span>
                </p>
              )}
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#555' }}>Inclusive of all taxes</p>
            </div>

            {/* Delivery promises */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
              {[
                { icon: <FiTruck />, label: 'FREE Delivery', color: 'var(--brand-green)' },
                { icon: <FiRotateCcw />, label: '7-day Returns', color: '#007bff' },
                { icon: <FiShield />, label: 'Secure Payment', color: '#f90' },
              ].map(p => (
                <div key={p.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: p.color, fontWeight: 500 }}>
                  {p.icon} {p.label}
                </div>
              ))}
            </div>

            {/* Qty + Actions */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: 40, height: 44, background: '#f8f9fa', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiMinus size={16} /></button>
                <span style={{ width: 50, textAlign: 'center', fontWeight: 600, fontSize: '16px' }}>{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock || 99, q + 1))} style={{ width: 40, height: 44, background: '#f8f9fa', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiPlus size={16} /></button>
              </div>

              <button
                className="btn-primary"
                style={{ padding: '12px 32px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}
                onClick={() => addToCart(product, qty)}
                disabled={product.stock === 0}
              >
                <FiShoppingCart size={18} /> Add to Cart
              </button>

              <button
                onClick={() => { addToCart(product, qty); navigate('/cart'); }}
                style={{
                  background: '#ff6b35', color: '#fff', border: 'none', borderRadius: '6px',
                  padding: '12px 32px', fontSize: '16px', fontWeight: 600, cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                disabled={product.stock === 0}
                onMouseEnter={e => e.currentTarget.style.background = '#e55b25'}
                onMouseLeave={e => e.currentTarget.style.background = '#ff6b35'}
              >
                Buy Now
              </button>
            </div>

            {/* Wishlist + Share */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
              <button
                onClick={() => toggleWishlist(product)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  background: wishlisted ? '#fff0f0' : '#fff', border: `1px solid ${wishlisted ? '#e31c1c' : '#ddd'}`,
                  borderRadius: '6px', padding: '8px 16px', cursor: 'pointer', fontSize: '14px',
                  color: wishlisted ? '#e31c1c' : '#555', fontWeight: 500,
                  transition: 'all 0.2s',
                }}
              >
                <FiHeart size={16} fill={wishlisted ? '#e31c1c' : 'transparent'} color={wishlisted ? '#e31c1c' : '#666'} />
                {wishlisted ? 'Wishlisted' : 'Add to Wishlist'}
              </button>
              <button
                onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#fff', border: '1px solid #ddd', borderRadius: '6px', padding: '8px 16px', cursor: 'pointer', fontSize: '14px', color: '#555', fontWeight: 500 }}
              >
                <FiShare2 size={16} /> Share
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs: Description / Specs / Reviews ────────────── */}
      <div className="section-card" style={{ marginTop: '20px', padding: '0' }}>
        <div style={{ display: 'flex', borderBottom: '2px solid #eee' }}>
          {['description', 'specifications', 'reviews'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '16px 24px', background: 'transparent', border: 'none',
                borderBottom: `3px solid ${activeTab === tab ? 'var(--brand-orange)' : 'transparent'}`,
                cursor: 'pointer', fontSize: '15px', fontWeight: activeTab === tab ? 700 : 500,
                color: activeTab === tab ? '#0f1111' : '#666',
                textTransform: 'capitalize', transition: 'all 0.2s', marginBottom: '-2px',
              }}
            >
              {tab} {tab === 'reviews' && product.reviews ? `(${product.reviews.length})` : ''}
            </button>
          ))}
        </div>

        <div style={{ padding: '24px' }}>
          {activeTab === 'description' && (
            <div className="animate-fadeIn">
              <p style={{ fontSize: '15px', lineHeight: 1.8, color: '#333', maxWidth: '800px' }}>
                {product.description || 'No description available for this product.'}
              </p>
            </div>
          )}

          {activeTab === 'specifications' && (
            <div className="animate-fadeIn">
              {Object.keys(specs).length > 0 ? (
                <table style={{ width: '100%', maxWidth: '600px', borderCollapse: 'collapse' }}>
                  <tbody>
                    {Object.entries(specs).map(([key, val], i) => (
                      <tr key={key} style={{ background: i % 2 === 0 ? '#f8f9fa' : '#fff' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 600, fontSize: '14px', color: '#333', width: '40%', borderBottom: '1px solid #eee' }}>{key}</td>
                        <td style={{ padding: '12px 16px', fontSize: '14px', color: '#555', borderBottom: '1px solid #eee' }}>{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={{ color: '#888' }}>No specifications available.</p>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="animate-fadeIn">
              {product.reviews && product.reviews.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '700px' }}>
                  {product.reviews.map((r, i) => (
                    <div key={r._id || i} style={{ padding: '16px', background: '#f8f9fa', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--brand-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#111', fontSize: '14px' }}>
                          {r.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p style={{ margin: 0, fontWeight: 600, fontSize: '14px' }}>{r.name}</p>
                          <StarRating rating={r.rating} size={12} />
                        </div>
                        <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#888' }}>
                          {r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN') : ''}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '14px', color: '#333', lineHeight: 1.6 }}>{r.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <FiStar size={40} color="#ddd" />
                  <p style={{ color: '#888', marginTop: '12px' }}>No reviews yet. Be the first to review this product!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Related Products ──────────────────────────────── */}
      {relatedProducts.length > 0 && (
        <section style={{ marginTop: '32px', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '16px' }}>Related Products</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
            {relatedProducts.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
      )}
      <style>{`
        @media (max-width: 768px) {
          .detail-container { padding: 16px !important; }
          .detail-grid { grid-template-columns: 1fr !important; gap: 24px !important; }
          .detail-grid > div:first-child { height: auto !important; }
          .detail-grid img { max-height: 300px !important; }
        }
      `}</style>
    </main>
  );
}
