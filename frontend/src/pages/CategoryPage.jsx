import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { FiFilter, FiSliders } from 'react-icons/fi';

const SORT_OPTIONS = [
  { label: 'Newest First',   value: 'latest' },
  { label: 'Price: Low → High', value: 'price_asc' },
  { label: 'Price: High → Low', value: 'price_desc' },
  { label: 'Top Rated',     value: 'rating' },
  { label: 'Most Popular',  value: 'popular' },
];

const CAT_META = {
  electronics: { icon: '💻', title: 'Electronics', desc: 'Mobiles, Laptops, Gadgets & More' },
  fashion:     { icon: '👗', title: 'Fashion',     desc: 'Clothing, Footwear & Accessories' },
  home:        { icon: '🏠', title: 'Home & Living', desc: 'Furniture, Decor & Appliances' },
  beauty:      { icon: '💄', title: 'Beauty',       desc: 'Skincare, Makeup & Wellness' },
};

// Inline mock data for category pages
const MOCK = [
  { id: '1', _id: '1', name: 'Sony WH-1000XM5 Headphones', price: 24990, originalPrice: 34990, category: 'electronics', brand: 'Sony', rating: 4.8, numReviews: 12450, stock: 8, thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop' },
  { id: '2', _id: '2', name: 'Samsung Galaxy S24 Ultra 256GB', price: 129999, originalPrice: 134999, category: 'electronics', brand: 'Samsung', rating: 4.7, numReviews: 8930, stock: 15, thumbnail: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=300&h=300&fit=crop' },
  { id: '3', _id: '3', name: 'Apple MacBook Air M3', price: 134900, originalPrice: 149900, category: 'electronics', brand: 'Apple', rating: 4.9, numReviews: 5670, stock: 5, thumbnail: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=300&fit=crop' },
  { id: '4', _id: '4', name: "Men's Cotton Shirt – Pack of 3", price: 1299, originalPrice: 2499, category: 'fashion', brand: 'FashionHub', rating: 4.2, numReviews: 3210, stock: 50, thumbnail: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=300&h=300&fit=crop' },
  { id: '5', _id: '5', name: 'Nordic Coffee Table – White', price: 8999, originalPrice: 14999, category: 'home', brand: 'HomeStyle', rating: 4.5, numReviews: 892, stock: 12, thumbnail: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&h=300&fit=crop' },
  { id: '6', _id: '6', name: "L'Oréal Revitalift Face Serum", price: 649, originalPrice: 999, category: 'beauty', brand: "L'Oréal", rating: 4.4, numReviews: 6780, stock: 100, thumbnail: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=300&h=300&fit=crop' },
  { id: '7', _id: '7', name: 'boAt Airdopes 141 TWS Earbuds', price: 1299, originalPrice: 2990, category: 'electronics', brand: 'boAt', rating: 4.3, numReviews: 45670, stock: 200, thumbnail: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=300&h=300&fit=crop' },
  { id: '8', _id: '8', name: "Women's Floral Anarkali Kurta", price: 899, originalPrice: 1999, category: 'fashion', brand: 'Myntra', rating: 4.1, numReviews: 2340, stock: 35, thumbnail: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&h=300&fit=crop' },
];

export default function CategoryPage() {
  const { category } = useParams();
  const meta = CAT_META[category] || { icon: '📦', title: category, desc: '' };
  const [products, setProducts] = useState([]);
  const [sort, setSort] = useState('latest');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`/api/products?category=${category}&sort=${sort}&limit=24`);
        if (data.data && data.data.length > 0) setProducts(data.data);
        else setProducts(MOCK.filter(p => p.category === category));
      } catch {
        setProducts(MOCK.filter(p => p.category === category));
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [category, sort]);

  return (
    <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px 16px' }}>
      {/* Category Header */}
      <div style={{ background: 'linear-gradient(135deg, #131921, #1a2c3b)', borderRadius: '10px', padding: '28px 32px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span style={{ fontSize: '48px' }}>{meta.icon}</span>
        <div>
          <h1 style={{ color: '#fff', margin: '0 0 4px', fontSize: '28px', fontWeight: 800 }}>{meta.title}</h1>
          <p style={{ color: '#aaa', margin: 0 }}>{meta.desc}</p>
        </div>
      </div>

      {/* Sort & Filter */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <p style={{ margin: 0, color: '#555', fontSize: '14px' }}>
          Showing <strong>{products.length}</strong> results
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <FiSliders size={16} color="#555" />
          <select value={sort} onChange={e => setSort(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', background: '#fff', cursor: 'pointer' }}>
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
          {Array(8).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: '360px', borderRadius: '8px' }} />)}
        </div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <p style={{ fontSize: '24px' }}>😕</p>
          <h2>No products found</h2>
          <Link to="/" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block', padding: '10px 24px', marginTop: '12px' }}>Back to Home</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
          {products.map(p => <ProductCard key={p._id || p.id} product={p} />)}
        </div>
      )}
    </main>
  );
}
