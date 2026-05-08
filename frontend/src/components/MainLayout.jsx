import { Suspense, lazy } from 'react';

const Header = lazy(() => import('./Header'));
const Footer = lazy(() => import('./Footer'));

export default function MainLayout({ children }) {
  return (
    <>
      <Header />
      <div style={{ flex: 1, minHeight: 'calc(100vh - 200px)' }}>
        {children}
      </div>
      <Footer />
    </>
  );
}
