import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiX, FiSliders, FiGrid, FiList } from 'react-icons/fi';
import axios from 'axios';
import ProductCard from '../components/ProductCard';

const SORT_OPTIONS = [
  { label: 'Relevance',         value: 'latest' },
  { label: 'Price: Low → High', value: 'price_asc' },
  { label: 'Price: High → Low', value: 'price_desc' },
  { label: 'Top Rated',         value: 'rating' },
  { label: 'Most Popular',      value: 'popular' },
];

const CATEGORIES = ['All', 'Electronics', 'Fashion', 'Home & Living', 'Beauty'];
const CAT_MAP = { 'Electronics': 'electronics', 'Fashion': 'fashion', 'Home & Living': 'home', 'Beauty': 'beauty' };

const MOCK = [
  { _id: '1', name: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones', price: 24990, originalPrice: 34990, category: 'electronics', brand: 'Sony', rating: 4.8, numReviews: 12450, stock: 8, thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop' },
  { _id: '2', name: 'Samsung Galaxy S24 Ultra 256GB Titanium Black', price: 129999, originalPrice: 134999, category: 'electronics', brand: 'Samsung', rating: 4.7, numReviews: 8930, stock: 15, thumbnail: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=300&h=300&fit=crop' },
  { _id: '3', name: 'Apple MacBook Air M3 Chip 15-inch Laptop', price: 134900, originalPrice: 149900, category: 'electronics', brand: 'Apple', rating: 4.9, numReviews: 5670, stock: 5, thumbnail: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=300&fit=crop' },
  { _id: '4', name: "Men's Premium Casual Cotton Shirt - Pack of 3", price: 1299, originalPrice: 2499, category: 'fashion', brand: 'FashionHub', rating: 4.2, numReviews: 3210, stock: 50, thumbnail: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=300&h=300&fit=crop' },
  { _id: '5', name: 'Minimalist Nordic Coffee Table - White & Walnut', price: 8999, originalPrice: 14999, category: 'home', brand: 'HomeStyle', rating: 4.5, numReviews: 892, stock: 12, thumbnail: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&h=300&fit=crop' },
  { _id: '6', name: "L'Oréal Paris Revitalift Face Serum 30ml", price: 649, originalPrice: 999, category: 'beauty', brand: "L'Oréal", rating: 4.4, numReviews: 6780, stock: 100, thumbnail: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=300&h=300&fit=crop' },
  { _id: '7', name: 'boAt Airdopes 141 Bluetooth Truly Wireless Earbuds', price: 1299, originalPrice: 2990, category: 'electronics', brand: 'boAt', rating: 4.3, numReviews: 45670, stock: 200, thumbnail: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=300&h=300&fit=crop' },
  { _id: '8', name: "Women's Floral Printed Anarkali Kurta", price: 899, originalPrice: 1999, category: 'fashion', brand: 'Myntra', rating: 4.1, numReviews: 2340, stock: 35, thumbnail: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&h=300&fit=crop' },
];

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialQuery = searchParams.get('q') || '';
  const initialCat = searchParams.get('category') || 'All';

  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCat);
  const [sort, setSort] = useState('latest');
  const [products, setProducts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // ─── Debounce the search query (400ms) ────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  // ─── Fetch suggestions as user types ──────────────────────────────
  useEffect(() => {
    if (debouncedQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const fetchSuggestions = async () => {
      try {
        const catParam = category !== 'All' ? `&category=${CAT_MAP[category] || category.toLowerCase()}` : '';
        const { data } = await axios.get(`/api/products?search=${encodeURIComponent(debouncedQuery)}&limit=5${catParam}`);
        if (data.data && data.data.length > 0) {
          setSuggestions(data.data.map(p => ({ _id: p._id, name: p.name, category: p.category, price: p.price, thumbnail: p.thumbnail })));
        } else {
          // Fallback: filter mock data
          const filtered = MOCK.filter(p => p.name.toLowerCase().includes(debouncedQuery.toLowerCase()));
          setSuggestions(filtered.slice(0, 5));
        }
      } catch {
        const filtered = MOCK.filter(p => p.name.toLowerCase().includes(debouncedQuery.toLowerCase()));
        setSuggestions(filtered.slice(0, 5));
      }
    };
    fetchSuggestions();
  }, [debouncedQuery, category]);

  // ─── Full search (on submit or when debounced query stabilizes) ───
  const doSearch = useCallback(async (searchQuery, searchCategory, searchSort, searchPage) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setShowSuggestions(false);
    try {
      const catParam = searchCategory !== 'All' ? `&category=${CAT_MAP[searchCategory] || searchCategory.toLowerCase()}` : '';
      const { data } = await axios.get(`/api/products?search=${encodeURIComponent(searchQuery)}&sort=${searchSort}&page=${searchPage}&limit=20${catParam}`);
      if (data.data && data.data.length > 0) {
        setProducts(data.data);
        setTotalResults(data.total);
        setTotalPages(data.totalPages);
      } else {
        // Fallback mock
        let filtered = MOCK.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
        if (searchCategory !== 'All') filtered = filtered.filter(p => p.category === (CAT_MAP[searchCategory] || searchCategory.toLowerCase()));
        setProducts(filtered);
        setTotalResults(filtered.length);
        setTotalPages(1);
      }
    } catch {
      let filtered = MOCK.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
      if (searchCategory !== 'All') filtered = filtered.filter(p => p.category === (CAT_MAP[searchCategory] || searchCategory.toLowerCase()));
      setProducts(filtered);
      setTotalResults(filtered.length);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, []);

  // Run search when URL params change
  useEffect(() => {
    if (initialQuery) {
      doSearch(initialQuery, category, sort, page);
    }
  }, [initialQuery, category, sort, page, doSearch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearchParams({ q: query.trim(), category });
    setPage(1);
    doSearch(query.trim(), category, sort, 1);
  };

  const handleSuggestionClick = (suggestion) => {
    setShowSuggestions(false);
    navigate(`/product/${suggestion._id}`);
  };

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target) &&
          inputRef.current && !inputRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px 16px' }}>

      {/* ── Search Bar ─────────────────────────────────────────────── */}
      <div className="section-card" style={{ padding: '20px 24px', marginBottom: '20px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '12px', alignItems: 'stretch', position: 'relative' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <div style={{ position: 'relative' }}>
              <FiSearch size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); }}
                onFocus={() => query.trim().length >= 2 && setShowSuggestions(true)}
                placeholder="Search for products, brands and more..."
                style={{
                  width: '100%', padding: '12px 40px 12px 44px',
                  border: '2px solid #ddd', borderRadius: '8px',
                  fontSize: '15px', outline: 'none',
                  transition: 'border-color 0.2s', boxSizing: 'border-box',
                }}
                onFocusCapture={e => e.currentTarget.style.borderColor = 'var(--brand-orange)'}
                onBlurCapture={e => e.currentTarget.style.borderColor = '#ddd'}
              />
              {query && (
                <button
                  type="button"
                  onClick={() => { setQuery(''); setSuggestions([]); setShowSuggestions(false); }}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: '4px' }}
                >
                  <FiX size={16} />
                </button>
              )}
            </div>

            {/* ── Live Suggestions Dropdown ───────────────────────── */}
            {showSuggestions && suggestions.length > 0 && (
              <div
                ref={suggestionsRef}
                className="animate-slideDown"
                style={{
                  position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
                  background: '#fff', borderRadius: '8px', zIndex: 100,
                  boxShadow: '0 8px 24px rgba(0,0,0,.15)',
                  border: '1px solid #eee', overflow: 'hidden',
                }}
              >
                {suggestions.map((s) => (
                  <div
                    key={s._id}
                    onClick={() => handleSuggestionClick(s)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '10px 16px', cursor: 'pointer',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ width: 40, height: 40, borderRadius: '6px', background: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                      {s.thumbnail ? <img src={s.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> :
                        <span style={{ fontSize: '18px' }}>{{ electronics: '💻', fashion: '👗', home: '🏠', beauty: '💄' }[s.category] || '📦'}</span>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p className="line-clamp-2" style={{ margin: 0, fontSize: '14px', fontWeight: 500 }}>{s.name}</p>
                      <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#666' }}>in {s.category}</p>
                    </div>
                    <span style={{ fontWeight: 600, fontSize: '14px', color: '#0f1111', flexShrink: 0 }}>
                      ₹{s.price?.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
                <div
                  onClick={handleSubmit}
                  style={{
                    padding: '10px 16px', borderTop: '1px solid #eee',
                    color: '#007bff', fontSize: '14px', fontWeight: 500,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <FiSearch size={14} /> See all results for "{query}"
                </div>
              </div>
            )}
          </div>

          {/* Category filter */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ padding: '0 16px', border: '2px solid #ddd', borderRadius: '8px', background: '#fff', fontSize: '14px', cursor: 'pointer', minWidth: '140px' }}
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <button type="submit" className="btn-primary" style={{ padding: '0 28px', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
            <FiSearch size={16} /> Search
          </button>
        </form>
      </div>

      {/* ── Results Header ────────────────────────────────────────── */}
      {initialQuery && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: 700 }}>
              {loading ? 'Searching...' : `Results for "${initialQuery}"`}
            </h1>
            {!loading && (
              <p style={{ margin: 0, color: '#555', fontSize: '14px' }}>
                {totalResults} product{totalResults !== 1 ? 's' : ''} found
                {category !== 'All' ? ` in ${category}` : ''}
              </p>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FiSliders size={16} color="#555" />
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
              style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', background: '#fff', cursor: 'pointer' }}
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* ── No query state ────────────────────────────────────────── */}
      {!initialQuery && !loading && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <FiSearch size={64} color="#ddd" />
          <h2 style={{ color: '#555', marginTop: '16px' }}>Search ShopSphere</h2>
          <p style={{ color: '#888' }}>Find products from thousands of sellers across India</p>
        </div>
      )}

      {/* ── Loading ───────────────────────────────────────────────── */}
      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
          {Array(8).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: '360px', borderRadius: '8px' }} />)}
        </div>
      )}

      {/* ── Results Grid ─────────────────────────────────────────── */}
      {!loading && products.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
          {products.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      )}

      {/* ── Empty state ──────────────────────────────────────────── */}
      {!loading && initialQuery && products.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <span style={{ fontSize: '64px' }}>😕</span>
          <h2 style={{ marginTop: '16px' }}>No results found for "{initialQuery}"</h2>
          <p style={{ color: '#666', marginBottom: '24px' }}>Try different keywords or browse our categories</p>
          <Link to="/" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block', padding: '12px 28px' }}>
            Back to Home
          </Link>
        </div>
      )}

      {/* ── Pagination ───────────────────────────────────────────── */}
      {!loading && totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '32px', marginBottom: '32px' }}>
          <button
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
            className="btn-secondary"
            style={{ padding: '8px 16px', opacity: page <= 1 ? 0.5 : 1 }}
          >
            ← Previous
          </button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const p = i + 1;
            return (
              <button
                key={p}
                onClick={() => setPage(p)}
                style={{
                  width: 36, height: 36, borderRadius: '6px', border: 'none', cursor: 'pointer',
                  background: page === p ? 'var(--brand-orange)' : '#fff',
                  color: page === p ? '#111' : '#555',
                  fontWeight: page === p ? 700 : 500,
                  boxShadow: '0 1px 3px rgba(0,0,0,.1)',
                  transition: 'all 0.2s',
                }}
              >
                {p}
              </button>
            );
          })}
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(p => p + 1)}
            className="btn-secondary"
            style={{ padding: '8px 16px', opacity: page >= totalPages ? 0.5 : 1 }}
          >
            Next →
          </button>
        </div>
      )}
    </main>
  );
}
