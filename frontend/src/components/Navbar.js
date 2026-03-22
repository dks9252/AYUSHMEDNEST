import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '@/App';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingCart, User, Search, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60" data-testid="main-navbar">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2" data-testid="logo-link">
            <div className="w-8 h-8 bg-gradient-to-br from-[#2F5C3E] to-[#1a3326] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="text-xl font-bold text-[#1A2F23] font-['Outfit']" style={{ fontFamily: 'Outfit, sans-serif' }}>
              AYUSHMEDNEST
            </span>
          </Link>

          {/* Desktop Search */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                type="search"
                placeholder="Search medicines, health conditions, doctors..."
                className="h-11 w-full rounded-full border-slate-200 bg-stone-50 pl-12 pr-4 text-base focus:border-[#2F5C3E] focus:ring-[#2F5C3E]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="search-input"
              />
            </div>
          </form>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/products" className="text-sm font-medium text-slate-600 hover:text-[#2F5C3E] transition-colors" data-testid="products-link">Products</Link>
            <a href="https://consult.ayushmednest.com" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-slate-600 hover:text-[#2F5C3E] transition-colors" data-testid="doctors-link">Consult Doctors</a>
            <Link to="/cart" className="relative" data-testid="cart-link">
              <ShoppingCart className="h-5 w-5 text-slate-600 hover:text-[#2F5C3E] transition-colors" />
            </Link>
            
            {user ? (
              <div className="flex items-center space-x-3">
                <Link to={user.role === 'admin' ? '/admin' : user.role === 'vendor' ? '/vendor' : '/dashboard'}>
                  <Button variant="ghost" size="sm" className="text-sm" data-testid="dashboard-link">
                    <User className="h-4 w-4 mr-2" />
                    {user.full_name}
                  </Button>
                </Link>
                <Button onClick={logout} variant="outline" size="sm" className="rounded-full" data-testid="logout-button">
                  Logout
                </Button>
              </div>
            ) : (
              <Link to="/auth">
                <Button className="bg-[#2F5C3E] hover:bg-[#244A30] text-white rounded-full px-6" data-testid="login-button">
                  Login
                </Button>
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="mobile-menu-button"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-100" data-testid="mobile-menu">
            <form onSubmit={handleSearch} className="mb-4">
              <Input
                type="search"
                placeholder="Search..."
                className="w-full rounded-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
            <nav className="flex flex-col space-y-3">
              <Link to="/products" className="text-slate-600 hover:text-[#2F5C3E]" onClick={() => setMobileMenuOpen(false)}>Products</Link>
              <a href="https://consult.ayushmednest.com" target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-[#2F5C3E]" onClick={() => setMobileMenuOpen(false)}>Consult Doctors</a>
              <Link to="/cart" className="text-slate-600 hover:text-[#2F5C3E]" onClick={() => setMobileMenuOpen(false)}>Cart</Link>
              {user ? (
                <>
                  <Link to="/dashboard" className="text-slate-600 hover:text-[#2F5C3E]" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
                  <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="text-left text-slate-600 hover:text-[#2F5C3E]">Logout</button>
                </>
              ) : (
                <Link to="/auth" className="text-slate-600 hover:text-[#2F5C3E]" onClick={() => setMobileMenuOpen(false)}>Login</Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
