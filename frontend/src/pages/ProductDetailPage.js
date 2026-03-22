import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API, AuthContext } from '@/App';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingCart, Heart, Share2, Star } from 'lucide-react';
import { toast } from 'sonner';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      const res = await axios.get(`${API}/products/${id}`);
      setProduct(res.data);
    } catch (error) {
      toast.error('Product not found');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async () => {
    if (!user) {
      toast.error('Please login to add items to cart');
      navigate('/auth');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API}/cart/add`,
        {
          product_id: product.id,
          quantity: quantity,
          price: product.discount_price || product.price
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Added to cart!');
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">Loading...</div>
      </div>
    );
  }

  if (!product) return null;

  const finalPrice = product.discount_price || product.price;
  const discount = product.discount_price ? Math.round(((product.price - product.discount_price) / product.price) * 100) : 0;

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8" data-testid="product-detail-page">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Product Images */}
          <div>
            <div className="aspect-square bg-white rounded-2xl overflow-hidden shadow-lg mb-4">
              <img 
                src={product.images[0] || 'https://via.placeholder.com/600'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Product Info */}
          <div>
            <Badge className="mb-3 bg-[#E8F3EA] text-[#2F5C3E]">{product.ayush_system.toUpperCase()}</Badge>
            <h1 className="text-3xl md:text-4xl font-bold text-[#1A2F23] mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
              {product.name}
            </h1>
            <p className="text-lg text-slate-600 mb-4">{product.brand}</p>

            <div className="flex items-center gap-2 mb-6">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-5 w-5 ${i < product.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} />
                ))}
              </div>
              <span className="text-sm text-slate-600">({product.reviews_count} reviews)</span>
            </div>

            <div className="flex items-baseline gap-3 mb-6">
              <p className="text-4xl font-bold text-[#2F5C3E]">₹{finalPrice}</p>
              {discount > 0 && (
                <>
                  <p className="text-2xl text-slate-400 line-through">₹{product.price}</p>
                  <Badge className="bg-green-500 text-white">{discount}% OFF</Badge>
                </>
              )}
            </div>

            <div className="mb-6">
              <p className="text-sm text-slate-600 mb-2">Quantity</p>
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  data-testid="decrease-quantity"
                >
                  -
                </Button>
                <span className="text-lg font-medium w-12 text-center" data-testid="quantity-display">{quantity}</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setQuantity(quantity + 1)}
                  data-testid="increase-quantity"
                >
                  +
                </Button>
              </div>
            </div>

            <div className="flex gap-4 mb-8">
              <Button 
                onClick={addToCart}
                className="flex-1 bg-[#2F5C3E] hover:bg-[#244A30] text-white rounded-full h-12 text-lg"
                data-testid="add-to-cart-button"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
              <Button variant="outline" size="icon" className="rounded-full h-12 w-12">
                <Heart className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full h-12 w-12">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            {product.is_prescription_required && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-yellow-800">⚠️ Prescription required for this product</p>
              </div>
            )}

            <div className="bg-[#E8F3EA] rounded-xl p-4">
              <p className="text-sm text-slate-700"><strong>Stock:</strong> {product.stock > 0 ? `${product.stock} units available` : 'Out of stock'}</p>
              <p className="text-sm text-slate-700 mt-1"><strong>SKU:</strong> {product.sku}</p>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <Tabs defaultValue="description">
              <TabsList>
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="benefits">Benefits</TabsTrigger>
                <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="mt-6">
                <p className="text-slate-600 leading-relaxed">{product.description}</p>
              </TabsContent>

              <TabsContent value="benefits" className="mt-6">
                <ul className="space-y-2">
                  {product.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-[#2F5C3E] mr-2">✓</span>
                      <span className="text-slate-600">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </TabsContent>

              <TabsContent value="ingredients" className="mt-6">
                <div className="flex flex-wrap gap-2">
                  {product.ingredients.map((ingredient, idx) => (
                    <Badge key={idx} variant="secondary" className="px-3 py-1">{ingredient}</Badge>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetailPage;
