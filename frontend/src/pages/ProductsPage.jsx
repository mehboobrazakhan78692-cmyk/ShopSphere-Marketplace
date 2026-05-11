import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiFilter, FiSliders, FiGrid, FiList, FiChevronDown, FiX } from 'react-icons/fi';
import axios from 'axios';
import ProductCard from '../components/ProductCard';

const CATEGORIES = [
  { label: 'All', value: '' },
  { label: 'Electronics', value: 'electronics' },
  { label: 'Fashion', value: 'fashion' },
  { label: 'Home & Living', value: 'home' },
  { label: 'Beauty', value: 'beauty' }
];

const SORT_OPTIONS = [
  { label: 'Newest Arrivals', value: 'latest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Avg. Customer Review', value: 'rating' }
];

const BRANDS = ['Sony', 'Samsung', 'Apple', 'boAt', 'FashionHub', 'HomeStyle', "L'Oréal", 'Myntra', 'Nike', 'Adidas'];

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters state
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('latest');
  const [brand, setBrand] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [rating, setRating] = useState('');

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchTerm = searchParams.get('search') || '';

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let params = new URLSearchParams({
        page,
        limit: 12,
        sort,
        category,
        brand,
        minPrice,
        maxPrice,
        rating,
        search: searchTerm
      });

      // Remove empty params
      const cleanParams = {};
      params.forEach((val, key) => {
        if (val) cleanParams[key] = val;
      });

      const { data } = await axios.get('/api/products', { params: cleanParams });
      if (data.success) {
        setProducts(data.data || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      // Use empty state on error to avoid infinite loading
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, sort, category, brand, minPrice, maxPrice, rating, searchTerm]);

  const clearFilters = () => {
    setCategory('');
    setBrand('');
    setMinPrice('');
    setMaxPrice('');
    setRating('');
    setSort('latest');
    setPage(1);
  };

  return (
    <main className="products-container" style={{ maxWidth: '1400px', margin: '24px auto', padding: '0 16px', display: 'grid', gridTemplateColumns: '260px 1fr', gap: '24px' }}>
      
      {/* ── Sidebar Filters ────────────────────────────────────────── */}
      <aside>
        <div className="section-card" style={{ padding: '20px', position: 'sticky', top: '80px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Filters</h3>
            <button 
              onClick={clearFilters}
              style={{ background: 'none', border: 'none', color: '#007bff', fontSize: '13px', cursor: 'pointer', fontWeight: 500 }}
            >
              Clear All
            </button>
          </div>

          {/* Category */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Category</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {CATEGORIES.map(cat => (
                <label key={cat.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="category" 
                    checked={category === cat.value} 
                    onChange={() => { setCategory(cat.value); setPage(1); }}
                  />
                  {cat.label}
                </label>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Price Range</h4>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input 
                type="number" 
                placeholder="Min" 
                value={minPrice}
                onChange={e => setMinPrice(e.target.value)}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
              />
              <span style={{ color: '#888' }}>-</span>
              <input 
                type="number" 
                placeholder="Max" 
                value={maxPrice}
                onChange={e => setMaxPrice(e.target.value)}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
              />
            </div>
          </div>

          {/* Brand */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Brand</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
              {BRANDS.map(b => (
                <label key={b} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={brand === b} 
                    onChange={() => setBrand(prev => prev === b ? '' : b)}
                  />
                  {b}
                </label>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Customer Review</h4>
            {[4, 3, 2, 1].map(star => (
              <label key={star} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', marginBottom: '6px' }}>
                <input 
                  type="radio" 
                  name="rating" 
                  checked={Number(rating) === star}
                  onChange={() => { setRating(star); setPage(1); }}
                />
                <span style={{ color: '#f90' }}>{'★'.repeat(star)}{'☆'.repeat(5-star)}</span>
                <span style={{ color: '#555' }}>& Up</span>
              </label>
            ))}
          </div>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <section>
        {/* Results Info & Sort */}
        <div className="section-card" style={{ padding: '12px 20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#555' }}>
            Showing <strong>{(page-1)*12 + 1} – {Math.min(page*12, total)}</strong> of <strong>{total}</strong> products
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '14px', color: '#555' }}>Sort by:</span>
            <select 
              value={sort} 
              onChange={e => { setSort(e.target.value); setPage(1); }}
              style={{ padding: '6px 12px', border: '1px solid #ddd', borderRadius: '4px', background: '#fff', fontSize: '14px', outline: 'none' }}
            >
              {SORT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
            {Array(8).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: '360px', borderRadius: '8px' }} />)}
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
             <h2>No products found</h2>
             <p style={{ color: '#666' }}>Try adjusting your filters to find what you're looking for.</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
              {products.map(p => <ProductCard key={p._id} product={p} />)}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '40px' }}>
                <button 
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  style={{ padding: '8px 16px', border: '1px solid #ddd', borderRadius: '4px', background: '#fff', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1 }}
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button 
                    key={p}
                    onClick={() => setPage(p)}
                    style={{ 
                      width: '40px', height: '40px', border: '1px solid #ddd', borderRadius: '4px', 
                      background: page === p ? 'var(--brand-orange)' : '#fff', 
                      color: page === p ? '#111' : '#555',
                      fontWeight: page === p ? 700 : 400,
                      cursor: 'pointer' 
                    }}
                  >
                    {p}
                  </button>
                ))}
                <button 
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                  style={{ padding: '8px 16px', border: '1px solid #ddd', borderRadius: '4px', background: '#fff', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.5 : 1 }}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <style>{`
        input[type="radio"], input[type="checkbox"] {
          accent-color: var(--brand-orange);
          width: 16px;
          height: 16px;
        }
        @media (max-width: 1024px) {
          .products-container {
            grid-template-columns: 1fr !important;
          }
          aside {
            position: relative !important;
            width: 100% !important;
          }
          aside .section-card {
            position: relative !important;
            top: 0 !important;
          }
        }
      `}</style>
    </main>
  );
}
