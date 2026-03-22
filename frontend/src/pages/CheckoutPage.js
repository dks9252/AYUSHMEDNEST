import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from '@/App';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ShieldCheck, Truck, CreditCard, Banknote, Loader2 } from 'lucide-react';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [razorpayKey, setRazorpayKey] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [address, setAddress] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postal_code: ''
  });

  // Load Razorpay Script
  const loadRazorpayScript = useCallback(() => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }, []);

  useEffect(() => {
    loadCart();
    fetchRazorpayKey();
    loadRazorpayScript().then(setRazorpayLoaded);
  }, [loadRazorpayScript]);

  const fetchRazorpayKey = async () => {
    try {
      const res = await axios.get(`${API}/admin/razorpay/key`);
      if (res.data.key_id) {
        setRazorpayKey(res.data.key_id);
      }
    } catch (error) {
      console.error('Failed to fetch Razorpay key', error);
    }
  };

  const loadCart = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API}/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCart(res.data);
      
      if (res.data.items.length === 0) {
        navigate('/cart');
      }
    } catch (error) {
      console.error('Failed to load cart', error);
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    
    // Validate address
    if (!address.name || !address.email || !address.phone || !address.address || !address.city || !address.state || !address.postal_code) {
      toast.error('Please fill in all address fields');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${API}/orders/create`,
        {
          items: cart.items.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price
          })),
          shipping_address: address,
          billing_address: address,
          payment_method: paymentMethod
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (paymentMethod === 'razorpay' && res.data.razorpay_order_id) {
        // Check if Razorpay is loaded
        if (!razorpayLoaded || !window.Razorpay) {
          toast.error('Payment gateway is loading. Please try again.');
          setLoading(false);
          return;
        }

        if (!razorpayKey) {
          toast.error('Payment gateway not configured. Please contact support.');
          setLoading(false);
          return;
        }

        // Initialize Razorpay
        const options = {
          key: razorpayKey,
          amount: res.data.total * 100,
          currency: 'INR',
          name: 'AYUSHMEDNEST',
          description: `Order #${res.data.order_id.slice(0, 8)}`,
          image: '/logo.png',
          order_id: res.data.razorpay_order_id,
          handler: async function (response) {
            try {
              await axios.post(
                `${API}/orders/${res.data.order_id}/payment`,
                {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature
                },
                { headers: { Authorization: `Bearer ${token}` } }
              );
              toast.success('Payment successful! Order placed.');
              navigate('/dashboard');
            } catch (error) {
              toast.error('Payment verification failed. Please contact support.');
            }
          },
          prefill: {
            name: address.name,
            email: address.email,
            contact: address.phone
          },
          notes: {
            address: `${address.address}, ${address.city}, ${address.state} - ${address.postal_code}`
          },
          theme: {
            color: '#2F5C3E'
          },
          modal: {
            ondismiss: function() {
              setLoading(false);
              toast.info('Payment cancelled');
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response) {
          toast.error(`Payment failed: ${response.error.description}`);
          setLoading(false);
        });
        rzp.open();
      } else {
        // COD Order
        toast.success('Order placed successfully! Pay on delivery.');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error.response?.data?.detail || 'Failed to place order');
      setLoading(false);
    }
  };

  const subtotal = cart.total;
  const shipping = 50;
  const tax = subtotal * 0.18;
  const total = subtotal + shipping + tax;

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8" data-testid="checkout-page">
        <h1 className="text-3xl font-bold text-[#1A2F23] mb-8" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Secure Checkout
        </h1>

        <form onSubmit={handleCheckout}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-[#2F5C3E]" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      required
                      placeholder="Full Name *"
                      value={address.name}
                      onChange={(e) => setAddress({...address, name: e.target.value})}
                      data-testid="address-name-input"
                    />
                    <Input
                      required
                      type="email"
                      placeholder="Email *"
                      value={address.email}
                      onChange={(e) => setAddress({...address, email: e.target.value})}
                      data-testid="address-email-input"
                    />
                  </div>
                  <Input
                    required
                    placeholder="Phone Number *"
                    value={address.phone}
                    onChange={(e) => setAddress({...address, phone: e.target.value})}
                    data-testid="address-phone-input"
                  />
                  <Input
                    required
                    placeholder="Street Address *"
                    value={address.address}
                    onChange={(e) => setAddress({...address, address: e.target.value})}
                    data-testid="address-address-input"
                  />
                  <div className="grid grid-cols-3 gap-4">
                    <Input
                      required
                      placeholder="City *"
                      value={address.city}
                      onChange={(e) => setAddress({...address, city: e.target.value})}
                      data-testid="address-city-input"
                    />
                    <Input
                      required
                      placeholder="State *"
                      value={address.state}
                      onChange={(e) => setAddress({...address, state: e.target.value})}
                      data-testid="address-state-input"
                    />
                    <Input
                      required
                      placeholder="PIN Code *"
                      value={address.postal_code}
                      onChange={(e) => setAddress({...address, postal_code: e.target.value})}
                      data-testid="address-postal-input"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-[#2F5C3E]" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} data-testid="payment-method-group">
                    <div className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === 'razorpay' ? 'border-[#2F5C3E] bg-green-50' : 'hover:border-slate-300'}`}>
                      <RadioGroupItem value="razorpay" id="razorpay" />
                      <Label htmlFor="razorpay" className="flex-1 cursor-pointer flex items-center gap-3">
                        <CreditCard className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium">Pay Online</p>
                          <p className="text-sm text-slate-500">Credit/Debit Card, UPI, NetBanking, Wallets</p>
                        </div>
                      </Label>
                      <img src="https://badges.razorpay.com/badge-dark.png" alt="Razorpay" className="h-6" />
                    </div>
                    <div className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-[#2F5C3E] bg-green-50' : 'hover:border-slate-300'}`}>
                      <RadioGroupItem value="cod" id="cod" />
                      <Label htmlFor="cod" className="flex-1 cursor-pointer flex items-center gap-3">
                        <Banknote className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium">Cash on Delivery</p>
                          <p className="text-sm text-slate-500">Pay when your order arrives</p>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Trust Badges */}
              <div className="flex items-center justify-center gap-8 py-4 bg-white rounded-lg border">
                <div className="flex items-center gap-2 text-slate-600">
                  <ShieldCheck className="h-5 w-5 text-green-600" />
                  <span className="text-sm">Secure Payment</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Truck className="h-5 w-5 text-blue-600" />
                  <span className="text-sm">Fast Delivery</span>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="sticky top-20 shadow-lg">
                <CardHeader className="bg-[#2F5C3E] text-white rounded-t-lg">
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {cart.items.map((item) => (
                      <div key={item.product_id} className="flex justify-between text-sm pb-2 border-b">
                        <div className="flex-1">
                          <p className="font-medium line-clamp-1">{item.product_name}</p>
                          <p className="text-slate-500">Qty: {item.quantity}</p>
                        </div>
                        <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Subtotal</span>
                      <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Shipping</span>
                      <span>₹{shipping.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Tax (18% GST)</span>
                      <span>₹{tax.toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-3 flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-[#2F5C3E]">₹{total.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <Button
                    type="submit"
                    disabled={loading || cart.items.length === 0}
                    className="w-full bg-[#2F5C3E] hover:bg-[#244A30] rounded-full h-12 text-lg"
                    data-testid="place-order-button"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processing...
                      </>
                    ) : paymentMethod === 'razorpay' ? (
                      `Pay ₹${total.toFixed(2)}`
                    ) : (
                      'Place Order (COD)'
                    )}
                  </Button>
                  
                  <p className="text-xs text-center text-slate-500">
                    By placing this order, you agree to our Terms & Conditions
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
};

export default CheckoutPage;
