import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { API } from '@/App';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Filter } from 'lucide-react';

const ProductListPage = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: '',
    ayush_system: '',
    min_price: 0,
    max_price: 5000
  });
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadProducts();
  }, [filters]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.ayush_system && filters.ayush_system !== 'all') params.append('ayush_system', filters.ayush_system);
      if (filters.min_price) params.append('min_price', filters.min_price);
      if (filters.max_price) params.append('max_price', filters.max_price);
      
      const res = await axios.get(`${API}/products?${params.toString()}`);
      setProducts(res.data.products);
      setTotal(res.data.total);
    } catch (error) {
      console.error('Failed to load products', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-[#1A2F23] mb-8" style={{ fontFamily: 'Outfit, sans-serif' }} data-testid="products-page-title">
          AYUSH Medicines
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1" data-testid="filters-sidebar">
            <Card className="sticky top-20">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="h-5 w-5 text-[#2F5C3E]" />
                  <h2 className="text-lg font-semibold">Filters</h2>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">AYUSH System</label>
                  <Select value={filters.ayush_system} onValueChange={(v) => setFilters({...filters, ayush_system: v})}>
                    <SelectTrigger data-testid="system-filter">
                      <SelectValue placeholder="All Systems" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Systems</SelectItem>
                      <SelectItem value="ayurveda">Ayurveda</SelectItem>
                      <SelectItem value="homeopathy">Homeopathy</SelectItem>
                      <SelectItem value="unani">Unani</SelectItem>
                      <SelectItem value="siddha">Siddha</SelectItem>
                      <SelectItem value="yoga">Yoga</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Price Range: ₹{filters.min_price} - ₹{filters.max_price}</label>
                  <Slider
                    value={[filters.max_price]}
                    onValueChange={([v]) => setFilters({...filters, max_price: v})}
                    max={5000}
                    step={100}
                    data-testid="price-slider"
                  />
                </div>

                <Button 
                  onClick={loadProducts}
                  className="w-full bg-[#2F5C3E] hover:bg-[#244A30] rounded-full"
                  data-testid="apply-filters-button"
                >
                  Apply Filters
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            <div className="mb-4 text-sm text-slate-600">
              Showing {products.length} of {total} products
            </div>

            {loading ? (
              <div className="text-center py-12">Loading products...</div>
            ) : products.length === 0 ? (
              <div className="text-center py-12 text-slate-600">No products found</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="products-grid">
                {products.map((product) => (
                  <Link key={product.id} to={`/products/${product.id}`}>
                    <Card className="group hover:shadow-lg transition-all hover:-translate-y-1" data-testid={`product-${product.id}`}>
                      <CardContent className="p-4">
                        <div className="aspect-square bg-stone-100 rounded-xl mb-3 overflow-hidden">
                          <img 
                            src={product.images[0] || 'https://via.placeholder.com/300'}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <h3 className="font-medium text-slate-900 mb-1 line-clamp-2">{product.name}</h3>
                        <p className="text-sm text-slate-500 mb-2">{product.brand}</p>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-lg font-bold text-[#2F5C3E]">₹{product.discount_price || product.price}</p>
                            {product.discount_price && (
                              <p className="text-xs text-slate-400 line-through">₹{product.price}</p>
                            )}
                          </div>
                          <Button size="sm" className="bg-[#2F5C3E] hover:bg-[#244A30] rounded-full">View</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductListPage;
