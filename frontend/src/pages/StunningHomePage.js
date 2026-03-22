import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API, AuthContext } from '@/App';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, Star, ArrowRight, Search, Sparkles, 
  TrendingUp, Heart, Zap, Gift, Award, Clock, Shield,
  Package, Users, ChevronLeft, ChevronRight, Truck, Headphones,
  Leaf, Activity, Brain, Droplets, Flame, Moon, Plus
} from 'lucide-react';
import { toast } from 'sonner';

const StunningHomePage = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [productsByCategory, setProductsByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollRefs = useRef({});

  // Hero banners for carousel
  const heroBanners = [
    {
      title: "Ayurveda for Modern Life",
      subtitle: "Discover ancient wisdom for today's wellness",
      discount: "FLAT 30% OFF",
      code: "AYUSH30",
      gradient: "from-emerald-500 via-teal-500 to-cyan-500",
      image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600"
    },
    {
      title: "Boost Your Immunity",
      subtitle: "Natural herbal supplements for stronger defense",
      discount: "UP TO 40% OFF",
      code: "IMMUNITY40",
      gradient: "from-orange-500 via-red-500 to-pink-500",
      image: "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=600"
    },
    {
      title: "Homeopathy Solutions",
      subtitle: "Gentle healing for the whole family",
      discount: "BUY 2 GET 1 FREE",
      code: "HOMEO3",
      gradient: "from-purple-500 via-violet-500 to-indigo-500",
      image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600"
    }
  ];

  // Health concern categories with icons
  const healthConcerns = [
    { name: "Immunity", icon: Shield, color: "bg-emerald-500", count: "500+ Products" },
    { name: "Diabetes Care", icon: Droplets, color: "bg-blue-500", count: "300+ Products" },
    { name: "Digestive Health", icon: Flame, color: "bg-orange-500", count: "400+ Products" },
    { name: "Hair & Skin", icon: Sparkles, color: "bg-pink-500", count: "600+ Products" },
    { name: "Joint & Bone", icon: Activity, color: "bg-purple-500", count: "250+ Products" },
    { name: "Mental Wellness", icon: Brain, color: "bg-indigo-500", count: "200+ Products" },
    { name: "Sleep & Stress", icon: Moon, color: "bg-slate-600", count: "150+ Products" },
    { name: "Weight Management", icon: TrendingUp, color: "bg-red-500", count: "350+ Products" },
  ];

  useEffect(() => {
    loadProducts();
    // Auto-slide for hero carousel
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroBanners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadProducts = async () => {
    try {
      const res = await axios.get(`${API}/products?limit=100`);
      const products = res.data.products;
      
      const grouped = {};
      products.forEach(product => {
        if (!grouped[product.category]) {
          grouped[product.category] = [];
        }
        grouped[product.category].push(product);
      });
      
      setProductsByCategory(grouped);
    } catch (error) {
      console.error('Failed to load products', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const addToCart = async (product) => {
    if (!user) {
      toast.error('Please login to add items');
      navigate('/auth');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API}/cart/add`,
        {
          product_id: product.id,
          quantity: 1,
          price: product.discount_price || product.price
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Added to cart!');
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  const scrollCategory = (category, direction) => {
    const container = scrollRefs.current[category];
    if (container) {
      const scrollAmount = 320;
      container.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
    }
  };

  const ProductCard = ({ product }) => {
    const discount = product.discount_price 
      ? Math.round(((product.price - product.discount_price) / product.price) * 100) 
      : 0;
    
    // Extract size/quantity from product name or SKU
    const sizeMatch = product.name?.match(/(\d+\s*(ml|g|tab|cap|pills|gm|mg|kg|l|oz))/i) || 
                      product.sku?.match(/(\d+\s*(ml|g|tab|cap|pills|gm|mg|kg|l|oz))/i);
    const sizeInfo = sizeMatch ? sizeMatch[1] : null;
    
    return (
      <div className="group relative min-w-[130px] w-[130px] md:min-w-[155px] md:w-[155px] snap-start flex-shrink-0" data-testid={`product-card-${product.id}`}>
        <div className="bg-white border border-slate-100 hover:shadow-md transition-all duration-200 h-full">
          {/* Discount Badge - Healthmug Style */}
          {discount > 0 && (
            <div className="absolute top-1 left-1 z-10">
              <span className="bg-orange-500 text-white text-[9px] font-bold px-1 py-0.5 rounded-sm leading-tight inline-block">
                {discount}%<br/>OFF
              </span>
            </div>
          )}

          <Link to={`/products/${product.id}`} className="block">
            {/* Product Image */}
            <div className="relative aspect-square overflow-hidden bg-white p-2">
              <img 
                src={product.images[0] || 'https://via.placeholder.com/150'}
                alt={product.name}
                className="w-full h-full object-contain"
                loading="lazy"
              />
            </div>
          </Link>

          {/* Quick Add Button - Below Image */}
          <div className="flex justify-center -mt-1 mb-1">
            <button
              onClick={(e) => { 
                e.preventDefault(); 
                addToCart(product); 
              }}
              className="w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm hover:border-orange-400 hover:text-orange-500 transition-colors"
              data-testid={`quick-add-btn-${product.id}`}
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          <Link to={`/products/${product.id}`} className="block px-2 pb-2">
            {/* Product Name */}
            <h3 className="text-slate-800 text-[11px] leading-tight mb-1 line-clamp-2 h-7 hover:text-orange-600 transition-colors">
              {product.name}
            </h3>

            {/* Size/Quantity Info */}
            {sizeInfo && (
              <p className="text-[10px] text-slate-400 mb-0.5">{sizeInfo}</p>
            )}

            {/* Price Section - Healthmug Style */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-900">₹{product.discount_price || product.price}</span>
              {product.discount_price && (
                <span className="text-[10px] text-slate-400 line-through">₹{product.price}</span>
              )}
            </div>
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50" data-testid="stunning-homepage">
      <Navbar />

      {/* Announcement Bar */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 py-2.5 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap flex items-center gap-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-8 text-white text-sm font-medium">
              <span className="flex items-center gap-2"><Gift className="h-4 w-4" /> FLAT 25% OFF on First Order • Code: FIRST25</span>
              <span className="flex items-center gap-2"><Truck className="h-4 w-4" /> Free Shipping Above ₹499</span>
              <span className="flex items-center gap-2"><Shield className="h-4 w-4" /> 100% Authentic Products</span>
              <span className="flex items-center gap-2"><Headphones className="h-4 w-4" /> 24/7 Customer Support</span>
            </div>
          ))}
        </div>
      </div>

      {/* Hero Carousel Section */}
      <section className="relative bg-white overflow-hidden" data-testid="hero-section">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Main Hero Banner */}
            <div className="lg:col-span-2 relative rounded-2xl overflow-hidden h-[300px] md:h-[400px]">
              {heroBanners.map((banner, idx) => (
                <div 
                  key={idx}
                  className={`absolute inset-0 transition-opacity duration-700 ${idx === currentSlide ? 'opacity-100' : 'opacity-0'}`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${banner.gradient}`}></div>
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="relative z-10 h-full flex flex-col justify-center p-8 md:p-12 text-white">
                    <Badge className="w-fit mb-4 bg-white/20 backdrop-blur-sm text-white border-white/30 px-4 py-1.5 text-sm font-bold">
                      {banner.discount}
                    </Badge>
                    <h1 className="text-3xl md:text-5xl font-bold mb-3 leading-tight">{banner.title}</h1>
                    <p className="text-lg md:text-xl mb-6 text-white/90">{banner.subtitle}</p>
                    <div className="flex gap-3">
                      <Link to="/products">
                        <Button className="bg-white text-slate-900 hover:bg-white/90 rounded-full px-6 py-2.5 font-semibold shadow-xl">
                          Shop Now <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                      <Badge className="bg-black/30 backdrop-blur-sm text-white border-0 px-4 py-2 text-sm font-mono">
                        Use: {banner.code}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Carousel Dots */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {heroBanners.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${idx === currentSlide ? 'bg-white w-8' : 'bg-white/50'}`}
                    data-testid={`carousel-dot-${idx}`}
                  />
                ))}
              </div>
            </div>

            {/* Side Banners */}
            <div className="flex flex-col gap-4">
              <Link to="/products?category=Immunity" className="relative rounded-xl overflow-hidden h-[140px] md:h-[190px] group">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-500"></div>
                <div className="relative z-10 h-full p-5 text-white flex flex-col justify-between">
                  <div>
                    <p className="text-xs font-semibold opacity-90 mb-1">BESTSELLERS</p>
                    <h3 className="text-xl font-bold">Immunity Boosters</h3>
                  </div>
                  <div className="flex items-center text-sm font-semibold group-hover:translate-x-1 transition-transform">
                    Up to 40% OFF <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </div>
              </Link>
              <Link to="/products?category=Ayurveda" className="relative rounded-xl overflow-hidden h-[140px] md:h-[190px] group">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-purple-600"></div>
                <div className="relative z-10 h-full p-5 text-white flex flex-col justify-between">
                  <div>
                    <p className="text-xs font-semibold opacity-90 mb-1">NEW ARRIVALS</p>
                    <h3 className="text-xl font-bold">Ayurvedic Range</h3>
                  </div>
                  <div className="flex items-center text-sm font-semibold group-hover:translate-x-1 transition-transform">
                    Explore Now <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Search Bar - Mobile Prominent */}
      <section className="bg-white py-4 border-b lg:hidden">
        <div className="container mx-auto px-4">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                type="search"
                placeholder="Search medicines, health conditions..."
                className="h-12 w-full rounded-full bg-slate-100 border-0 pl-12 pr-4 text-base focus:ring-2 focus:ring-emerald-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="mobile-search-input"
              />
            </div>
          </form>
        </div>
      </section>

      {/* Health Concerns Categories */}
      <section className="bg-white py-8" data-testid="health-concerns-section">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Shop by Health Concern</h2>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {healthConcerns.map((concern, idx) => (
              <Link 
                key={idx} 
                to={`/products?search=${encodeURIComponent(concern.name)}`}
                className="flex flex-col items-center group"
                data-testid={`health-concern-${concern.name}`}
              >
                <div className={`${concern.color} w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-lg`}>
                  <concern.icon className="h-6 w-6 md:h-7 md:w-7 text-white" />
                </div>
                <span className="text-xs md:text-sm font-medium text-slate-700 text-center">{concern.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges Strip */}
      <section className="bg-gradient-to-r from-slate-800 to-slate-900 py-4">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-white">
            {[
              { icon: Shield, text: "100% Authentic", sub: "Verified Products" },
              { icon: Truck, text: "Free Delivery", sub: "Above ₹499" },
              { icon: Award, text: "Best Prices", sub: "Guaranteed" },
              { icon: Headphones, text: "24/7 Support", sub: "Expert Help" }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="p-2.5 bg-white/10 rounded-xl">
                  <item.icon className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{item.text}</p>
                  <p className="text-xs text-slate-400">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Category-wise Product Sections with Horizontal Scroll - Healthmug Style */}
      {!loading && Object.keys(productsByCategory).length > 0 && (
        <>
          {Object.entries(productsByCategory).slice(0, 5).map(([category, products], sectionIdx) => (
            <section 
              key={category} 
              className="py-6 bg-white border-b border-slate-100"
              data-testid={`category-section-${category}`}
            >
              <div className="container mx-auto px-4">
                {/* Section Header - Healthmug Style */}
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg md:text-xl font-semibold text-slate-900">{category} Products</h2>
                  <Link 
                    to={`/products?category=${encodeURIComponent(category)}`}
                    className="flex items-center gap-1 text-sm text-slate-600 hover:text-orange-500 transition-colors"
                  >
                    view all
                    <div className="w-4 h-4 rounded-full bg-yellow-400 flex items-center justify-center">
                      <ChevronRight className="h-3 w-3 text-white" />
                    </div>
                  </Link>
                </div>

                {/* Horizontal Scrolling Products */}
                <div 
                  ref={(el) => scrollRefs.current[category] = el}
                  className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {products.slice(0, 10).map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            </section>
          ))}
        </>
      )}

      {/* Top Brands Section */}
      <section className="py-10 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600" data-testid="brands-section">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Top AYUSH Brands</h2>
            <p className="text-emerald-100">UP TO 50% OFF on Premium Brands</p>
          </div>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {['Himalaya', 'Dabur', 'Patanjali', 'Baidyanath', 'Zandu', 'SBL', 'Hamdard', 'Organic India'].map((brand, idx) => (
              <Link 
                key={idx} 
                to={`/products?search=${encodeURIComponent(brand)}`}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex items-center justify-center hover:bg-white/20 transition-all cursor-pointer border border-white/20 hover:scale-105"
                data-testid={`brand-${brand}`}
              >
                <span className="font-bold text-white text-sm text-center">{brand}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white" data-testid="stats-section">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { number: '10K+', label: 'Products', icon: Package, color: 'text-emerald-600 bg-emerald-100' },
              { number: '5L+', label: 'Orders Delivered', icon: Truck, color: 'text-blue-600 bg-blue-100' },
              { number: '50K+', label: 'Happy Customers', icon: Users, color: 'text-purple-600 bg-purple-100' },
              { number: '4.8', label: 'Average Rating', icon: Star, color: 'text-orange-600 bg-orange-100' }
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className={`w-16 h-16 mx-auto mb-3 ${stat.color} rounded-2xl flex items-center justify-center`}>
                  <stat.icon className="h-8 w-8" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-slate-800 mb-1">{stat.number}</div>
                <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Consultation Redirect CTA */}
      <section className="py-12 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500" data-testid="consultation-cta">
        <div className="container mx-auto px-4 text-center text-white">
          <Badge className="mb-4 bg-white/20 backdrop-blur-sm text-white border-0 px-4 py-1.5">
            <Sparkles className="w-4 h-4 mr-2 inline" />
            Healthcare Consultation
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Consult AYUSH Doctors Online</h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            500+ Certified Doctors • Video/Audio Consultation • Get Prescription Online
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a href="https://consult.ayushmednest.com" target="_blank" rel="noopener noreferrer">
              <Button className="bg-white text-purple-600 hover:bg-white/90 rounded-full px-8 py-6 text-lg font-bold shadow-xl" data-testid="consult-now-btn">
                Consult Now <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-10 bg-slate-100" data-testid="newsletter-section">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Stay Updated with Health Tips & Offers</h3>
            <p className="text-slate-600 mb-6">Subscribe to get exclusive discounts and wellness tips</p>
            <form className="flex gap-2 max-w-md mx-auto">
              <Input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-1 h-12 rounded-full border-slate-200"
                data-testid="newsletter-email"
              />
              <Button className="bg-emerald-600 hover:bg-emerald-700 rounded-full px-6 h-12 font-semibold" data-testid="newsletter-submit">
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </section>

      <Footer />

      {/* Custom CSS for marquee animation */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default StunningHomePage;
