import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight, FiArrowRight, FiZap, FiTruck, FiShield, FiHeadphones } from 'react-icons/fi';
import axios from 'axios';
import ProductCard from '../components/ProductCard';

// ─── Mock data (shown when MongoDB is empty / API unavailable) ─────────────
const MOCK_PRODUCTS = [
  { id: '1', _id: '1', name: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones', price: 24990, originalPrice: 34990, category: 'electronics', brand: 'Sony', rating: 4.8, numReviews: 12450, stock: 8, thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop' },
  { id: '2', _id: '2', name: 'Samsung Galaxy S24 Ultra 256GB Titanium Black', price: 129999, originalPrice: 134999, category: 'electronics', brand: 'Samsung', rating: 4.7, numReviews: 8930, stock: 15, thumbnail: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=300&h=300&fit=crop' },
  { id: '3', _id: '3', name: 'Apple MacBook Air M3 Chip 15-inch Laptop', price: 134900, originalPrice: 149900, category: 'electronics', brand: 'Apple', rating: 4.9, numReviews: 5670, stock: 5, thumbnail: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=300&fit=crop' },
  { id: '4', _id: '4', name: 'Men\'s Premium Casual Cotton Shirt - Pack of 3', price: 1299, originalPrice: 2499, category: 'fashion', brand: 'FashionHub', rating: 4.2, numReviews: 3210, stock: 50, thumbnail: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=300&h=300&fit=crop' },
  { id: '5', _id: '5', name: 'Minimalist Nordic Coffee Table - White & Walnut', price: 8999, originalPrice: 14999, category: 'home', brand: 'HomeStyle', rating: 4.5, numReviews: 892, stock: 12, thumbnail: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&h=300&fit=crop' },
  { id: '6', _id: '6', name: 'L\'Oréal Paris Revitalift Face Serum 30ml', price: 649, originalPrice: 999, category: 'beauty', brand: "L'Oréal", rating: 4.4, numReviews: 6780, stock: 100, thumbnail: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=300&h=300&fit=crop' },
  { id: '7', _id: '7', name: 'boAt Airdopes 141 Bluetooth Truly Wireless Earbuds', price: 1299, originalPrice: 2990, category: 'electronics', brand: 'boAt', rating: 4.3, numReviews: 45670, stock: 200, thumbnail: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=300&h=300&fit=crop' },
  { id: '8', _id: '8', name: 'Women\'s Floral Printed Anarkali Kurta', price: 899, originalPrice: 1999, category: 'fashion', brand: 'Myntra', rating: 4.1, numReviews: 2340, stock: 35, thumbnail: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&h=300&fit=crop' },
];

const CATEGORIES = [
  { label: 'Electronics', value: 'electronics', icon: '💻', color: '#667eea', bg: 'linear-gradient(135deg, #667eea22, #764ba222)' },
  { label: 'Fashion',     value: 'fashion',     icon: '👗', color: '#f093fb', bg: 'linear-gradient(135deg, #f093fb22, #f5576c22)' },
  { label: 'Home & Living', value: 'home',      icon: '🏠', color: '#4facfe', bg: 'linear-gradient(135deg, #4facfe22, #00f2fe22)' },
  { label: 'Beauty',      value: 'beauty',      icon: '💄', color: '#43e97b', bg: 'linear-gradient(135deg, #43e97b22, #38f9d722)' },
];

const HERO_SLIDES = [
  {
    id: 1,
    title: 'India\'s Biggest Sale',
    subtitle: 'Up to 80% off on Electronics',
    cta: 'Shop Now',
    path: '/category/electronics',
    bg: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)',
    accent: '#f90',
    emoji: '🔥',
    badge: 'GREAT INDIAN SALE',
  },
  {
    id: 2,
    title: 'Fashion Forward',
    subtitle: 'Trending styles starting ₹299',
    cta: 'Explore Now',
    path: '/category/fashion',
    bg: 'linear-gradient(135deg, #3f0d12, #a71d31, #e84393)',
    accent: '#fff',
    emoji: '✨',
    badge: 'NEW ARRIVALS',
  },
  {
    id: 3,
    title: 'Transform Your Home',
    subtitle: 'Premium home decor at best prices',
    cta: 'Discover More',
    path: '/category/home',
    bg: 'linear-gradient(135deg, #0d324d, #7f5a83, #a64ac9)',
    accent: '#f90',
    emoji: '🏡',
    badge: 'HOME REFRESH',
  },
];

const FEATURES = [
  { icon: <FiTruck />,       title: 'Free Delivery',    desc: 'On orders above ₹499', color: '#f90' },
  { icon: <FiShield />,      title: 'Secure Payments',  desc: '100% safe transactions', color: '#28a745' },
  { icon: <FiZap />,         title: 'Lightning Fast',   desc: 'Same-day delivery available', color: '#007bff' },
  { icon: <FiHeadphones />,  title: '24/7 Support',     desc: 'Always here to help', color: '#dc3545' },
];

export default function Home() {
  const navigate = useNavigate();
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [activeSlide, setActiveSlide] = useState(0);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef(null);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get('/api/products?limit=8&sort=latest');
        if (data.data && data.data.length > 0) {
          setProducts(data.data);
        }
      } catch {
        // Use mock data
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Auto-rotate hero
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 4500);
    return () => clearInterval(intervalRef.current);
  }, []);

  const goSlide = (dir) => {
    clearInterval(intervalRef.current);
    setActiveSlide((prev) => (prev + dir + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  const slide = HERO_SLIDES[activeSlide];

  return (
    <main className="container animate-fadeIn">
      {/* ── Hero Banner ─────────────────────────────────────────────── */}
      <section
        style={{
          marginTop: '16px',
          borderRadius: '12px',
          overflow: 'hidden',
          position: 'relative',
          height: '420px',
          background: slide.bg,
          display: 'flex',
          alignItems: 'center',
          padding: '24px',
          transition: 'background 0.5s ease',
        }}
        className="hero-banner"
      >
        <div className="hero-content animate-fadeIn" key={activeSlide} style={{ maxWidth: '600px', zIndex: 2 }}>
          <span style={{
            background: slide.accent,
            color: slide.accent === '#fff' ? '#333' : '#111',
            fontSize: '11px', fontWeight: 800, padding: '4px 12px',
            borderRadius: '50px', letterSpacing: '2px', marginBottom: '16px',
            display: 'inline-block',
          }}>
            {slide.badge}
          </span>

          <h1 style={{ color: '#fff', fontSize: 'clamp(24px, 5vw, 48px)', fontWeight: 800, margin: '12px 0 8px', lineHeight: 1.1 }}>
            {slide.emoji} {slide.title}
          </h1>
          <p style={{ color: 'rgba(255,255,255,.9)', fontSize: 'clamp(14px, 2vw, 20px)', marginBottom: '28px' }}>
            {slide.subtitle}
          </p>
          <button
            onClick={() => navigate(slide.path)}
            className="btn-primary"
            style={{ 
              padding: '12px 32px', fontSize: '16px', 
              boxShadow: `0 4px 20px ${slide.accent}44`,
            }}
          >
            {slide.cta} <FiArrowRight size={18} style={{ marginLeft: '8px', verticalAlign: 'middle' }} />
          </button>
        </div>

        {/* Slide Controls */}
        <div className="hero-controls">
          {[-1, 1].map((dir) => (
            <button
              key={dir}
              onClick={() => goSlide(dir)}
              style={{
                position: 'absolute',
                [dir === -1 ? 'left' : 'right']: '16px',
                top: '50%', transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,.15)',
                border: '1px solid rgba(255,255,255,.3)',
                borderRadius: '50%', width: 44, height: 44,
                cursor: 'pointer', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backdropFilter: 'blur(4px)',
                zIndex: 10,
              }}
            >
              {dir === -1 ? <FiChevronLeft size={22} /> : <FiChevronRight size={22} />}
            </button>
          ))}
        </div>
      </section>

      {/* ── Features Bar ─────────────────────────────────────────────── */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '16px',
          marginTop: '20px',
        }}
      >
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="section-card"
            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px' }}
          >
            <div style={{ fontSize: '20px', color: f.color }}>{f.icon}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '13px' }}>{f.title}</div>
              <div style={{ color: '#666', fontSize: '11px' }}>{f.desc}</div>
            </div>
          </div>
        ))}
      </section>

      {/* ── Featured Products ────────────────────────────────────────── */}
      <section style={{ marginTop: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>Recommended for You</h2>
          <Link to="/products" style={{ color: 'var(--brand-blue)', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>
            See more
          </Link>
        </div>

        <div className="grid-auto-fill">
          {loading ? (
            Array(8).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: '320px' }} />)
          ) : (
            products.map((p) => <ProductCard key={p._id || p.id} product={p} />)
          )}
        </div>
      </section>

      {/* ── Categories ───────────────────────────────────────────────── */}
      <section style={{ marginTop: '32px' }}>
        <h2 style={{ marginBottom: '16px', fontSize: '20px', fontWeight: 700 }}>Categories to Explore</h2>
        <div className="grid-auto-fill">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.value}
              to={`/category/${cat.value}`}
              className="section-card"
              style={{ textDecoration: 'none', textAlign: 'center', transition: 'transform 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'none'}
            >
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>{cat.icon}</div>
              <div style={{ fontWeight: 600, color: '#111' }}>{cat.label}</div>
            </Link>
          ))}
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) {
          .hero-banner { height: 300px !important; padding: 20px !important; }
          .hero-controls { display: none; }
          .section-card { border-radius: 8px !important; margin: 0 4px; }
        }
      `}</style>
    </main>
  );
}
