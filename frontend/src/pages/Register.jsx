import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    const result = await register(form.name, form.email, form.password);
    if (result.success) { toast.success('Account created! Welcome to ShopSphere!'); navigate('/'); }
    else toast.error(result.message);
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="section-card animate-fadeIn" style={{ width: '100%', maxWidth: '440px', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 800 }}>Shop<span style={{ color: 'var(--brand-orange)' }}>Sphere</span></h2>
          </Link>
          <h1 style={{ fontSize: '22px', fontWeight: 700, margin: '8px 0 4px' }}>Create Account</h1>
          <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>Join India's fastest-growing marketplace!</p>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {[
            { key: 'name', label: 'Full Name', type: 'text', icon: <FiUser /> },
            { key: 'email', label: 'Email', type: 'email', icon: <FiMail /> },
          ].map((field) => (
            <div key={field.key}>
              <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>{field.label}</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#888' }}>{field.icon}</span>
                <input type={field.type} value={form[field.key]} onChange={(e) => setForm({ ...form, [field.key]: e.target.value })} required style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} onFocus={e => e.currentTarget.style.borderColor = 'var(--brand-orange)'} onBlur={e => e.currentTarget.style.borderColor = '#ddd'} />
              </div>
            </div>
          ))}
          {['password', 'confirmPassword'].map((key) => (
            <div key={key}>
              <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>{key === 'password' ? 'Password' : 'Confirm Password'}</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#888' }}><FiLock /></span>
                <input type={showPw ? 'text' : 'password'} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} required style={{ width: '100%', padding: '10px 36px 10px 36px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} onFocus={e => e.currentTarget.style.borderColor = 'var(--brand-orange)'} onBlur={e => e.currentTarget.style.borderColor = '#ddd'} />
                {key === 'password' && <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}>{showPw ? <FiEyeOff /> : <FiEye />}</button>}
              </div>
            </div>
          ))}
          <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '12px', fontSize: '15px', width: '100%', marginTop: '4px' }}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#007bff', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
