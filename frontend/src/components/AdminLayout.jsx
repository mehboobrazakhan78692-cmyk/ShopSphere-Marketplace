import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  FiBox, FiUsers, FiShoppingBag, FiPieChart, 
  FiSettings, FiLogOut, FiMenu, FiX, FiHome 
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { label: 'Dashboard', icon: <FiPieChart />, path: '/admin' },
    { label: 'Products',  icon: <FiBox />,      path: '/admin/products' },
    { label: 'Orders',    icon: <FiShoppingBag />, path: '/admin/orders' },
    { label: 'Users',     icon: <FiUsers />,    path: '/admin/users' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f7f6' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: sidebarOpen ? '260px' : '80px',
          background: '#1a1c23',
          color: '#fff',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          height: '100vh',
          zIndex: 1001,
        }}
      >
        <div style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: sidebarOpen ? 'space-between' : 'center' }}>
          {sidebarOpen && (
            <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--brand-orange)' }}>
              Admin<span style={{ color: '#fff' }}>Panel</span>
            </span>
          )}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '20px' }}
          >
            {sidebarOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>

        <nav style={{ flex: 1, padding: '20px 12px' }}>
          {menuItems.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                color: location.pathname === item.path ? 'var(--brand-orange)' : '#a0aec0',
                textDecoration: 'none',
                borderRadius: '8px',
                marginBottom: '8px',
                background: location.pathname === item.path ? 'rgba(255, 153, 0, 0.1)' : 'transparent',
                transition: 'all 0.2s',
                justifyContent: sidebarOpen ? 'flex-start' : 'center',
              }}
              onMouseEnter={(e) => {
                if (location.pathname !== item.path) {
                  e.currentTarget.style.color = '#fff';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (location.pathname !== item.path) {
                  e.currentTarget.style.color = '#a0aec0';
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <span style={{ fontSize: '20px' }}>{item.icon}</span>
              {sidebarOpen && <span style={{ fontWeight: 500 }}>{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div style={{ padding: '20px 12px', borderTop: '1px solid #2d3748' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              color: '#a0aec0',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '8px',
              justifyContent: sidebarOpen ? 'flex-start' : 'center',
            }}
          >
            <FiHome style={{ fontSize: '20px' }} />
            {sidebarOpen && <span>Main Store</span>}
          </button>
          <button
            onClick={logout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              color: '#f56565',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '8px',
              justifyContent: sidebarOpen ? 'flex-start' : 'center',
            }}
          >
            <FiLogOut style={{ fontSize: '20px' }} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main 
        style={{ 
          flex: 1, 
          marginLeft: sidebarOpen ? '260px' : '80px', 
          transition: 'margin 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          padding: '40px' 
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <div>
              <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#1a202c', margin: 0 }}>
                {menuItems.find(i => i.path === location.pathname)?.label || 'Admin Panel'}
              </h2>
              <p style={{ color: '#718096', margin: '4px 0 0' }}>Welcome back, {user?.name}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '14px' }}>{user?.name}</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#718096' }}>{user?.role}</p>
              </div>
              <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'var(--brand-orange)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                {user?.name.charAt(0).toUpperCase()}
              </div>
            </div>
          </header>

          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
