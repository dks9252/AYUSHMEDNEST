import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { API, AuthContext } from '@/App';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, Heart, Share2, Star, Truck, RotateCcw, Shield, 
  AlertCircle, ChevronRight, MapPin, Package, Clock, ChevronDown,
  Plus, Minus, HelpCircle, FileText, MessageSquare, Info
} from 'lucide-react';
import { toast } from 'sonner';

const HealthmugProductDetail = () => {
  const { id, variantSlug } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState({ grouped: {}, variants: [] });
  const [selectedVariants, setSelectedVariants] = useState({});
  const [selectedImage, setSelectedImage] = useState(0);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [currentMRP, setCurrentMRP] = useState(0);
  const [currentStock, setCurrentStock] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showMorePotency, setShowMorePotency] = useState(false);
  const [pincode, setPincode] = useState('');
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [questions, setQuestions] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  // Check if product has variants
  const hasVariants = variants.variants && variants.variants.length > 0;

  useEffect(() => {
    loadProduct();
  }, [id, variantSlug]);

  const loadProduct = async () => {
    try {
      const [productRes, variantsRes, questionsRes, reviewsRes] = await Promise.all([
        axios.get(`${API}/products/${id}`),
        axios.get(`${API}/products/${id}/variants`),
        axios.get(`${API}/products/${id}/questions`),
        axios.get(`${API}/products/${id}/reviews`)
      ]);
      
      const productData = productRes.data;
      setProduct(productData);
      setVariants(variantsRes.data);
      setCurrentPrice(productData.discount_price || productData.price);
      setCurrentMRP(productData.price);
      setCurrentStock(productData.stock);

      // Load related products based on category/health concerns
      loadRelatedProducts(productData.category, productData.health_concerns);

      // Set default variants based on URL slug or first available
      const defaults = {};
      if (variantsRes.data.grouped && Object.keys(variantsRes.data.grouped).length > 0) {
        Object.keys(variantsRes.data.grouped).forEach(type => {
          // Check if URL has variant slug
          let matchedVariant = null;
          if (variantSlug) {
            matchedVariant = variantsRes.data.grouped[type].find(v => 
              v.variant_name.toLowerCase().replace(/\s+/g, '-') === variantSlug.toLowerCase()
            );
          }
          
          const defaultVariant = matchedVariant || 
            variantsRes.data.grouped[type].find(v => v.is_default) || 
            variantsRes.data.grouped[type][0];
          
          if (defaultVariant) {
            defaults[type] = defaultVariant.id;
            // Update price if variant matched from URL
            if (matchedVariant) {
              setCurrentPrice(matchedVariant.discount_price || matchedVariant.price);
              setCurrentMRP(matchedVariant.price);
              setCurrentStock(matchedVariant.stock);
            }
          }
        });
      }
      setSelectedVariants(defaults);
      setQuestions(questionsRes.data.questions || []);
      setReviews(reviewsRes.data.reviews || []);
    } catch (error) {
      toast.error('Product not found');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const loadRelatedProducts = async (category, healthConcerns) => {
    try {
      const res = await axios.get(`${API}/products?category=${encodeURIComponent(category)}&limit=6`);
      setRelatedProducts(res.data.products.filter(p => p.id !== id).slice(0, 4));
    } catch (error) {
      console.error('Failed to load related products');
    }
  };

  const handleVariantSelect = (variantType, variant) => {
    setSelectedVariants({
      ...selectedVariants,
      [variantType]: variant.id
    });

    // Update price, stock
    if (variant.discount_price || variant.price) {
      setCurrentPrice(variant.discount_price || variant.price);
      setCurrentMRP(variant.price);
    }
    if (variant.stock !== undefined) {
      setCurrentStock(variant.stock);
    }

    // Update URL for SEO (without page reload)
    const newSlug = variant.variant_name.toLowerCase().replace(/\s+/g, '-');
    window.history.replaceState(null, '', `/products/${id}/${newSlug}`);
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
          price: currentPrice,
          variant_info: selectedVariants
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Added to cart!');
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  const buyNow = async () => {
    await addToCart();
    navigate('/cart');
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

  const checkDelivery = () => {
    if (pincode.length === 6) {
      setDeliveryInfo({
        available: true,
        days: '4-6',
        cod: true
      });
    }
  };

  // Submit a question
  const submitQuestion = async () => {
    if (!user) {
      toast.error('Please login to ask a question');
      navigate('/auth');
      return;
    }

    if (!questionText.trim()) {
      toast.error('Please enter your question');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/products/${id}/questions`, 
        { question: questionText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Question submitted! It will appear after admin approval.');
      setQuestionText('');
      setShowQuestionModal(false);
    } catch (error) {
      toast.error('Failed to submit question');
    }
  };

  // Submit a review
  const submitReview = async () => {
    if (!user) {
      toast.error('Please login to write a review');
      navigate('/auth');
      return;
    }

    if (!reviewForm.comment.trim()) {
      toast.error('Please write your review');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/products/${id}/reviews`, reviewForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Review submitted! It will appear after admin approval.');
      setReviewForm({ rating: 5, title: '', comment: '' });
      setShowReviewModal(false);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to submit review');
    }
  };

  const calculatePricePerUnit = (price, size) => {
    const match = size?.match(/(\d+)/);
    if (match) {
      const units = parseInt(match[1]);
      return Math.round((price / units) * 100);
    }
    return null;
  };

  // Generate FAQ based on product data
  const generateFAQ = () => {
    if (!product) return [];
    return [
      {
        question: `What is ${product.name} used for?`,
        answer: product.description || `${product.name} is a ${product.ayush_system} medicine used for various health conditions. ${product.benefits?.length > 0 ? `It helps with: ${product.benefits.join(', ')}.` : ''}`
      },
      {
        question: `How to use ${product.name}?`,
        answer: `Follow the dosage instructions on the package or as directed by your healthcare provider. For ${product.ayush_system} medicines, it's recommended to consult a qualified practitioner for personalized guidance.`
      },
      {
        question: `Are there any side effects of ${product.name}?`,
        answer: `${product.ayush_system} medicines are generally safe when taken as directed. However, individual responses may vary. If you experience any unusual symptoms, discontinue use and consult a healthcare provider.`
      },
      {
        question: `Can I take ${product.name} with other medicines?`,
        answer: `${product.ayush_system} medicines typically don't interfere with other medications. However, we recommend consulting your healthcare provider before combining any medicines.`
      },
      {
        question: `What is the shelf life of ${product.name}?`,
        answer: `Please check the expiry date on the product packaging. Store in a cool, dry place away from direct sunlight.`
      }
    ];
  };

  // Health concerns images mapping
  const healthConcernImages = {
    'immunity': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200',
    'cold-cough': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200',
    'diabetes': 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=200',
    'skin': 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=200',
    'hair': 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=200',
    'joint-pain': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=200',
    'digestion': 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=200',
    'stress': 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=200',
    'default': 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=200'
  };

  if (loading || !product) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="container mx-auto px-4 py-20">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-4 bg-slate-100 aspect-square rounded-lg"></div>
              <div className="lg:col-span-5 space-y-4">
                <div className="h-8 bg-slate-100 rounded w-3/4"></div>
                <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                <div className="h-12 bg-slate-100 rounded w-1/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const discount = currentMRP > currentPrice 
    ? Math.round(((currentMRP - currentPrice) / currentMRP) * 100) 
    : 0;

  const images = product.images?.length > 0 ? product.images : ['https://via.placeholder.com/400'];
  const faqs = generateFAQ();

  return (
    <div className="min-h-screen bg-white" data-testid="product-detail-page">
      <Navbar />
      
      {/* Breadcrumb */}
      <div className="bg-slate-50 border-b">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center text-sm text-slate-600" data-testid="breadcrumb">
            <Link to="/" className="hover:text-orange-500">Home</Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <Link to={`/products?category=${product.category}`} className="hover:text-orange-500">{product.category}</Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <span className="text-slate-900 font-medium truncate max-w-[200px]">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column - Product Images */}
          <div className="lg:col-span-4">
            <div className="sticky top-24">
              {/* Main Image */}
              <div className="relative bg-white border border-slate-200 rounded-lg overflow-hidden mb-4">
                <button 
                  onClick={addToWishlist}
                  className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                  data-testid="wishlist-btn"
                >
                  <Heart className="h-5 w-5 text-slate-400 hover:text-red-500 transition-colors" />
                </button>
                
                <div className="aspect-square p-8">
                  <img 
                    src={images[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-contain"
                    data-testid="main-product-image"
                  />
                </div>
              </div>
              
              {/* Thumbnail Images */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`flex-shrink-0 w-16 h-16 border-2 rounded-lg overflow-hidden transition-all ${
                        selectedImage === idx ? 'border-orange-500' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-contain p-1" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Middle Column - Product Details */}
          <div className="lg:col-span-5">
            {/* Brand & Title */}
            <div className="mb-4">
              <h1 className="text-xl md:text-2xl font-semibold text-slate-900 mb-2 leading-tight" data-testid="product-title">
                {product.name}
              </h1>
              <p className="text-slate-600 text-sm">{product.description?.substring(0, 150)}...</p>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-4 w-4 ${i < Math.floor(product.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} 
                  />
                ))}
              </div>
              <span className="text-sm text-slate-600">({product.reviews_count || 0} reviews)</span>
              <button className="text-sm text-orange-500 hover:underline ml-2">Be the first to review</button>
            </div>

            {/* Price Section */}
            <div className="mb-6 bg-slate-50 p-4 rounded-lg">
              <p className="text-xs text-slate-500 mb-1">MRP</p>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-slate-900" data-testid="current-price">₹{currentPrice}</span>
                {discount > 0 && (
                  <Badge className="bg-orange-500 text-white text-sm px-2 py-1" data-testid="discount-badge">
                    {discount}% OFF
                  </Badge>
                )}
              </div>
              {discount > 0 && (
                <p className="text-sm text-slate-500 mt-1">
                  <span className="line-through">₹{currentMRP}</span>
                </p>
              )}
              <p className="text-xs text-slate-500 mt-1">(Inclusive of all taxes)</p>
            </div>

            {/* Stock Warning */}
            {currentStock > 0 && currentStock <= 5 && (
              <div className="mb-6">
                <span className="inline-block border border-orange-400 text-orange-600 text-sm px-3 py-1.5 rounded" data-testid="stock-warning">
                  Only {currentStock} left at this price
                </span>
              </div>
            )}

            {/* Variant Selectors - Only show if product has variants */}
            {hasVariants && Object.keys(variants.grouped).length > 0 && (
              <div className="space-y-6 mb-6">
                {Object.entries(variants.grouped).map(([variantType, variantOptions]) => {
                  const displayOptions = variantType.toLowerCase() === 'potency' && !showMorePotency 
                    ? variantOptions.slice(0, 4) 
                    : variantOptions;
                  const hasMore = variantType.toLowerCase() === 'potency' && variantOptions.length > 4;
                  
                  return (
                    <div key={variantType} data-testid={`variant-selector-${variantType}`}>
                      <h3 className="text-sm font-medium text-slate-700 mb-3">
                        Select from available {variantType}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {displayOptions.map((variant) => {
                          const isSelected = selectedVariants[variantType] === variant.id;
                          const pricePerUnit = calculatePricePerUnit(variant.discount_price || variant.price, variant.variant_name);
                          
                          return (
                            <button
                              key={variant.id}
                              onClick={() => handleVariantSelect(variantType, variant)}
                              className={`relative px-4 py-3 border-2 rounded-lg transition-all min-w-[80px] ${
                                isSelected
                                  ? 'border-orange-500 bg-orange-50'
                                  : 'border-slate-200 bg-white hover:border-slate-300'
                              }`}
                              data-testid={`variant-${variant.id}`}
                            >
                              <div className="text-sm font-semibold text-slate-900">
                                {variant.variant_name}
                              </div>
                              <div className={`text-sm font-medium ${isSelected ? 'text-orange-600' : 'text-slate-700'}`}>
                                ₹{variant.discount_price || variant.price}
                              </div>
                              {pricePerUnit && (
                                <div className="text-xs text-slate-500">
                                  ₹{pricePerUnit}/100 ml
                                </div>
                              )}
                            </button>
                          );
                        })}
                        
                        {hasMore && !showMorePotency && (
                          <button
                            onClick={() => setShowMorePotency(true)}
                            className="px-4 py-3 border-2 border-dashed border-orange-300 rounded-lg text-orange-500 hover:bg-orange-50 transition-all min-w-[80px]"
                            data-testid="show-more-variants"
                          >
                            <div className="text-2xl font-light">+</div>
                            <div className="text-sm">{variantOptions.length - 4} more</div>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Quantity Selector */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-slate-700 mb-2">Quantity</h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 border border-slate-300 rounded flex items-center justify-center hover:bg-slate-50"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 border border-slate-300 rounded flex items-center justify-center hover:bg-slate-50"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Product Specifications */}
            <div className="border-t pt-6 mt-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Product Specifications</h2>
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b">
                    <td className="py-3 text-slate-600 font-medium w-1/3">Other Properties</td>
                    <td className="py-3 text-slate-600">
                      <div className="text-xs text-slate-400">System</div>
                      <div className="capitalize">{product.ayush_system}</div>
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 text-slate-600 font-medium">General Properties</td>
                    <td className="py-3">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-slate-600">
                        <div>
                          <div className="text-xs text-slate-400">Pack Size</div>
                          <div>1</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-400">Brand</div>
                          <div>{product.brand}</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-400">Category</div>
                          <div>{product.category}</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-400">Origin</div>
                          <div>India</div>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Product Details - Rich Content */}
            <div className="border-t pt-6 mt-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Product Details</h2>
              
              {/* Also Known As */}
              {product.name && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-slate-800 mb-1">Also known as:</h3>
                  <p className="text-sm text-slate-600">{product.name.split(' ')[0]}</p>
                </div>
              )}

              {/* Description */}
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-slate-800 mb-2">{product.brand} {product.name.split(' ').slice(-1)[0]}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{product.description}</p>
              </div>

              {/* Benefits / Indications */}
              {product.benefits && product.benefits.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-slate-800 mb-2">Indications for {product.name}</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-slate-600">
                    {product.benefits.map((benefit, idx) => (
                      <li key={idx}>{benefit}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Side Effects */}
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-slate-800 mb-2">Side effects of {product.name}</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-slate-600">
                  <li>There are no such side effects. But every medicine should be taken following the rules as given.</li>
                  <li>It is safe to take the medicine even if you are on other modes of medication like allopathy medicines, ayurvedic, etc.</li>
                  <li>{product.ayush_system} medicines never interfere with the action of other medicines.</li>
                </ul>
              </div>

              {/* Dosage */}
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-slate-800 mb-2">Dosage of {product.name}</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-slate-600">
                  <li>Take as directed on the package or as advised by your healthcare practitioner.</li>
                </ul>
              </div>

              {/* Precautions */}
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-slate-800 mb-2">Precautions while taking {product.name}</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-slate-600">
                  <li>Read the label carefully before use</li>
                  <li>Do not exceed the recommended dosage</li>
                  <li>Keep out of the reach of children</li>
                  <li>Use under medical supervision</li>
                  <li>Store in a cool dry place away from direct sunlight and heat</li>
                </ul>
              </div>

              {/* Terms and Conditions */}
              <div className="mb-4 bg-slate-50 p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-slate-800 mb-2">Terms and Conditions</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {product.ayush_system} products have several uses and should be taken on the basis of symptom similarity. 
                  Results may vary depending upon the conditions. We recommend consulting your physician before purchasing 
                  this medicine and abstain from self medication.
                </p>
              </div>
            </div>

            {/* Useful In Section - Based on Health Concerns */}
            {product.health_concerns && product.health_concerns.length > 0 && (
              <div className="border-t pt-6 mt-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Useful in</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {product.health_concerns.slice(0, 4).map((concern, idx) => (
                    <Link 
                      key={idx} 
                      to={`/products?search=${encodeURIComponent(concern)}`}
                      className="relative rounded-lg overflow-hidden group"
                    >
                      <img 
                        src={healthConcernImages[concern.toLowerCase()] || healthConcernImages.default}
                        alt={concern}
                        className="w-full h-24 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                      <div className="absolute bottom-2 left-2 right-2">
                        <span className="text-white text-sm font-medium capitalize">{concern.replace('-', ' ')}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Questions & Answers (FAQ) */}
            <div className="border-t pt-6 mt-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Questions & Answers</h2>
              <div className="space-y-3">
                {faqs.map((faq, idx) => (
                  <div key={idx} className="border rounded-lg overflow-hidden">
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
                    >
                      <span className="text-sm font-medium text-slate-800">{faq.question}</span>
                      <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${expandedFaq === idx ? 'rotate-180' : ''}`} />
                    </button>
                    {expandedFaq === idx && (
                      <div className="px-4 pb-4 text-sm text-slate-600 bg-slate-50">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* User Questions */}
              {questions.length > 0 && (
                <div className="mt-4 space-y-3">
                  <h4 className="text-sm font-medium text-slate-700">Customer Questions</h4>
                  {questions.map((q, idx) => (
                    <div key={idx} className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-slate-800">Q: {q.question}</p>
                      {q.answers && q.answers.length > 0 && (
                        <div className="mt-2 pl-4 border-l-2 border-orange-300">
                          {q.answers.map((a, aidx) => (
                            <p key={aidx} className="text-sm text-slate-600">
                              <span className="font-medium">{a.is_admin ? 'Admin: ' : 'Answer: '}</span>
                              {a.answer}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <button 
                onClick={() => setShowQuestionModal(true)}
                className="mt-4 text-sm text-orange-500 border border-orange-500 px-4 py-2 rounded hover:bg-orange-50"
              >
                {questions.length > 0 ? 'Ask a Question' : 'Be the first to ask a question'}
              </button>
            </div>

            {/* Ratings & Reviews */}
            <div className="border-t pt-6 mt-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Ratings & Reviews</h2>
              
              {/* Existing Reviews */}
              {reviews.length > 0 ? (
                <div className="space-y-4 mb-4">
                  {reviews.map((review, idx) => (
                    <div key={idx} className="border-b pb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} 
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium text-slate-900">{review.title}</span>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{review.comment}</p>
                      <p className="text-xs text-slate-400">By {review.user_name} on {new Date(review.created_at).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-600 mb-3">Be the first to Rate & Review this product</p>
              )}
              
              <button 
                onClick={() => setShowReviewModal(true)}
                className="text-sm text-orange-500 border border-orange-500 px-4 py-2 rounded hover:bg-orange-50"
              >
                {reviews.length > 0 ? 'Write a Review' : 'Rate and Review Product'}
              </button>
            </div>

            {/* Other Information */}
            <div className="border-t pt-6 mt-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Other Information</h2>
              <div className="space-y-4 text-sm">
                <div>
                  <h3 className="font-medium text-slate-800 mb-1">Manufacturer / Marketer address</h3>
                  <p className="text-slate-600">{product.brand}</p>
                  <p className="text-slate-500 text-xs">India</p>
                </div>
                <div>
                  <h3 className="font-medium text-slate-800 mb-1">Country of Origin</h3>
                  <p className="text-slate-600">India</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sticky Purchase Box */}
          <div className="lg:col-span-3">
            <div className="sticky top-24">
              <Card className="border border-slate-200 shadow-lg">
                <CardContent className="p-4">
                  {/* Brand Info */}
                  <div className="flex items-center gap-3 pb-4 border-b mb-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                      <Package className="h-6 w-6 text-slate-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{product.brand} products</p>
                      <Link to={`/products?search=${product.brand}`} className="text-sm text-orange-500 hover:underline">
                        View All
                      </Link>
                    </div>
                    <div className="ml-auto text-right">
                      <Badge className="bg-green-100 text-green-700 text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        10 Sold Recently
                      </Badge>
                    </div>
                  </div>

                  {/* Price in Sidebar */}
                  <div className="mb-4">
                    <p className="text-xs text-slate-500 mb-1">MRP</p>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-slate-900">₹{currentPrice}</span>
                      {discount > 0 && (
                        <Badge className="bg-orange-500 text-white text-xs">{discount}% OFF</Badge>
                      )}
                    </div>
                    {discount > 0 && (
                      <p className="text-sm text-slate-500 line-through">₹{currentMRP}</p>
                    )}
                    <p className="text-xs text-slate-500">(Inclusive of all taxes)</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mb-4">
                    <Button 
                      onClick={buyNow}
                      disabled={currentStock === 0}
                      className="flex-1 bg-orange-500 hover:bg-orange-600 text-white h-11 rounded-lg font-semibold"
                      data-testid="buy-now-btn"
                    >
                      Buy Now
                    </Button>
                    <Button 
                      onClick={addToCart}
                      disabled={currentStock === 0}
                      variant="outline"
                      className="flex-1 border-slate-300 text-slate-700 h-11 rounded-lg font-semibold hover:bg-slate-50"
                      data-testid="add-to-cart-btn"
                    >
                      Add to Cart
                    </Button>
                  </div>

                  {/* Delivery Check */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      <span className="text-sm text-slate-700">Item is available at</span>
                      <input
                        type="text"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="Enter pincode"
                        className="w-20 text-sm border-b border-slate-300 focus:border-orange-500 outline-none px-1"
                        data-testid="pincode-input"
                      />
                      <button 
                        onClick={checkDelivery}
                        className="text-sm text-orange-500 hover:underline"
                      >
                        Check
                      </button>
                    </div>
                    
                    {deliveryInfo && (
                      <div className="space-y-2 text-sm mt-3">
                        <div className="flex items-start gap-2">
                          <Truck className="h-4 w-4 text-green-500 mt-0.5" />
                          <span className="text-slate-600">Standard Delivery in {deliveryInfo.days} day(s)</span>
                        </div>
                        {deliveryInfo.cod && (
                          <div className="flex items-start gap-2">
                            <Package className="h-4 w-4 text-green-500 mt-0.5" />
                            <span className="text-slate-600">Cash on Delivery available @ ₹50</span>
                          </div>
                        )}
                        <div className="flex items-start gap-2">
                          <RotateCcw className="h-4 w-4 text-green-500 mt-0.5" />
                          <span className="text-slate-600">Guaranteed Refunds within 7 days</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 mb-4">
                    * Actual delivery may vary depending on other items in your order
                  </p>

                  {/* Return Policy */}
                  <div className="flex items-center gap-3 pt-4 border-t">
                    <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center">
                      <RotateCcw className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 text-sm">7 days easy return</p>
                      <p className="text-xs text-slate-500">Refer to return policy for details</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Related Products */}
              {relatedProducts.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-slate-800 mb-3">Related Products</h3>
                  <div className="space-y-3">
                    {relatedProducts.slice(0, 3).map((rp) => (
                      <Link 
                        key={rp.id} 
                        to={`/products/${rp.id}`}
                        className="flex items-center gap-3 p-2 border rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <img 
                          src={rp.images?.[0] || 'https://via.placeholder.com/50'} 
                          alt={rp.name}
                          className="w-12 h-12 object-contain"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-800 line-clamp-1">{rp.name}</p>
                          <p className="text-sm font-bold text-slate-900">₹{rp.discount_price || rp.price}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Question Modal */}
      {showQuestionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>Ask a Question</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">About: {product.name}</p>
              <textarea
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="Type your question here..."
                className="w-full h-32 border rounded-lg p-3 text-sm"
              />
              <div className="flex gap-3 mt-4">
                <Button variant="outline" onClick={() => setShowQuestionModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={submitQuestion} className="flex-1 bg-orange-500 hover:bg-orange-600">
                  Submit Question
                </Button>
              </div>
              <p className="text-xs text-slate-500 mt-3">
                Your question will be visible after admin approval.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>Write a Review</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">For: {product.name}</p>
              
              {/* Star Rating */}
              <div className="mb-4">
                <label className="text-sm font-medium text-slate-700 mb-2 block">Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setReviewForm({...reviewForm, rating: star})}
                      className="p-1"
                    >
                      <Star 
                        className={`h-8 w-8 ${star <= reviewForm.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} 
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="text-sm font-medium text-slate-700 mb-1 block">Title (optional)</label>
                <Input
                  value={reviewForm.title}
                  onChange={(e) => setReviewForm({...reviewForm, title: e.target.value})}
                  placeholder="Summarize your experience"
                />
              </div>

              <div className="mb-4">
                <label className="text-sm font-medium text-slate-700 mb-1 block">Your Review</label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                  placeholder="Share your experience with this product..."
                  className="w-full h-32 border rounded-lg p-3 text-sm"
                />
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowReviewModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={submitReview} className="flex-1 bg-orange-500 hover:bg-orange-600">
                  Submit Review
                </Button>
              </div>
              <p className="text-xs text-slate-500 mt-3">
                Your review will be published after admin approval.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default HealthmugProductDetail;
