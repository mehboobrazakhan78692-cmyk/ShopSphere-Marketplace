import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  FiSearch, FiShoppingCart, FiUser, FiMenu, FiX,
  FiPackage, FiHeart, FiLogOut, FiHome, FiGrid,
  FiPieChart, FiPlusSquare, FiSettings
} from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const CATEGORIES = [
  { label: 'Electronics',  value: 'electronics', icon: '💻' },
  { label: 'Fashion',      value: 'fashion',      icon: '👗' },
  { label: 'Home & Living',value: 'home',         icon: '🏠' },
  { label: 'Beauty',       value: 'beauty',       icon: '💄' },
];

const NAV_LINKS = [
  { label: "Today's Deals",     path: '/products' },
  { label: 'Electronics',       path: '/category/electronics' },
  { label: 'Fashion',           path: '/category/fashion' },
  { label: 'Home & Living',     path: '/category/home' },
  { label: 'Beauty',            path: '/category/beauty' },
];

export default function Header() {
  const { cartCount } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery]       = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [suggestions, setSuggestions]       = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef  = useRef(null);
  const accountRef = useRef(null);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setAccountMenuOpen(false);
    setShowSuggestions(false);
  }, [location.pathname]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setAccountMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  // Search suggestions debounced
  useEffect(() => {
    if (searchQuery.length < 2) { setSuggestions([]); return; }
    const timer = setTimeout(async () => {
      try {
        const { data } = await axios.get(`/api/products/suggestions?q=${encodeURIComponent(searchQuery)}`);
        setSuggestions(data.data || []);
        setShowSuggestions(true);
      } catch {
        // silently fail
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      setMobileMenuOpen(false);
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    setAccountMenuOpen(false);
    setMobileMenuOpen(false);
    await logout();
    navigate('/');
  };

  const searchBar = (isMobile = false) => (
    <div ref={isMobile ? null : searchRef} style={{ position: 'relative', flex: isMobile ? 1 : undefined, maxWidth: isMobile ? '100%' : '800px', width: isMobile ? '100%' : 'auto' }}>
      <form onSubmit={handleSearch} style={{ display: 'flex', borderRadius: '4px', overflow: 'hidden' }}>
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
          placeholder="Search ShopSphere.in"
          style={{ flex: 1, border: 'none', padding: isMobile ? '10px 12px' : '10px 16px', fontSize: '14px', outline: 'none', background: '#fff', color: '#111' }}
        />
        <button type="submit" style={{ background: 'var(--brand-orange)', border: 'none', padding: '0 16px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <FiSearch size={20} color="#333" />
        </button>
      </form>

      {/* Suggestions Dropdown */}
      {!isMobile && showSuggestions && suggestions.length > 0 && (
        <div className="animate-slideDown" style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', boxShadow: '0 8px 24px rgba(0,0,0,.18)', borderRadius: '0 0 6px 6px', zIndex: 1100, overflow: 'hidden' }}>
          {suggestions.map(s => (
            <div
              key={s._id}
              onClick={() => { setSearchQuery(s.name); setShowSuggestions(false); navigate(`/products?search=${encodeURIComponent(s.name)}`); }}
              style={{ padding: '10px 16px', cursor: 'pointer', borderBottom: '1px solid #f5f5f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              onMouseEnter={e => e.currentTarget.style.background = '#f7f8fa'}
              onMouseLeave={e => e.currentTarget.style.background = '#fff'}
            >
              <span style={{ fontSize: '14px', color: '#333' }}>{s.name}</span>
              <span style={{ fontSize: '11px', color: '#888', textTransform: 'capitalize' }}>{s.category}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      <header style={{ position: 'sticky', top: 0, zIndex: 1000, background: 'var(--brand-dark)' }}>
        {/* ── Main Header Row ── */}
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '12px', minHeight: '60px', padding: '8px 16px' }}>
          {/* Mobile Menu Toggle */}
          <button
            aria-label="Open navigation menu"
            onClick={() => setMobileMenuOpen(true)}
            style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: '4px', display: 'none' }}
            className="mobile-menu-btn"
          >
            <FiMenu size={24} />
          </button>

          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ lineHeight: 1 }}>
              <span style={{ fontSize: '22px', fontWeight: 800, color: '#fff' }}>
                Shop<span style={{ color: 'var(--brand-orange)' }}>Sphere</span>
              </span>
            </div>
          </Link>

          {/* Search Bar (Desktop) */}
          <div style={{ flex: 1, position: 'relative', maxWidth: '800px', margin: '0 12px' }} ref={searchRef} className="desktop-search">
            {searchBar(false)}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
            {/* Account Dropdown (Desktop) */}
            <div ref={accountRef} style={{ position: 'relative' }} className="desktop-account">
              <button
                onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: '4px 8px', textAlign: 'left', display: 'flex', flexDirection: 'column' }}
              >
                <span style={{ fontSize: '11px', color: '#ccc' }}>Hello, {user ? user.name?.split(' ')[0] : 'Sign in'}</span>
                <span style={{ fontSize: '13px', fontWeight: 700 }}>Account & Lists</span>
              </button>

              {accountMenuOpen && (
                <div className="animate-fadeIn" style={{ position: 'absolute', top: 'calc(100% + 4px)', right: 0, background: '#fff', color: '#333', minWidth: '220px', borderRadius: '6px', boxShadow: '0 8px 24px rgba(0,0,0,.18)', padding: '8px 0', zIndex: 1100 }}>
                  {user ? (
                    <>
                      <div style={{ padding: '12px 20px', borderBottom: '1px solid #eee' }}>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: '14px' }}>{user.name}</p>
                        <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#888' }}>{user.email}</p>
                      </div>
                      <Link to="/profile" className="dropdown-item">My Profile</Link>
                      <Link to="/orders" className="dropdown-item"><FiPackage size={14} style={{ marginRight: '8px' }} />My Orders</Link>
                      <Link to="/wishlist" className="dropdown-item"><FiHeart size={14} style={{ marginRight: '8px' }} />Wishlist</Link>
                      {user.role === 'admin' && <Link to="/admin" className="dropdown-item"><FiPieChart size={14} style={{ marginRight: '8px' }} />Admin Panel</Link>}
                      {user.role === 'vendor' && <Link to="/seller" className="dropdown-item"><FiGrid size={14} style={{ marginRight: '8px' }} />Seller Panel</Link>}
                      <div style={{ borderTop: '1px solid #eee', marginTop: '4px', paddingTop: '4px' }}>
                        <button onClick={handleLogout} className="dropdown-item" style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left', color: '#b12704', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FiLogOut size={14} /> Sign Out
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <Link to="/login" className="dropdown-item" style={{ fontWeight: 700 }}>Sign In</Link>
                      <div style={{ padding: '8px 20px', fontSize: '13px', color: '#555' }}>
                        New customer? <Link to="/register" style={{ color: '#007185', textDecoration: 'none' }}>Start here</Link>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Cart */}
            <Link to="/cart" style={{ textDecoration: 'none', color: '#fff', display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', position: 'relative' }}>
              <div style={{ position: 'relative' }}>
                <FiShoppingCart size={24} />
                {cartCount > 0 && (
                  <span className="badge-orange" style={{ position: 'absolute', top: '-8px', right: '-8px' }}>
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </div>
              <span style={{ fontSize: '13px', fontWeight: 700 }} className="desktop-cart-label">Cart</span>
            </Link>

            {/* Mobile: User icon */}
            {!user ? (
              <Link to="/login" style={{ color: '#fff', display: 'none', padding: '4px 8px' }} className="mobile-user-btn">
                <FiUser size={22} />
              </Link>
            ) : null}
          </div>
        </div>

        {/* ── Mobile Search Row ── */}
        <div className="mobile-search-row" style={{ padding: '0 16px 10px', display: 'none' }}>
          {searchBar(true)}
        </div>

        {/* ── Desktop Sub-Nav ── */}
        <nav className="desktop-subnav" style={{ background: 'var(--brand-nav)', padding: '0 16px', minHeight: '40px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            onClick={() => setMobileMenuOpen(true)}
            style={{ background: 'transparent', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 12px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
          >
            <FiMenu size={18} /> All
          </button>
          {NAV_LINKS.map(link => (
            <Link
              key={link.path}
              to={link.path}
              style={{
                color: '#fff', textDecoration: 'none', fontSize: '13px', padding: '8px 12px',
                borderRadius: '2px', transition: 'background 0.15s',
                background: location.pathname === link.path ? 'rgba(255,255,255,0.1)' : 'transparent',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = location.pathname === link.path ? 'rgba(255,255,255,0.1)' : 'transparent'}
            >
              {link.label}
            </Link>
          ))}
          <Link to="/seller" style={{ color: 'var(--brand-orange)', textDecoration: 'none', fontSize: '13px', padding: '8px 12px', fontWeight: 600, marginLeft: 'auto' }}>
            Sell on ShopSphere
          </Link>
        </nav>
      </header>

      {/* ── Mobile Slide-In Menu Overlay ── */}
      {mobileMenuOpen && (
        <div className="mobile-nav-overlay" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* ── Mobile Slide-In Menu ── */}
      <div className="mobile-nav-menu" style={{ transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)' }}>
        {/* Header */}
        <div style={{ background: 'var(--brand-orange)', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            {user ? (
              <>
                <p style={{ margin: 0, fontWeight: 700, color: '#111', fontSize: '15px' }}>Hello, {user.name?.split(' ')[0]}</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#333' }}>{user.role}</p>
              </>
            ) : (
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} style={{ color: '#111', fontWeight: 700, textDecoration: 'none', fontSize: '15px' }}>
                Sign In / Register
              </Link>
            )}
          </div>
          <button onClick={() => setMobileMenuOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#111' }}>
            <FiX size={24} />
          </button>
        </div>

        {/* Nav Items */}
        <div style={{ padding: '12px 0' }}>
          <p style={{ padding: '8px 20px', margin: 0, fontSize: '12px', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Shop by Category</p>
          {CATEGORIES.map(cat => (
            <Link
              key={cat.value}
              to={`/category/${cat.value}`}
              onClick={() => setMobileMenuOpen(false)}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', color: '#fff', textDecoration: 'none', fontSize: '14px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span>{cat.icon}</span> {cat.label}
            </Link>
          ))}

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '8px', paddingTop: '8px' }}>
            <p style={{ padding: '8px 20px', margin: 0, fontSize: '12px', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Quick Links</p>
            <Link to="/products" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', color: '#fff', textDecoration: 'none', fontSize: '14px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <FiHome size={16} /> Today's Deals
            </Link>
            {user && <>
              <Link to="/orders" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', color: '#fff', textDecoration: 'none', fontSize: '14px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <FiPackage size={16} /> My Orders
              </Link>
              <Link to="/wishlist" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', color: '#fff', textDecoration: 'none', fontSize: '14px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <FiHeart size={16} /> Wishlist
              </Link>
              <Link to="/profile" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', color: '#fff', textDecoration: 'none', fontSize: '14px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <FiSettings size={16} /> My Profile
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', color: 'var(--brand-orange)', textDecoration: 'none', fontSize: '14px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <FiPieChart size={16} /> Admin Panel
                </Link>
              )}
              {user.role === 'vendor' && (
                <Link to="/seller" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', color: 'var(--brand-orange)', textDecoration: 'none', fontSize: '14px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <FiGrid size={16} /> Seller Panel
                </Link>
              )}
              <button
                onClick={handleLogout}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', color: '#f87171', background: 'none', border: 'none', width: '100%', textAlign: 'left', fontSize: '14px', cursor: 'pointer' }}
              >
                <FiLogOut size={16} /> Sign Out
              </button>
            </>}
            {!user && (
              <Link to="/seller" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', color: 'var(--brand-orange)', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>
                <FiPlusSquare size={16} /> Sell on ShopSphere
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Inline responsive styles */}
      <style>{`
        .dropdown-item {
          display: flex;
          align-items: center;
          padding: 10px 20px;
          color: #333;
          text-decoration: none;
          font-size: 14px;
          transition: background 0.15s;
        }
        .dropdown-item:hover { background: #f0f2f2; }

        .desktop-account { display: flex; }
        .desktop-search  { display: flex; flex: 1; }
        .desktop-subnav  { display: flex; }
        .desktop-cart-label { display: inline; }
        .mobile-search-row { display: none; }
        .mobile-menu-btn  { display: none; }
        .mobile-user-btn  { display: none; }

        @media (max-width: 768px) {
          .desktop-account    { display: none !important; }
          .desktop-search     { display: none !important; }
          .desktop-subnav     { display: none !important; }
          .desktop-cart-label { display: none !important; }
          .mobile-search-row  { display: flex !important; }
          .mobile-menu-btn    { display: flex !important; }
          .mobile-user-btn    { display: flex !important; }
        }
      `}</style>
    </>
  );
}
