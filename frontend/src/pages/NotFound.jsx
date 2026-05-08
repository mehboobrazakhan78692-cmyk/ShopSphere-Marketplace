import { Link, useNavigate } from 'react-router-dom';
import { FiHome, FiSearch, FiArrowLeft, FiShoppingBag } from 'react-icons/fi';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <main style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 200px)', padding: '40px 16px', background: 'var(--bg-light)' }}>
      <div className="animate-fadeIn" style={{ textAlign: 'center', maxWidth: '480px' }}>
        {/* 404 visual */}
        <div style={{ fontSize: '120px', fontWeight: 900, color: 'var(--brand-orange)', lineHeight: 1, marginBottom: '8px', letterSpacing: '-4px' }}>
          404
        </div>
        <div style={{ fontSize: '40px', marginBottom: '16px' }}>😕</div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 12px', color: '#1a202c' }}>
          Page Not Found
        </h1>
        <p style={{ color: '#718096', fontSize: '15px', lineHeight: 1.7, margin: '0 0 32px' }}>
          Oops! The page you're looking for doesn't exist, has been moved, or was temporarily unavailable.
        </p>

        {/* Action buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
          <Link
            to="/"
            className="btn-primary"
            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 32px', fontSize: '16px', fontWeight: 600 }}
          >
            <FiHome size={18} /> Back to Home
          </Link>
          <button
            onClick={() => navigate(-1)}
            className="btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 28px', fontSize: '15px' }}
          >
            <FiArrowLeft size={16} /> Go Back
          </button>
        </div>

        {/* Quick links */}
        <div style={{ marginTop: '40px', padding: '24px', background: '#fff', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,.08)' }}>
          <p style={{ fontSize: '14px', fontWeight: 600, color: '#555', marginBottom: '16px' }}>Popular pages:</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            {[
              { icon: <FiShoppingBag size={14} />, label: 'All Products', path: '/products' },
              { icon: <FiSearch size={14} />,      label: 'Search',       path: '/products' },
              { icon: <FiShoppingBag size={14} />, label: 'Electronics',  path: '/category/electronics' },
              { icon: <FiShoppingBag size={14} />, label: 'Fashion',      path: '/category/fashion' },
            ].map(l => (
              <Link
                key={l.label}
                to={l.path}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--brand-blue)', textDecoration: 'none', fontSize: '14px', fontWeight: 500, padding: '6px 12px', borderRadius: '50px', background: '#f0f9ff', transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#e0f2fe'}
                onMouseLeave={e => e.currentTarget.style.background = '#f0f9ff'}
              >
                {l.icon} {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
