import React, { useEffect, useState } from 'react';
import '@/App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { Toaster } from '@/components/ui/sonner';

// Pages
import StunningHomePage from '@/pages/StunningHomePage';
import ProductListPage from '@/pages/ProductListPage';
import HealthmugProductDetail from '@/pages/HealthmugProductDetail';
import CartPage from '@/pages/CartPage';
import CheckoutPage from '@/pages/CheckoutPage';
import UserDashboard from '@/pages/UserDashboard';
import VendorRegisterDashboard from '@/pages/VendorRegisterDashboard';
import AffiliateRegisterDashboard from '@/pages/AffiliateRegisterDashboard';
import AdminDashboard from '@/pages/AdminDashboard';
import AdminCMSDashboard from '@/pages/AdminCMSDashboard';
import ComprehensiveAdminPanel from '@/pages/ComprehensiveAdminPanel';
import AuthPage from '@/pages/AuthPage';
import HealthConcernPage from '@/pages/HealthConcernPage';


// Redirect helper component
const ExternalRedirect = ({ path }) => {
  useEffect(() => {
    const token = localStorage.getItem('token');
    const url = new URL(`https://consult.ayushmednest.com${path}`);
    if (token) {
      url.searchParams.set('sso_token', token);
    }
    window.location.replace(url.toString());
  }, [path]);
  return <div className="min-h-screen flex items-center justify-center bg-stone-50"><div className="text-lg text-slate-600">Redirecting to Consultation...</div></div>;
};
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const AuthContext = React.createContext(null);

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.get(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          setUser(res.data);
        })
        .catch(() => {
          localStorage.removeItem('token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-lg text-slate-600">Loading...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<StunningHomePage />} />
            <Route path="/products" element={<ProductListPage />} />
            <Route path="/products/:id" element={<HealthmugProductDetail />} />
            <Route path="/products/:id/:variantSlug" element={<HealthmugProductDetail />} />
            <Route path="/health/:concern" element={<HealthConcernPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={user ? <CheckoutPage /> : <Navigate to="/auth" />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/dashboard" element={user ? <UserDashboard /> : <Navigate to="/auth" />} />
            <Route path="/vendor/register" element={<VendorRegisterDashboard />} />
            <Route path="/vendor" element={<VendorRegisterDashboard />} />
            <Route path="/affiliate/register" element={<AffiliateRegisterDashboard />} />
            <Route path="/affiliate" element={<AffiliateRegisterDashboard />} />
            <Route path="/admin" element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />} />
            <Route path="/admin/cms" element={user?.role === 'admin' ? <AdminCMSDashboard /> : <Navigate to="/" />} />
            <Route path="/admin/settings" element={user?.role === 'admin' ? <ComprehensiveAdminPanel /> : <Navigate to="/" />} />
            
            {/* Redirects for Consultation */}
            <Route path="/doctors" element={<ExternalRedirect path="/doctors" />} />
            <Route path="/doctors/:id" element={<ExternalRedirect path="/doctors" />} />
            <Route path="/book-appointment" element={<ExternalRedirect path="/book-appointment" />} />
            <Route path="/consultation" element={<ExternalRedirect path="/consultation" />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" />
      </div>
    </AuthContext.Provider>
  );
}

export default App;
