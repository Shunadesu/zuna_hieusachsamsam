import { Outlet } from 'react-router-dom';
import TopBar from './TopBar';
import Header from './Header';
import Footer from './Footer';
import FloatingContact from './FloatingContact';

export default function Layout({ onOpenCart }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <TopBar />
      <Header onOpenCart={onOpenCart} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <FloatingContact />
    </div>
  );
}
