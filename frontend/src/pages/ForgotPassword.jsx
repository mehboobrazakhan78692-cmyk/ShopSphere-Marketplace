import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/auth/forgotpassword', { email });
      setSent(true);
      toast.success('Reset link sent to your email');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div className="section-card animate-fadeIn" style={{ width: '100%', maxWidth: '420px', padding: '40px', textAlign: 'center' }}>
          <FiCheckCircle size={60} color="#22c55e" style={{ marginBottom: '20px' }} />
          <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '12px' }}>Check Your Email</h1>
          <p style={{ color: '#666', lineHeight: 1.6, marginBottom: '24px' }}>
            We've sent a password reset link to <strong>{email}</strong>. Please check your inbox and follow the instructions.
          </p>
          <Link to="/login" className="btn-primary" style={{ display: 'block', textDecoration: 'none', padding: '12px' }}>
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="section-card animate-fadeIn" style={{ width: '100%', maxWidth: '420px', padding: '40px' }}>
        <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666', textDecoration: 'none', fontSize: '14px', marginBottom: '24px' }}>
          <FiArrowLeft /> Back to Login
        </Link>
        
        <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>Forgot Password?</h1>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '28px' }}>
          No worries! Enter your email address and we'll send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <FiMail style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@mail.com"
                style={{ width: '100%', padding: '12px 12px 12px 40px', border: '1px solid #ddd', borderRadius: '8px', outline: 'none', fontSize: '14px' }}
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '14px', fontSize: '16px', fontWeight: 700 }}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
      </div>
    </div>
  );
}
