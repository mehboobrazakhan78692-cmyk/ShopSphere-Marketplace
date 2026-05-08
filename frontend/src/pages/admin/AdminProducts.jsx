import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiEdit2, FiTrash2, FiPlus, FiEye } from 'react-icons/fi';
import toast from 'react-hot-toast';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get('/api/products?limit=100');
      setProducts(data.data);
    } catch (error) {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`/api/products/${id}`);
        toast.success('Product deleted successfully');
        fetchProducts();
      } catch (error) {
        toast.error('Failed to delete product');
      }
    }
  };

  if (loading) return <div className="skeleton" style={{ height: '500px', borderRadius: '12px' }} />;

  return (
    <div className="animate-fadeIn">
      <div className="section-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #edf2f7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Product Inventory</h3>
          <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}>
            <FiPlus /> Add Product
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f7fafc', textAlign: 'left' }}>
                <th style={{ padding: '16px 24px', color: '#718096', fontWeight: 600, fontSize: '13px' }}>PRODUCT</th>
                <th style={{ padding: '16px 24px', color: '#718096', fontWeight: 600, fontSize: '13px' }}>CATEGORY</th>
                <th style={{ padding: '16px 24px', color: '#718096', fontWeight: 600, fontSize: '13px' }}>PRICE</th>
                <th style={{ padding: '16px 24px', color: '#718096', fontWeight: 600, fontSize: '13px' }}>STOCK</th>
                <th style={{ padding: '16px 24px', color: '#718096', fontWeight: 600, fontSize: '13px' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} style={{ borderBottom: '1px solid #edf2f7' }} onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: 44, height: 44, borderRadius: '8px', background: '#f4f7f6', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {p.thumbnail ? <img src={p.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '📦'}
                      </div>
                      <span style={{ fontWeight: 500, fontSize: '14px', color: '#1a202c' }}>{p.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', fontSize: '14px', color: '#4a5568', textTransform: 'capitalize' }}>{p.category}</td>
                  <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 600 }}>₹{p.price.toLocaleString()}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ 
                      padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
                      background: p.stock < 10 ? '#fff5f5' : '#f0fff4',
                      color: p.stock < 10 ? '#c53030' : '#2f855a'
                    }}>
                      {p.stock} in stock
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button style={{ background: 'none', border: 'none', color: '#4299e1', cursor: 'pointer', fontSize: '18px' }} title="View"><FiEye /></button>
                      <button style={{ background: 'none', border: 'none', color: '#48bb78', cursor: 'pointer', fontSize: '18px' }} title="Edit"><FiEdit2 /></button>
                      <button onClick={() => handleDelete(p._id)} style={{ background: 'none', border: 'none', color: '#f56565', cursor: 'pointer', fontSize: '18px' }} title="Delete"><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;
