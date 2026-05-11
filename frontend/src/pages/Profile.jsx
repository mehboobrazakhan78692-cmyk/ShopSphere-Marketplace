import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiUser, FiMail, FiPhone, FiEdit2, FiSave, FiX, FiPackage, FiHeart, FiShield, FiLogOut, FiPlusSquare } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, logout, becomeVendor } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [vendorLoading, setVendorLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });

  useEffect(() => {
    if (user) {
      setForm({ name: user.name || '', email: user.email || '', phone: user.phone || '' });
    }
  }, [user]);

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <FiUser size={64} color="#ddd" style={{ marginBottom: '16px' }} />
        <h2 style={{ marginBottom: '12px' }}>Sign in to view your profile</h2>
        <Link to="/login" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block', padding: '12px 32px' }}>Sign In</Link>
      </div>
    );
  }

  const handleSave = async () => {
    setLoading(true);
    try {
      await axios.put('/api/auth/profile', form, {
        headers: { 'X-ShopSphere-CSRF': 'shopsphere_v1' }
      });
      toast.success('Profile updated!');
      setEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleBecomeVendor = async () => {
    if (!window.confirm('Do you want to become a seller on ShopSphere?')) return;
    setVendorLoading(true);
    const res = await becomeVendor();
    setVendorLoading(false);
    if (res.success) toast.success('Congratulations! You are now a seller.');
    else toast.error(res.message);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const avatar = user.name ? user.name.charAt(0).toUpperCase() : 'U';
  const roleColors = { admin: '#7c3aed', vendor: '#0284c7', customer: '#059669', user: '#059669' };
  const roleColor = roleColors[user.role] || roleColors.user;

  const QUICK_LINKS = [
    { icon: <FiPackage size={22} />, label: 'My Orders', path: '/orders', color: '#ed8936' },
    { icon: <FiHeart size={22} />,   label: 'Wishlist',  path: '/wishlist', color: '#e4405f' },
    ...(user.role === 'vendor' ? [{ icon: <FiShield size={22} />, label: 'Seller Dashboard', path: '/seller', color: '#0284c7' }] : []),
    ...(user.role === 'admin'  ? [{ icon: <FiShield size={22} />, label: 'Admin Panel',       path: '/admin',  color: '#7c3aed' }] : []),
  ];

  return (
    <main className="container animate-fadeIn" style={{ padding: '32px 16px', maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '24px' }}>My Account</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px', alignItems: 'start' }}>
        {/* ── Profile Card ── */}
        <div className="section-card" style={{ padding: '32px' }}>
          {/* Avatar + name row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '28px' }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: `linear-gradient(135deg, ${roleColor}, ${roleColor}99)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '32px', fontWeight: 800, color: '#fff',
              flexShrink: 0, boxShadow: `0 4px 16px ${roleColor}44`
            }}>
              {avatar}
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 700 }}>{user.name}</h2>
              <p style={{ margin: '4px 0 0', fontSize: '13px' }}>
                <span style={{ background: roleColor + '22', color: roleColor, padding: '2px 10px', borderRadius: '50px', fontWeight: 600, fontSize: '12px', textTransform: 'capitalize' }}>
                  {user.role}
                </span>
              </p>
            </div>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', background: '#f8f9fa', border: '1px solid #ddd', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}
              >
                <FiEdit2 size={14} /> Edit
              </button>
            )}
          </div>

          {/* Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { label: 'Full Name', key: 'name', icon: <FiUser size={16} />, type: 'text' },
              { label: 'Email Address', key: 'email', icon: <FiMail size={16} />, type: 'email' },
              { label: 'Phone Number', key: 'phone', icon: <FiPhone size={16} />, type: 'tel' },
            ].map(field => (
              <div key={field.key}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#555', marginBottom: '6px' }}>{field.label}</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', border: '1px solid', borderColor: editing ? '#f90' : '#e2e8f0', borderRadius: '8px', background: editing ? '#fffdf0' : '#f8f9fa', transition: 'all 0.2s' }}>
                  <span style={{ color: '#888', flexShrink: 0 }}>{field.icon}</span>
                  {editing ? (
                    <input
                      type={field.type}
                      value={form[field.key]}
                      onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                      style={{ flex: 1, border: 'none', background: 'transparent', fontSize: '14px', outline: 'none', color: '#111', fontFamily: 'inherit' }}
                    />
                  ) : (
                    <span style={{ fontSize: '14px', color: form[field.key] ? '#111' : '#aaa' }}>
                      {form[field.key] || `No ${field.label.toLowerCase()} set`}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {editing && (
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button
                  className="btn-primary"
                  onClick={handleSave}
                  disabled={loading}
                  style={{ flex: 1, padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <FiSave size={16} /> {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => { setEditing(false); setForm({ name: user.name || '', email: user.email || '', phone: user.phone || '' }); }}
                  style={{ flex: 1, padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <FiX size={16} /> Cancel
                </button>
              </div>
            )}
          </div>

          {/* Joined date */}
          {user.createdAt && (
            <p style={{ fontSize: '12px', color: '#aaa', marginTop: '20px', marginBottom: 0 }}>
              Member since {new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })}
            </p>
          )}
        </div>

        {/* ── Quick Links Sidebar ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {QUICK_LINKS.map(link => (
            <Link
              key={link.path}
              to={link.path}
              style={{ textDecoration: 'none' }}
            >
              <div
                className="section-card"
                style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', border: '1px solid #e2e8f0', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
              >
                <div style={{ width: 48, height: 48, borderRadius: '12px', background: link.color + '18', color: link.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {link.icon}
                </div>
                <span style={{ fontWeight: 600, fontSize: '15px', color: '#1e293b' }}>{link.label}</span>
              </div>
            </Link>
          ))}

          {/* Become a Vendor for Customers */}
          {user.role === 'customer' && (
            <div
              className="section-card"
              onClick={handleBecomeVendor}
              style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', border: '1px solid #f90', background: '#fff9f0', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
            >
              <div style={{ width: 48, height: 48, borderRadius: '12px', background: '#f902', color: '#f90', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FiPlusSquare size={22} />
              </div>
              <div>
                <span style={{ fontWeight: 600, fontSize: '15px', color: '#1e293b', display: 'block' }}>Become a Seller</span>
                <span style={{ fontSize: '12px', color: '#888' }}>Sell products on ShopSphere</span>
              </div>
            </div>
          )}

          {/* Sign Out */}
          <div
            className="section-card"
            onClick={handleLogout}
            style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', border: '1px solid #fee2e2', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#fff5f5'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.transform = ''; }}
          >
            <div style={{ width: 48, height: 48, borderRadius: '12px', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <FiLogOut size={22} />
            </div>
            <span style={{ fontWeight: 600, fontSize: '15px', color: '#dc2626' }}>Sign Out</span>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .profile-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
}
