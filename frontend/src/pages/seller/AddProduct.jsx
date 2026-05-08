import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { FiArrowLeft, FiSave, FiImage, FiPackage, FiTag, FiDollarSign, FiHash } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getOptimizedImage } from '../../utils/imageUtils';

const AddProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    category: 'electronics',
    brand: '',
    stock: '',
    thumbnail: '',
    tags: '',
  });

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      const fetchProduct = async () => {
        try {
          const { data } = await axios.get(`/api/products/${id}`);
          const p = data.data;
          setForm({
            name: p.name,
            description: p.description,
            price: p.price,
            category: p.category,
            brand: p.brand,
            stock: p.stock,
            thumbnail: p.thumbnail,
            tags: p.tags?.join(', ') || '',
          });
        } catch (error) {
          toast.error('Failed to load product data');
        }
      };
      fetchProduct();
    }
  }, [id, isEdit]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      return toast.error('File too large (max 5MB)');
    }

    const formData = new FormData();
    formData.append('image', file);

    setUploading(true);
    try {
      const { data } = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setForm({ ...form, thumbnail: data.url });
      toast.success('Image uploaded to Cloudinary');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const productData = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
      tags: form.tags.split(',').map(t => t.trim()),
    };

    try {
      if (isEdit) {
        await axios.put(`/api/products/${id}`, productData);
        toast.success('Product updated successfully');
      } else {
        await axios.post('/api/products', productData);
        toast.success('Product uploaded successfully');
      }
      navigate('/seller/products');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fadeIn">
      <button 
        onClick={() => navigate(-1)} 
        style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', marginBottom: '24px', fontWeight: 600 }}
      >
        <FiArrowLeft /> Back
      </button>

      <div className="section-card" style={{ maxWidth: '800px', padding: '32px' }}>
        <h3 style={{ margin: '0 0 24px', fontSize: '20px', fontWeight: 800 }}>
          {isEdit ? 'Edit Product Details' : 'Upload New Product'}
        </h3>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Name */}
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Product Name</label>
            <div style={{ position: 'relative' }}>
              <FiPackage style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                type="text" 
                required
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
                placeholder="e.g. Sony Wireless Headphones"
                style={{ width: '100%', padding: '12px 12px 12px 40px', border: '1px solid #e2e8f0', borderRadius: '10px', outline: 'none' }}
              />
            </div>
          </div>

          {/* Description */}
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Description</label>
            <textarea 
              required
              rows={4}
              value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
              placeholder="Describe the product features, warranty, etc."
              style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '10px', outline: 'none', resize: 'vertical' }}
            />
          </div>

          {/* Price */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Price (₹)</label>
            <div style={{ position: 'relative' }}>
              <FiDollarSign style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                type="number" 
                required
                value={form.price}
                onChange={e => setForm({...form, price: e.target.value})}
                placeholder="0.00"
                style={{ width: '100%', padding: '12px 12px 12px 40px', border: '1px solid #e2e8f0', borderRadius: '10px', outline: 'none' }}
              />
            </div>
          </div>

          {/* Stock */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Initial Stock</label>
            <div style={{ position: 'relative' }}>
              <FiHash style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                type="number" 
                required
                value={form.stock}
                onChange={e => setForm({...form, stock: e.target.value})}
                placeholder="Quantity"
                style={{ width: '100%', padding: '12px 12px 12px 40px', border: '1px solid #e2e8f0', borderRadius: '10px', outline: 'none' }}
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Category</label>
            <select 
              value={form.category}
              onChange={e => setForm({...form, category: e.target.value})}
              style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '10px', outline: 'none', background: '#fff' }}
            >
              <option value="electronics">Electronics</option>
              <option value="fashion">Fashion</option>
              <option value="home">Home & Living</option>
              <option value="beauty">Beauty</option>
            </select>
          </div>

          {/* Brand */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Brand</label>
            <div style={{ position: 'relative' }}>
              <FiTag style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                type="text" 
                required
                value={form.brand}
                onChange={e => setForm({...form, brand: e.target.value})}
                placeholder="Brand name"
                style={{ width: '100%', padding: '12px 12px 12px 40px', border: '1px solid #e2e8f0', borderRadius: '10px', outline: 'none' }}
              />
            </div>
          </div>

          {/* Image URL */}
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Image URL</label>
            <div style={{ position: 'relative' }}>
              <FiImage style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                type="text" 
                required
                value={form.thumbnail}
                onChange={e => setForm({...form, thumbnail: e.target.value})}
                placeholder="https://images.unsplash.com/..."
                style={{ width: '100%', padding: '12px 12px 12px 40px', border: '1px solid #e2e8f0', borderRadius: '10px', outline: 'none' }}
              />
            </div>
            
            <div style={{ marginTop: '12px' }}>
              <label 
                className="btn-secondary" 
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  opacity: uploading ? 0.7 : 1,
                  padding: '8px 16px',
                  fontSize: '13px',
                  background: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontWeight: 600
                }}
              >
                <input 
                  type="file" 
                  hidden 
                  accept="image/*" 
                  onChange={handleFileUpload} 
                  disabled={uploading}
                />
                {uploading ? 'Uploading...' : <><FiImage /> Upload from Device</>}
              </label>
              <p style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                Or paste a URL above. Recommended: 800x800px.
              </p>
            </div>
            {form.thumbnail && (
              <div style={{ marginTop: '12px', width: '120px', height: '120px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                <img src={getOptimizedImage(form.thumbnail, 200)} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
          </div>

          {/* Tags */}
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Search Tags (comma separated)</label>
            <input 
              type="text" 
              value={form.tags}
              onChange={e => setForm({...form, tags: e.target.value})}
              placeholder="wireless, music, sony, bluetooth"
              style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '10px', outline: 'none' }}
            />
          </div>

          <div style={{ gridColumn: 'span 2', marginTop: '12px' }}>
            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary" 
              style={{ width: '100%', padding: '14px', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: '#0284c7' }}
            >
              {loading ? 'Saving...' : <><FiSave /> {isEdit ? 'Update Product' : 'Upload Product'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
