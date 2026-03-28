import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { useAuthStore } from './store/authStore';
import Layout from './components/Layout';
import LoginSidebar from './components/LoginSidebar';
import CartDrawer from './components/CartDrawer';
import Toast from './components/Toast';
import ScrollToTop from './components/ScrollToTop';
import HomePage from './pages/HomePage';
import BooksPage from './pages/BooksPage';
import BookDetailPage from './pages/BookDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import SellBookPage from './pages/SellBookPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import OnlinePurchaseGuidePage from './pages/OnlinePurchaseGuidePage';
import SellBookGuidePage from './pages/SellBookGuidePage';
import FaqPage from './pages/FaqPage';
import SeoStatsPage from './pages/SeoStatsPage';

function AppInner() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const hydrate = useAuthStore((s) => s.hydrate);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (location.state?.openLogin) {
      setLoginOpen(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state?.openLogin, navigate, location.pathname]);

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route
          path="/"
          element={
            <Layout onOpenCart={() => setCartOpen(true)} />
          }
        >
          <Route index element={<HomePage />} />
          <Route path="sach" element={<BooksPage />} />
          <Route path="sach/:slug" element={<BookDetailPage />} />
          <Route path="gio-hang" element={<CartPage />} />
          <Route path="thanh-toan" element={<CheckoutPage />} />
          <Route path="don-hang" element={<OrdersPage />} />
          <Route path="ban-sach" element={<SellBookPage />} />
          <Route path="ve-chung-toi" element={<AboutPage />} />
          <Route path="lien-he" element={<ContactPage />} />
          <Route path="huong-dan-mua-hang-online" element={<OnlinePurchaseGuidePage />} />
          <Route path="huong-dan-thanh-ly-sach" element={<SellBookGuidePage />} />
          <Route path="cau-hoi-thuong-gap" element={<FaqPage />} />
          <Route path="seo-stats" element={<SeoStatsPage />} />
        </Route>
      </Routes>
      <LoginSidebar open={loginOpen} onClose={() => setLoginOpen(false)} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <Toast />
    </>
  );
}

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <AppInner />
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
