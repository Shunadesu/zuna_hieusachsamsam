import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Books from './pages/Books';
import AddBook from './pages/AddBook';
import Categories from './pages/Categories';
import Orders from './pages/Orders';
import Promotions from './pages/Promotions';
import BankAccounts from './pages/BankAccounts';
import Sliders from './pages/Sliders';
import SiteConfig from './pages/SiteConfig';
import Reports from './pages/Reports';
import SellRequests from './pages/SellRequests';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="books" element={<Books />} />
          <Route path="books/add" element={<AddBook />} />
          <Route path="books/edit/:id" element={<AddBook />} />
          <Route path="categories" element={<Categories />} />
          <Route path="orders" element={<Orders />} />
          <Route path="promotions" element={<Promotions />} />
          <Route path="bank-accounts" element={<BankAccounts />} />
          <Route path="sliders" element={<Sliders />} />
          <Route path="site-config" element={<SiteConfig />} />
          <Route path="reports" element={<Reports />} />
          <Route path="sell-requests" element={<SellRequests />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
