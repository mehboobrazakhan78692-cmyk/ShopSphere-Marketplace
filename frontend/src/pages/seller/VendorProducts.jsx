import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiEdit2, FiTrash2, FiPlus, FiEye, FiSearch } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const VendorProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get('/api/products/vendor-list');
      setProducts(data.data);
    } catch (error) {
      toast.error('Failed to fetch your products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure? This will remove the product from the store.')) {
      try {
        await axios.delete(`/api/products/${id}`);
        toast.success('Product deleted');
        fetchProducts();
      } catch (error) {
        toast.error('Failed to delete product');
      }
    }
  };

  const filteredProducts = products.filter(p =>
    (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.brand || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="skeleton" style={{ height: '500px', borderRadius: '16px' }} />;

  return (
    <div className="animate-fadeIn">
      <div className="section-card" style={{ padding: '0', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type="text" 
              placeholder="Search my inventory..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '10px 12px 10px 40px', border: '1px solid #e2e8f0', borderRadius: '10px', outline: 'none', fontSize: '14px' }}
            />
          </div>
          <button 
            onClick={() => navigate('/seller/add-product')}
            className="btn-primary" 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px', background: '#0284c7' }}
          >
            <FiPlus /> Add Product
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
                <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase' }}>Product Info</th>
                <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase' }}>Category</th>
                <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase' }}>Price</th>
                <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase' }}>Inventory</th>
                <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => (
                <tr key={p._id} style={{ borderBottom: '1px solid #f1f5f9' }} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: 48, height: 48, borderRadius: '10px', background: '#f1f5f9', overflow: 'hidden', flexShrink: 0 }}>
                        {p.thumbnail ? <img src={p.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📦</div>}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '14px', color: '#1e293b' }}>{p.name}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>Brand: {p.brand}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 500, background: '#f1f5f9', color: '#475569', textTransform: 'capitalize' }}>
                      {p.category}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>₹{p.price.toLocaleString()}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ 
                        width: '8px', height: '8px', borderRadius: '50%', 
                        background: p.stock > 10 ? '#10b981' : p.stock > 0 ? '#f59e0b' : '#ef4444' 
                      }} />
                      <span style={{ fontSize: '14px', fontWeight: 500, color: p.stock === 0 ? '#ef4444' : '#475569' }}>
                        {p.stock} units
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <button onClick={() => navigate(`/product/${p._id}`)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '18px' }} title="View"><FiEye /></button>
                      <button onClick={() => navigate(`/seller/edit-product/${p._id}`)} style={{ background: 'none', border: 'none', color: '#0284c7', cursor: 'pointer', fontSize: '18px' }} title="Edit"><FiEdit2 /></button>
                      <button onClick={() => handleDelete(p._id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '18px' }} title="Delete"><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredProducts.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
              No products found matching your search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorProducts;
