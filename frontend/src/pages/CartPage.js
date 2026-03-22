import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from '@/App';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';

const CartPage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      const res = await axios.get(`${API}/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCart(res.data);
    } catch (error) {
      console.error('Failed to load cart', error);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/cart/remove/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Item removed from cart');
      loadCart();
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">Loading cart...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8" data-testid="cart-page">
        <h1 className="text-3xl font-bold text-[#1A2F23] mb-8" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Shopping Cart
        </h1>

        {cart.items.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="h-20 w-20 text-slate-300 mx-auto mb-4" />
            <p className="text-xl text-slate-600 mb-6">Your cart is empty</p>
            <Link to="/products">
              <Button className="bg-[#2F5C3E] hover:bg-[#244A30] rounded-full">Continue Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item) => (
                <Card key={item.product_id} className="shadow-md" data-testid={`cart-item-${item.product_id}`}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="w-24 h-24 bg-stone-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img 
                          src={item.product_image || 'https://via.placeholder.com/100'}
                          alt={item.product_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-slate-900 mb-1">{item.product_name}</h3>
                        <p className="text-sm text-slate-500 mb-2">Quantity: {item.quantity}</p>
                        <p className="text-lg font-bold text-[#2F5C3E]">₹{item.price * item.quantity}</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => removeItem(item.product_id)}
                        data-testid={`remove-item-${item.product_id}`}
                      >
                        <Trash2 className="h-5 w-5 text-red-500" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div>
              <Card className="sticky top-20 shadow-lg">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Subtotal</span>
                      <span className="font-medium">₹{cart.total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Shipping</span>
                      <span className="font-medium">₹50.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Tax (18%)</span>
                      <span className="font-medium">₹{(cart.total * 0.18).toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-3 flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-[#2F5C3E]">₹{(cart.total + 50 + (cart.total * 0.18)).toFixed(2)}</span>
                    </div>
                  </div>
                  <Button 
                    onClick={() => navigate('/checkout')}
                    className="w-full bg-[#2F5C3E] hover:bg-[#244A30] rounded-full h-12 text-lg"
                    data-testid="proceed-to-checkout-button"
                  >
                    Proceed to Checkout
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default CartPage;
