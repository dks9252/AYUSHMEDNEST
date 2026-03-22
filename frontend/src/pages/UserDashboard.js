import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '@/App';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Package } from 'lucide-react';

const UserDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data.orders);
    } catch (error) {
      console.error('Failed to load orders', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8" data-testid="user-dashboard">
        <h1 className="text-3xl font-bold text-[#1A2F23] mb-8" style={{ fontFamily: 'Outfit, sans-serif' }}>
          My Dashboard
        </h1>

        <Tabs defaultValue="orders">
          <TabsList>
            <TabsTrigger value="orders">My Orders</TabsTrigger>
            <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="mt-6">
            {loading ? (
              <div className="text-center py-12">Loading orders...</div>
            ) : orders.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Package className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600">No orders yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id} data-testid={`order-${order.id}`}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-sm text-slate-600">Order #{order.id.substring(0, 8)}</p>
                          <p className="text-xs text-slate-500">{new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                        <Badge>{order.order_status}</Badge>
                      </div>
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span>{item.product_name} x{item.quantity}</span>
                            <span>₹{item.total}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 pt-4 border-t flex justify-between font-bold">
                        <span>Total</span>
                        <span className="text-[#2F5C3E]">₹{order.total}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="prescriptions" className="mt-6">
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-slate-600">No prescriptions uploaded yet</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default UserDashboard;
