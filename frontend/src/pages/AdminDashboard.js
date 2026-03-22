import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API } from '@/App';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingBag, Users, Package, DollarSign, Upload, Settings } from 'lucide-react';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [csvFile, setCsvFile] = useState(null);

  useEffect(() => {
    loadDashboard();
    loadSettings();
  }, []);

  const loadDashboard = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API}/admin/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
      setOrders(res.data.recent_orders || []);
    } catch (error) {
      console.error('Failed to load dashboard', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API}/admin/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSettings(res.data);
    } catch (error) {
      console.error('Failed to load settings', error);
    }
  };

  const updateSettings = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API}/admin/settings`, settings, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Settings updated successfully!');
    } catch (error) {
      toast.error('Failed to update settings');
    }
  };

  const handleBulkImport = async (e) => {
    e.preventDefault();
    if (!csvFile) {
      toast.error('Please select a CSV file');
      return;
    }

    const formData = new FormData();
    formData.append('file', csvFile);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API}/admin/products/bulk-import`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success(`Imported ${res.data.imported} products!`);
      if (res.data.errors.length > 0) {
        console.error('Import errors:', res.data.errors);
      }
      setCsvFile(null);
    } catch (error) {
      toast.error('Bulk import failed');
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API}/admin/orders/${orderId}/status`,
        { order_status: status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Order status updated!');
      loadDashboard();
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8" data-testid="admin-dashboard">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#1A2F23]" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Admin Dashboard
          </h1>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview" data-testid="overview-tab">Overview</TabsTrigger>
            <TabsTrigger value="orders" data-testid="orders-tab">Orders</TabsTrigger>
            <TabsTrigger value="bulk-import" data-testid="bulk-import-tab">Bulk Import</TabsTrigger>
            <TabsTrigger value="settings" data-testid="settings-tab">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Total Revenue</p>
                      <p className="text-2xl font-bold text-[#2F5C3E]">₹{stats.total_revenue?.toFixed(2) || 0}</p>
                    </div>
                    <div className="w-12 h-12 bg-[#E8F3EA] rounded-full flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-[#2F5C3E]" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Total Orders</p>
                      <p className="text-2xl font-bold text-[#2F5C3E]">{stats.total_orders || 0}</p>
                    </div>
                    <div className="w-12 h-12 bg-[#E8F3EA] rounded-full flex items-center justify-center">
                      <ShoppingBag className="h-6 w-6 text-[#2F5C3E]" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Total Products</p>
                      <p className="text-2xl font-bold text-[#2F5C3E]">{stats.total_products || 0}</p>
                    </div>
                    <div className="w-12 h-12 bg-[#E8F3EA] rounded-full flex items-center justify-center">
                      <Package className="h-6 w-6 text-[#2F5C3E]" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Total Users</p>
                      <p className="text-2xl font-bold text-[#2F5C3E]">{stats.total_users || 0}</p>
                    </div>
                    <div className="w-12 h-12 bg-[#E8F3EA] rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-[#2F5C3E]" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id.substring(0, 8)}</TableCell>
                        <TableCell>{order.user_id.substring(0, 8)}</TableCell>
                        <TableCell>₹{order.total}</TableCell>
                        <TableCell>
                          <Badge variant={order.order_status === 'delivered' ? 'success' : 'default'}>
                            {order.order_status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Select onValueChange={(v) => updateOrderStatus(order.id, v)}>
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder="Update" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="confirmed">Confirmed</SelectItem>
                              <SelectItem value="packed">Packed</SelectItem>
                              <SelectItem value="shipped">Shipped</SelectItem>
                              <SelectItem value="delivered">Delivered</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>All Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">Order management interface would go here</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bulk Import Tab */}
          <TabsContent value="bulk-import">
            <Card>
              <CardHeader>
                <CardTitle>Bulk Product Import</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBulkImport} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Upload CSV File
                    </label>
                    <Input
                      type="file"
                      accept=".csv"
                      onChange={(e) => setCsvFile(e.target.files[0])}
                      className="h-12"
                      data-testid="csv-upload-input"
                    />
                    <p className="text-sm text-slate-500 mt-2">
                      CSV format: name, description, brand, ayush_system, category, sku, price, stock, health_concerns (pipe-separated), benefits (pipe-separated), ingredients (pipe-separated)
                    </p>
                  </div>
                  <Button
                    type="submit"
                    className="bg-[#2F5C3E] hover:bg-[#244A30] rounded-full"
                    data-testid="import-csv-button"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Import Products
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Platform Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={updateSettings} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Razorpay Settings</h3>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Razorpay Key ID</label>
                      <Input
                        value={settings.razorpay_key_id || ''}
                        onChange={(e) => setSettings({...settings, razorpay_key_id: e.target.value})}
                        placeholder="rzp_test_xxxxx"
                        data-testid="razorpay-key-id-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Razorpay Key Secret</label>
                      <Input
                        type="password"
                        value={settings.razorpay_key_secret || ''}
                        onChange={(e) => setSettings({...settings, razorpay_key_secret: e.target.value})}
                        placeholder="Enter secret key"
                        data-testid="razorpay-key-secret-input"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 border-t pt-6">
                    <h3 className="font-semibold text-lg">Shiprocket Settings</h3>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Shiprocket Email</label>
                      <Input
                        type="email"
                        value={settings.shiprocket_email || ''}
                        onChange={(e) => setSettings({...settings, shiprocket_email: e.target.value})}
                        placeholder="your@email.com"
                        data-testid="shiprocket-email-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Shiprocket Password</label>
                      <Input
                        type="password"
                        value={settings.shiprocket_password || ''}
                        onChange={(e) => setSettings({...settings, shiprocket_password: e.target.value})}
                        placeholder="Enter password"
                        data-testid="shiprocket-password-input"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 border-t pt-6">
                    <h3 className="font-semibold text-lg">General Settings</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Tax Rate (%)</label>
                        <Input
                          type="number"
                          step="0.01"
                          value={settings.tax_rate || 18}
                          onChange={(e) => setSettings({...settings, tax_rate: parseFloat(e.target.value)})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Shipping Charge (₹)</label>
                        <Input
                          type="number"
                          step="0.01"
                          value={settings.shipping_charge || 50}
                          onChange={(e) => setSettings({...settings, shipping_charge: parseFloat(e.target.value)})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Commission Rate (%)</label>
                        <Input
                          type="number"
                          step="0.01"
                          value={settings.commission_rate || 5}
                          onChange={(e) => setSettings({...settings, commission_rate: parseFloat(e.target.value)})}
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="bg-[#2F5C3E] hover:bg-[#244A30] rounded-full"
                    data-testid="save-settings-button"
                  >
                    Save Settings
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
