import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  FiBox, FiPlusSquare, FiShoppingBag, FiBarChart2, 
  FiSettings, FiLogOut, FiMenu, FiX, FiHome 
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const VendorLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { label: 'Seller Dashboard', icon: <FiBarChart2 />, path: '/seller' },
    { label: 'My Products',     icon: <FiBox />,        path: '/seller/products' },
    { label: 'Add New Product', icon: <FiPlusSquare />, path: '/seller/add-product' },
    { label: 'Seller Orders',   icon: <FiShoppingBag />, path: '/seller/orders' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: sidebarOpen ? '260px' : '80px',
          background: '#0f172a',
          color: '#fff',
          transition: 'width 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          height: '100vh',
          zIndex: 1001,
          boxShadow: '4px 0 10px rgba(0,0,0,0.1)',
        }}
      >
        <div style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: sidebarOpen ? 'space-between' : 'center' }}>
          {sidebarOpen && (
            <span style={{ fontSize: '18px', fontWeight: 800, color: '#38bdf8' }}>
              Seller<span style={{ color: '#fff' }}>Central</span>
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
                color: location.pathname === item.path ? '#38bdf8' : '#94a3b8',
                textDecoration: 'none',
                borderRadius: '8px',
                marginBottom: '8px',
                background: location.pathname === item.path ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                transition: 'all 0.2s',
                justifyContent: sidebarOpen ? 'flex-start' : 'center',
              }}
            >
              <span style={{ fontSize: '20px' }}>{item.icon}</span>
              {sidebarOpen && <span style={{ fontWeight: 500 }}>{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div style={{ padding: '20px 12px', borderTop: '1px solid #1e293b' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              color: '#94a3b8',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '8px',
              justifyContent: sidebarOpen ? 'flex-start' : 'center',
            }}
          >
            <FiHome style={{ fontSize: '20px' }} />
            {sidebarOpen && <span>Back to Store</span>}
          </button>
          <button
            onClick={logout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              color: '#f87171',
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
          transition: 'margin 0.3s ease',
          padding: '40px' 
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                {menuItems.find(i => i.path === location.pathname)?.label || 'Seller Panel'}
              </h2>
              <p style={{ color: '#64748b', margin: '4px 0 0' }}>Managing ShopSphere as a verified vendor</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '14px' }}>{user?.name}</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#38bdf8', fontWeight: 700 }}>{user?.role.toUpperCase()}</p>
              </div>
              <div style={{ width: 44, height: 44, borderRadius: '12px', background: '#38bdf8', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '18px' }}>
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

export default VendorLayout;
