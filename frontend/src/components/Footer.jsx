import { Link } from 'react-router-dom';
import {
  FiFacebook, FiTwitter, FiInstagram, FiYoutube,
  FiMail, FiPhone, FiMapPin
} from 'react-icons/fi';

const FOOTER_LINKS = {
  'Get to Know Us': [
    { label: 'About ShopSphere', path: '/' },
    { label: 'Careers',          path: '/' },
    { label: 'Press Releases',   path: '/' },
    { label: 'Investor Relations', path: '/' },
  ],
  'Sell with Us': [
    { label: 'Sell on ShopSphere', path: '/seller' },
    { label: 'Vendor Dashboard',   path: '/seller' },
    { label: 'Advertise Products', path: '/seller' },
    { label: 'Become an Affiliate', path: '/seller' },
  ],
  'Let Us Help You': [
    { label: 'Your Account',        path: '/orders' },
    { label: 'Your Orders',         path: '/orders' },
    { label: 'Track Package',       path: '/orders' },
    { label: 'Returns & Replacements', path: '/orders' },
    { label: 'Help & Customer Care', path: '/' },
  ],
  'Shop by Category': [
    { label: 'Electronics', path: '/category/electronics' },
    { label: 'Fashion',     path: '/category/fashion' },
    { label: 'Home & Living', path: '/category/home' },
    { label: 'Beauty',      path: '/category/beauty' },
  ],
};

const PAYMENT_METHODS = ['💳 Visa', '💳 Mastercard', 'UPI', '🏦 Net Banking', '📦 COD'];

export default function Footer() {
  return (
    <footer>
      {/* ── Back to Top ─────────────────────────────────────────────── */}
      <div
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        style={{
          background: '#37475a',
          color: '#fff',
          textAlign: 'center',
          padding: '14px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 500,
          transition: 'background 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#485769'}
        onMouseLeave={e => e.currentTarget.style.background = '#37475a'}
      >
        ↑ Back to top
      </div>

      {/* ── Main Footer Links ────────────────────────────────────────── */}
      <div style={{ background: 'var(--brand-nav)', padding: '40px 40px 20px', color: '#fff' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '32px',
            marginBottom: '32px',
          }}
        >
          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section}>
              <h3
                style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  marginBottom: '12px',
                  color: '#fff',
                }}
              >
                {section}
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.path}
                      style={{
                        color: '#ddd',
                        textDecoration: 'none',
                        fontSize: '14px',
                        transition: 'color 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                      onMouseLeave={e => e.currentTarget.style.color = '#ddd'}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact & Social */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '24px',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid #456',
            paddingTop: '24px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#ddd' }}>
              <FiPhone size={14} /> +91 1800-000-0000 (Toll Free)
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#ddd' }}>
              <FiMail size={14} /> support@shopsphere.in
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#ddd' }}>
              <FiMapPin size={14} /> Mumbai, Maharashtra, India 400001
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            {[
              { icon: <FiFacebook size={20} />, color: '#1877f2' },
              { icon: <FiTwitter size={20} />,  color: '#1da1f2' },
              { icon: <FiInstagram size={20} />, color: '#e4405f' },
              { icon: <FiYoutube size={20} />,  color: '#ff0000' },
            ].map((s, i) => (
              <button
                key={i}
                style={{
                  width: 38, height: 38, borderRadius: '50%',
                  background: '#456', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = s.color; e.currentTarget.style.transform = 'scale(1.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#456'; e.currentTarget.style.transform = 'scale(1)'; }}
              >
                {s.icon}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom Bar ──────────────────────────────────────────────── */}
      <div style={{ background: 'var(--brand-dark)', padding: '20px 40px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '20px', fontWeight: 800, color: '#fff' }}>
            Shop<span style={{ color: 'var(--brand-orange)' }}>Sphere</span>
          </span>
          <span style={{ color: '#999', fontSize: '12px', marginLeft: '6px' }}>.in</span>
        </div>

        {/* Payment methods */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
          {PAYMENT_METHODS.map((m) => (
            <span
              key={m}
              style={{
                background: '#fff',
                color: '#333',
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 500,
              }}
            >
              {m}
            </span>
          ))}
        </div>

        {/* Copyright */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {['Conditions of Use', 'Privacy Notice', 'Cookie Notice', 'Interest-Based Ads'].map((item) => (
            <Link
              key={item}
              to="/"
              style={{ color: '#ddd', textDecoration: 'none', fontSize: '12px' }}
            >
              {item}
            </Link>
          ))}
        </div>
        <p style={{ textAlign: 'center', color: '#999', fontSize: '12px', marginTop: '8px' }}>
          © {new Date().getFullYear()} ShopSphere.in — India's Multi-Vendor Marketplace. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
