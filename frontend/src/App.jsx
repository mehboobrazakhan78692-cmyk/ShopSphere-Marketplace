import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import ErrorBoundary from './components/ErrorBoundary';

// Layout Components
const Header = lazy(() => import('./components/Header'));
const Footer = lazy(() => import('./components/Footer'));
const ProtectedRoute = lazy(() => import('./components/ProtectedRoute'));
const AdminLayout = lazy(() => import('./components/AdminLayout'));
const VendorLayout = lazy(() => import('./components/VendorLayout'));

// Pages
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Cart = lazy(() => import('./pages/Cart'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'));
const MyOrders = lazy(() => import('./pages/MyOrders'));
const OrderDetails = lazy(() => import('./pages/OrderDetails'));
const Profile = lazy(() => import('./pages/Profile'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Admin & Seller
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const VendorDashboard = lazy(() => import('./pages/seller/VendorDashboard'));
const VendorProducts = lazy(() => import('./pages/seller/VendorProducts'));
const VendorOrders = lazy(() => import('./pages/seller/VendorOrders'));
const AddProduct = lazy(() => import('./pages/seller/AddProduct'));

// ── Main store layout: Header + Outlet + Footer ─────────────────────────────
function StoreLayout() {
  return (
    <>
      <Header />
      <div style={{ flex: 1 }}>
        <Outlet />
      </div>
      <Footer />
    </>
  );
}

// ── Global loading spinner ───────────────────────────────────────────────────
const Spinner = () => (
  <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eaeded' }}>
    <div className="loader" />
    <style>{`
      .loader {
        width: 48px; height: 48px;
        border: 5px solid #f3f3f3;
        border-bottom-color: #f90;
        border-radius: 50%;
        display: inline-block;
        box-sizing: border-box;
        animation: rotation 1s linear infinite;
      }
      @keyframes rotation {
        0%   { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  borderRadius: '8px',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                },
                success: { iconTheme: { primary: '#f90', secondary: '#fff' } },
              }}
            />
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
              <Suspense fallback={<Spinner />}>
                <Routes>
                  {/* ── Admin Routes (no global Header/Footer) ── */}
                  <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                    <Route path="/admin" element={<AdminLayout />}>
                      <Route index element={<AdminDashboard />} />
                      <Route path="products" element={<AdminProducts />} />
                      <Route path="orders" element={<AdminOrders />} />
                      <Route path="users" element={<AdminUsers />} />
                    </Route>
                  </Route>

                  {/* ── Seller Routes (no global Header/Footer) ── */}
                  <Route element={<ProtectedRoute allowedRoles={['vendor']} />}>
                    <Route path="/seller" element={<VendorLayout />}>
                      <Route index element={<VendorDashboard />} />
                      <Route path="products" element={<VendorProducts />} />
                      <Route path="orders" element={<VendorOrders />} />
                      <Route path="add-product" element={<AddProduct />} />
                      <Route path="edit-product/:id" element={<AddProduct />} />
                    </Route>
                  </Route>

                  {/* ── Main Store Routes (with Header + Footer) ── */}
                  <Route element={<StoreLayout />}>
                    {/* Public routes */}
                    <Route path="/"                   element={<Home />} />
                    <Route path="/login"              element={<Login />} />
                    <Route path="/register"           element={<Register />} />
                    <Route path="/cart"               element={<Cart />} />
                    <Route path="/products"           element={<ProductsPage />} />
                    <Route path="/search"             element={<SearchPage />} />
                    <Route path="/product/:id"        element={<ProductDetail />} />
                    <Route path="/category/:category" element={<CategoryPage />} />

                    {/* Protected store routes */}
                    <Route element={<ProtectedRoute allowedRoles={[]} />}>
                      <Route path="/checkout"         element={<Checkout />} />
                      <Route path="/order-success"    element={<OrderSuccess />} />
                      <Route path="/orders"           element={<MyOrders />} />
                      <Route path="/order/:id"        element={<OrderDetails />} />
                      <Route path="/wishlist"         element={<Wishlist />} />
                      <Route path="/profile"          element={<Profile />} />
                    </Route>

                    {/* 404 catch-all */}
                    <Route path="*" element={<NotFound />} />
                  </Route>
                </Routes>
              </Suspense>
            </div>
          </CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </BrowserRouter>
  </ErrorBoundary>
);
}

export default App;
