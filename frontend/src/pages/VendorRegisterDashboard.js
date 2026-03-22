import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { API, AuthContext } from '@/App';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Store, Package, TrendingUp, DollarSign, Plus, Edit, Trash2,
  CheckCircle, Clock, AlertCircle, Upload, Eye, BarChart3, Users
} from 'lucide-react';
import { toast } from 'sonner';

const VendorDashboard = () => {
  const navigate = useNavigate();
  const { user, setUser } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('overview');
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(true);
  const [vendorData, setVendorData] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0
  });

  // Registration form
  const [regForm, setRegForm] = useState({
    businessName: '',
    gstNumber: '',
    panNumber: '',
    bankAccountNumber: '',
    ifscCode: '',
    bankName: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: ''
  });

  // Product form
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    brand: '',
    category: '',
    ayush_system: 'ayurveda',
    sku: '',
    price: '',
    discount_price: '',
    stock: '',
    images: [],
    health_concerns: '',
    benefits: '',
    ingredients: ''
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [showProductForm, setShowProductForm] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setIsRegistering(true);
      return;
    }
    
    if (user.role === 'vendor') {
      loadVendorData();
    } else {
      setLoading(false);
      setIsRegistering(true);
    }
  }, [user]);

  const loadVendorData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [productsRes, ordersRes] = await Promise.all([
        axios.get(`${API}/products?vendor_id=${user.id}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/orders`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      setProducts(productsRes.data.products || []);
      setOrders(ordersRes.data.orders || []);
      
      // Calculate stats
      const vendorProducts = productsRes.data.products || [];
      const vendorOrders = ordersRes.data.orders || [];
      setStats({
        totalProducts: vendorProducts.length,
        totalOrders: vendorOrders.length,
        totalRevenue: vendorOrders.reduce((sum, o) => sum + (o.total || 0), 0),
        pendingOrders: vendorOrders.filter(o => o.order_status === 'placed').length
      });
      
      // Load vendor profile
      const profileRes = await axios.get(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
      setVendorData(profileRes.data);
    } catch (error) {
      console.error('Failed to load vendor data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please login first');
      navigate('/auth');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      // Update user role to vendor
      await axios.post(`${API}/vendor/register`, regForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Vendor registration submitted! Awaiting approval.');
      
      // Refresh user data
      const userRes = await axios.get(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
      setUser(userRes.data);
      setIsRegistering(false);
      loadVendorData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const productData = {
        ...productForm,
        price: parseFloat(productForm.price),
        discount_price: productForm.discount_price ? parseFloat(productForm.discount_price) : null,
        stock: parseInt(productForm.stock),
        health_concerns: productForm.health_concerns.split(',').map(s => s.trim()).filter(Boolean),
        benefits: productForm.benefits.split(',').map(s => s.trim()).filter(Boolean),
        ingredients: productForm.ingredients.split(',').map(s => s.trim()).filter(Boolean),
        images: productForm.images.length ? productForm.images : ['https://via.placeholder.com/300']
      };

      if (editingProduct) {
        await axios.put(`${API}/products/${editingProduct.id}`, productData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Product updated!');
      } else {
        await axios.post(`${API}/products`, productData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Product created!');
      }

      setShowProductForm(false);
      setEditingProduct(null);
      setProductForm({
        name: '', description: '', brand: '', category: '', ayush_system: 'ayurveda',
        sku: '', price: '', discount_price: '', stock: '', images: [],
        health_concerns: '', benefits: '', ingredients: ''
      });
      loadVendorData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save product');
    }
  };

  const deleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Product deleted');
      loadVendorData();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const editProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      brand: product.brand,
      category: product.category,
      ayush_system: product.ayush_system,
      sku: product.sku,
      price: product.price.toString(),
      discount_price: product.discount_price?.toString() || '',
      stock: product.stock.toString(),
      images: product.images,
      health_concerns: product.health_concerns?.join(', ') || '',
      benefits: product.benefits?.join(', ') || '',
      ingredients: product.ingredients?.join(', ') || ''
    });
    setShowProductForm(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show registration form if not a vendor
  if (isRegistering || (user && user.role !== 'vendor')) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Store className="h-8 w-8 text-orange-600" />
                </div>
                <CardTitle className="text-2xl">Become a Seller</CardTitle>
                <p className="text-slate-600 mt-2">Join AYUSHMEDNEST marketplace and reach millions of customers</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700">Business Name *</label>
                      <Input
                        value={regForm.businessName}
                        onChange={(e) => setRegForm({...regForm, businessName: e.target.value})}
                        placeholder="Your Business Name"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">Phone *</label>
                      <Input
                        value={regForm.phone}
                        onChange={(e) => setRegForm({...regForm, phone: e.target.value})}
                        placeholder="+91 XXXXXXXXXX"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">GST Number</label>
                      <Input
                        value={regForm.gstNumber}
                        onChange={(e) => setRegForm({...regForm, gstNumber: e.target.value})}
                        placeholder="22AAAAA0000A1Z5"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">PAN Number *</label>
                      <Input
                        value={regForm.panNumber}
                        onChange={(e) => setRegForm({...regForm, panNumber: e.target.value})}
                        placeholder="AAAAA0000A"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">Bank Account Number *</label>
                      <Input
                        value={regForm.bankAccountNumber}
                        onChange={(e) => setRegForm({...regForm, bankAccountNumber: e.target.value})}
                        placeholder="Account Number"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">IFSC Code *</label>
                      <Input
                        value={regForm.ifscCode}
                        onChange={(e) => setRegForm({...regForm, ifscCode: e.target.value})}
                        placeholder="SBIN0001234"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">Bank Name *</label>
                      <Input
                        value={regForm.bankName}
                        onChange={(e) => setRegForm({...regForm, bankName: e.target.value})}
                        placeholder="Bank Name"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">Pincode *</label>
                      <Input
                        value={regForm.pincode}
                        onChange={(e) => setRegForm({...regForm, pincode: e.target.value})}
                        placeholder="110001"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Business Address *</label>
                    <Input
                      value={regForm.address}
                      onChange={(e) => setRegForm({...regForm, address: e.target.value})}
                      placeholder="Full Address"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700">City *</label>
                      <Input
                        value={regForm.city}
                        onChange={(e) => setRegForm({...regForm, city: e.target.value})}
                        placeholder="City"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">State *</label>
                      <Input
                        value={regForm.state}
                        onChange={(e) => setRegForm({...regForm, state: e.target.value})}
                        placeholder="State"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h4 className="font-medium text-orange-800 mb-2">Benefits of Selling with Us</h4>
                    <ul className="text-sm text-orange-700 space-y-1">
                      <li>• Access to millions of AYUSH customers</li>
                      <li>• Easy product listing and inventory management</li>
                      <li>• Secure and timely payments</li>
                      <li>• Marketing support and visibility</li>
                      <li>• Low commission rates</li>
                    </ul>
                  </div>

                  <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 h-12">
                    Submit Application
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Vendor Dashboard
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Vendor Dashboard</h1>
            <p className="text-slate-600">Welcome back, {vendorData?.full_name || user?.full_name}</p>
          </div>
          <Button onClick={() => setShowProductForm(true)} className="bg-orange-500 hover:bg-orange-600">
            <Plus className="h-4 w-4 mr-2" /> Add Product
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Products</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.totalProducts}</p>
                </div>
                <Package className="h-10 w-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Orders</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.totalOrders}</p>
                </div>
                <TrendingUp className="h-10 w-10 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-slate-900">₹{stats.totalRevenue.toLocaleString()}</p>
                </div>
                <DollarSign className="h-10 w-10 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Pending Orders</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.pendingOrders}</p>
                </div>
                <Clock className="h-10 w-10 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Products</CardTitle>
                </CardHeader>
                <CardContent>
                  {products.slice(0, 5).map((product) => (
                    <div key={product.id} className="flex items-center gap-3 py-3 border-b last:border-0">
                      <img src={product.images?.[0] || 'https://via.placeholder.com/50'} alt="" className="w-12 h-12 object-contain rounded" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">{product.name}</p>
                        <p className="text-xs text-slate-500">₹{product.discount_price || product.price}</p>
                      </div>
                      <Badge variant={product.stock > 0 ? 'default' : 'destructive'}>
                        {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  {orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-center justify-between py-3 border-b last:border-0">
                      <div>
                        <p className="text-sm font-medium text-slate-900">Order #{order.id.slice(0, 8)}</p>
                        <p className="text-xs text-slate-500">{order.items?.length || 0} items</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-900">₹{order.total}</p>
                        <Badge className={
                          order.order_status === 'delivered' ? 'bg-green-100 text-green-700' :
                          order.order_status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                          'bg-orange-100 text-orange-700'
                        }>
                          {order.order_status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products">
            <Card>
              <CardContent className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Product</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Price</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Stock</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr key={product.id} className="border-b hover:bg-slate-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img src={product.images?.[0] || 'https://via.placeholder.com/40'} alt="" className="w-10 h-10 object-contain rounded" />
                              <span className="text-sm font-medium text-slate-900">{product.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-slate-600">₹{product.discount_price || product.price}</td>
                          <td className="py-3 px-4 text-sm text-slate-600">{product.stock}</td>
                          <td className="py-3 px-4">
                            <Badge variant={product.is_active ? 'default' : 'secondary'}>
                              {product.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="ghost" onClick={() => editProduct(product)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" className="text-red-500" onClick={() => deleteProduct(product.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardContent className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Order ID</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Date</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Items</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Total</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id} className="border-b hover:bg-slate-50">
                          <td className="py-3 px-4 text-sm font-medium text-slate-900">#{order.id.slice(0, 8)}</td>
                          <td className="py-3 px-4 text-sm text-slate-600">{new Date(order.created_at).toLocaleDateString()}</td>
                          <td className="py-3 px-4 text-sm text-slate-600">{order.items?.length || 0}</td>
                          <td className="py-3 px-4 text-sm font-bold text-slate-900">₹{order.total}</td>
                          <td className="py-3 px-4">
                            <Badge className={
                              order.order_status === 'delivered' ? 'bg-green-100 text-green-700' :
                              order.order_status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                              'bg-orange-100 text-orange-700'
                            }>
                              {order.order_status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Business Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Business Name</label>
                    <p className="text-slate-900">{vendorData?.business_name || vendorData?.full_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Email</label>
                    <p className="text-slate-900">{vendorData?.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Phone</label>
                    <p className="text-slate-900">{vendorData?.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Member Since</label>
                    <p className="text-slate-900">{vendorData?.created_at ? new Date(vendorData.created_at).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Product Form Modal */}
      {showProductForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProductSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Product Name *</label>
                    <Input
                      value={productForm.name}
                      onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Brand *</label>
                    <Input
                      value={productForm.brand}
                      onChange={(e) => setProductForm({...productForm, brand: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Category *</label>
                    <Input
                      value={productForm.category}
                      onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">AYUSH System *</label>
                    <select
                      value={productForm.ayush_system}
                      onChange={(e) => setProductForm({...productForm, ayush_system: e.target.value})}
                      className="w-full h-10 border rounded-md px-3"
                    >
                      <option value="ayurveda">Ayurveda</option>
                      <option value="yoga">Yoga</option>
                      <option value="unani">Unani</option>
                      <option value="siddha">Siddha</option>
                      <option value="homeopathy">Homeopathy</option>
                      <option value="naturopathy">Naturopathy</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">SKU *</label>
                    <Input
                      value={productForm.sku}
                      onChange={(e) => setProductForm({...productForm, sku: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Price *</label>
                    <Input
                      type="number"
                      value={productForm.price}
                      onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Discount Price</label>
                    <Input
                      type="number"
                      value={productForm.discount_price}
                      onChange={(e) => setProductForm({...productForm, discount_price: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Stock *</label>
                    <Input
                      type="number"
                      value={productForm.stock}
                      onChange={(e) => setProductForm({...productForm, stock: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Description *</label>
                  <textarea
                    value={productForm.description}
                    onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                    className="w-full h-24 border rounded-md p-3"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Health Concerns (comma separated)</label>
                  <Input
                    value={productForm.health_concerns}
                    onChange={(e) => setProductForm({...productForm, health_concerns: e.target.value})}
                    placeholder="immunity, digestion, skin"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Benefits (comma separated)</label>
                  <Input
                    value={productForm.benefits}
                    onChange={(e) => setProductForm({...productForm, benefits: e.target.value})}
                    placeholder="Boosts immunity, Improves digestion"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Ingredients (comma separated)</label>
                  <Input
                    value={productForm.ingredients}
                    onChange={(e) => setProductForm({...productForm, ingredients: e.target.value})}
                    placeholder="Amla, Ashwagandha, Tulsi"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => { setShowProductForm(false); setEditingProduct(null); }} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 bg-orange-500 hover:bg-orange-600">
                    {editingProduct ? 'Update Product' : 'Add Product'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default VendorDashboard;
