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
import { ShoppingCart, Heart, Share2, Star, Truck, RotateCcw, Shield, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const VariantProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState({ grouped: {}, variants: [] });
  const [selectedVariants, setSelectedVariants] = useState({});
  const [selectedImage, setSelectedImage] = useState('');
  const [currentPrice, setCurrentPrice] = useState(0);
  const [currentStock, setCurrentStock] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      const [productRes, variantsRes] = await Promise.all([
        axios.get(`${API}/products/${id}`),
        axios.get(`${API}/products/${id}/variants`)
      ]);
      
      setProduct(productRes.data);
      setVariants(variantsRes.data);
      setSelectedImage(productRes.data.images[0]);
      setCurrentPrice(productRes.data.discount_price || productRes.data.price);
      setCurrentStock(productRes.data.stock);

      // Set default variants
      const defaults = {};
      if (variantsRes.data.grouped) {
        Object.keys(variantsRes.data.grouped).forEach(type => {
          const defaultVariant = variantsRes.data.grouped[type].find(v => v.is_default) 
            || variantsRes.data.grouped[type][0];
          if (defaultVariant) {
            defaults[type] = defaultVariant.id;
          }
        });
      }
      setSelectedVariants(defaults);
    } catch (error) {
      toast.error('Product not found');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleVariantSelect = (variantType, variantId) => {
    setSelectedVariants({
      ...selectedVariants,
      [variantType]: variantId
    });

    // Update price and image based on selected variant
    const selectedVariant = variants.variants.find(v => v.id === variantId);
    if (selectedVariant) {
      setCurrentPrice(selectedVariant.discount_price || selectedVariant.price);
      setCurrentStock(selectedVariant.stock);
      if (selectedVariant.image_url) {
        setSelectedImage(selectedVariant.image_url);
      }
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
          price: currentPrice
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Added to cart!');
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  const addToWishlist = async () => {
    if (!user) {
      toast.error('Please login');
      navigate('/auth');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/wishlist/add/${product.id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Added to wishlist!');
    } catch (error) {
      toast.error('Failed to add to wishlist');
    }
  };

  if (loading || !product) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">Loading...</div>
      </div>
    );
  }

  const discount = product.discount_price 
    ? Math.round(((product.price - product.discount_price) / product.price) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <div className="text-sm text-slate-600 mb-6">
          Home &gt; {product.category} &gt; {product.name}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Left: Product Images */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <div className="aspect-square bg-white rounded-2xl overflow-hidden shadow-lg mb-4 border border-slate-100">
                <img 
                  src={selectedImage || product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-contain p-6"
                />
              </div>
              
              {/* Thumbnail Images */}
              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((img, idx) => (
                    <div 
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      className={`aspect-square bg-white rounded-lg overflow-hidden cursor-pointer border-2 ${selectedImage === img ? 'border-[#2F5C3E]' : 'border-slate-200'}`}
                    >
                      <img src={img} alt="" className="w-full h-full object-contain p-2" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Middle: Product Details */}
          <div className="lg:col-span-1">
            <div className="mb-3">
              <Badge className="bg-[#E8F3EA] text-[#2F5C3E] mb-2">{product.brand}</Badge>
              {product.rating >= 4.5 && (
                <Badge className="bg-yellow-100 text-yellow-800 ml-2">Bestseller</Badge>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-[#1A2F23] mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
              {product.name}
            </h1>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < product.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} />
                ))}
              </div>
              <span className="text-sm text-slate-600">({product.reviews_count} reviews)</span>
            </div>

            <div className="bg-stone-100 p-4 rounded-xl mb-6">
              <div className="flex items-baseline gap-3 mb-2">
                <p className="text-3xl font-bold text-[#2F5C3E]">₹{currentPrice}</p>
                {discount > 0 && (
                  <>
                    <p className="text-xl text-slate-400 line-through">₹{product.price}</p>
                    <Badge className="bg-orange-500 text-white">{discount}% OFF</Badge>
                  </>
                )}
              </div>
              <p className="text-xs text-slate-500">Inclusive of all taxes</p>
            </div>

            {/* Variant Selectors */}
            {variants.grouped && Object.keys(variants.grouped).length > 0 && (
              <div className="space-y-6 mb-6">
                {Object.entries(variants.grouped).map(([variantType, variantOptions]) => (
                  <div key={variantType}>
                    <h3 className="font-semibold text-sm mb-3 uppercase tracking-wide text-slate-700">
                      Select {variantType}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {variantOptions.map((variant) => (
                        <button
                          key={variant.id}
                          onClick={() => handleVariantSelect(variantType, variant.id)}
                          className={`p-3 border-2 rounded-lg transition-all ${
                            selectedVariants[variantType] === variant.id
                              ? 'border-[#2F5C3E] bg-[#E8F3EA]'
                              : 'border-slate-200 hover:border-[#2F5C3E]/50'
                          }`}
                        >
                          <p className="font-semibold text-sm">{variant.variant_name}</p>
                          <p className="text-xs text-slate-600">₹{variant.discount_price || variant.price}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Stock Warning */}
            {currentStock < 5 && currentStock > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-6 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0" />
                <p className="text-sm text-orange-800">
                  Only {currentStock} left at this price!
                </p>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="mb-6">
              <p className="text-sm font-medium mb-2">Quantity</p>
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="h-10 w-10"
                >
                  -
                </Button>
                <span className="text-lg font-medium w-12 text-center">{quantity}</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                  className="h-10 w-10"
                >
                  +
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mb-6">
              <Button 
                onClick={addToCart}
                disabled={currentStock === 0}
                className="flex-1 bg-[#2F5C3E] hover:bg-[#244A30] text-white h-12 text-lg rounded-xl"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {currentStock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </Button>
              <Button 
                onClick={addToWishlist}
                variant="outline" 
                size="icon" 
                className="h-12 w-12 rounded-xl"
              >
                <Heart className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-white rounded-lg border border-slate-100">
                <Truck className="h-5 w-5 text-[#2F5C3E] mx-auto mb-1" />
                <p className="text-xs text-slate-600">Free Delivery</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border border-slate-100">
                <RotateCcw className="h-5 w-5 text-[#2F5C3E] mx-auto mb-1" />
                <p className="text-xs text-slate-600">7 Days Return</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border border-slate-100">
                <Shield className="h-5 w-5 text-[#2F5C3E] mx-auto mb-1" />
                <p className="text-xs text-slate-600">100% Authentic</p>
              </div>
            </div>
          </div>

          {/* Right: Additional Info */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Delivery Information</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <Truck className="h-4 w-4 text-[#2F5C3E] mt-0.5" />
                    <div>
                      <p className="font-medium">Standard Delivery</p>
                      <p className="text-slate-600">4-6 days</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-[#2F5C3E] mt-0.5" />
                    <div>
                      <p className="font-medium">Guaranteed Refunds</p>
                      <p className="text-slate-600">Returns available within 7 days</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Product Details Tabs */}
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <Tabs defaultValue="description">
              <TabsList className="mb-6">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="benefits">Benefits</TabsTrigger>
                <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
                <TabsTrigger value="specifications">Specifications</TabsTrigger>
              </TabsList>

              <TabsContent value="description">
                <p className="text-slate-600 leading-relaxed">{product.description}</p>
              </TabsContent>

              <TabsContent value="benefits">
                <ul className="space-y-2">
                  {product.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-[#2F5C3E] mr-2">✓</span>
                      <span className="text-slate-600">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </TabsContent>

              <TabsContent value="ingredients">
                <div className="flex flex-wrap gap-2">
                  {product.ingredients.map((ingredient, idx) => (
                    <Badge key={idx} variant="secondary" className="px-3 py-1">{ingredient}</Badge>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="specifications">
                <table className="w-full">
                  <tbody>
                    <tr className="border-b">
                      <td className="py-3 font-medium">Brand</td>
                      <td className="py-3 text-slate-600">{product.brand}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 font-medium">Category</td>
                      <td className="py-3 text-slate-600">{product.category}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 font-medium">AYUSH System</td>
                      <td className="py-3 text-slate-600">{product.ayush_system}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 font-medium">SKU</td>
                      <td className="py-3 text-slate-600">{product.sku}</td>
                    </tr>
                  </tbody>
                </table>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default VariantProductDetail;
