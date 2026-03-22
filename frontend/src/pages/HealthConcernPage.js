import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { API } from '@/App';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

const HealthConcernPage = () => {
  const { concern } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, [concern]);

  const loadProducts = async () => {
    try {
      const res = await axios.get(`${API}/products?health_concern=${concern}`);
      setProducts(res.data.products);
    } catch (error) {
      console.error('Failed to load products', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8" data-testid="health-concern-page">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#1A2F23] mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
            {concern.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </h1>
          <p className="text-lg text-slate-600">Natural AYUSH remedies for your health concern</p>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-slate-600">No products found for this health concern</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link key={product.id} to={`/products/${product.id}`}>
                <Card className="hover:shadow-lg transition-all hover:-translate-y-1">
                  <CardContent className="p-4">
                    <div className="aspect-square bg-stone-100 rounded-xl mb-3 overflow-hidden">
                      <img 
                        src={product.images[0] || 'https://via.placeholder.com/300'}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="font-medium text-slate-900 mb-1 line-clamp-2">{product.name}</h3>
                    <p className="text-sm text-slate-500 mb-2">{product.brand}</p>
                    <p className="text-lg font-bold text-[#2F5C3E]">₹{product.discount_price || product.price}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default HealthConcernPage;
