import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '@/App';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Settings, Upload, Image, Tag, Package, DollarSign, Users, 
  ShoppingBag, TrendingUp, BarChart3, FileText, Edit, Trash2,
  Plus, Save, Eye, ArrowUp, ArrowDown, Calendar, Link as LinkIcon
} from 'lucide-react';
import { toast } from 'sonner';

const AdminCMSDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  
  // Website Settings State
  const [settings, setSettings] = useState({
    website_name: 'AYUSHMEDNEST',
    logo_url: '',
    meta_title: '',
    meta_description: '',
    contact_email: '',
    contact_phone: '',
    facebook_url: '',
    twitter_url: '',
    instagram_url: '',
    theme_primary_color: '#2F5C3E',
    google_analytics_id: '',
    facebook_pixel_id: ''
  });

  // Categories State
  const [categories, setCategories] = useState([]);
  const [categoryForm, setCategoryForm] = useState({
    name: '', slug: '', description: '', seo_title: '', seo_description: ''
  });

  // Brands State
  const [brands, setBrands] = useState([]);
  const [brandForm, setBrandForm] = useState({ name: '', slug: '', description: '' });

  // Banners State
  const [banners, setBanners] = useState([]);
  const [bannerForm, setBannerForm] = useState({
    title: '', image_url: '', redirect_url: '', placement: 'homepage'
  });

  // Homepage Blocks State
  const [homepageBlocks, setHomepageBlocks] = useState([]);

  // Blog Posts State
  const [blogPosts, setBlogPosts] = useState([]);
  const [blogForm, setBlogForm] = useState({
    title: '', slug: '', content: '', excerpt: '', seo_title: '', seo_description: ''
  });

  // Stats State
  const [stats, setStats] = useState({});

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Load all data
      const [settingsRes, categoriesRes, brandsRes, bannersRes, statsRes] = await Promise.all([
        axios.get(`${API}/cms/settings`, { headers }),
        axios.get(`${API}/cms/categories`, { headers }),
        axios.get(`${API}/cms/brands`, { headers }),
        axios.get(`${API}/cms/banners`, { headers }),
        axios.get(`${API}/admin/dashboard`, { headers })
      ]);

      setSettings(settingsRes.data);
      setCategories(categoriesRes.data.categories || []);
      setBrands(brandsRes.data.brands || []);
      setBanners(bannersRes.data.banners || []);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Failed to load dashboard data', error);
    }
  };

  // Website Settings Handlers
  const saveSettings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API}/cms/settings`, settings, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file, folder = 'general') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API}/cms/upload`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      return res.data.url;
    } catch (error) {
      toast.error('File upload failed');
      return null;
    }
  };

  // Category Handlers
  const saveCategory = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/cms/categories`, categoryForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Category created!');
      setCategoryForm({ name: '', slug: '', description: '', seo_title: '', seo_description: '' });
      loadDashboardData();
    } catch (error) {
      toast.error('Failed to create category');
    }
  };

  const deleteCategory = async (categoryId) => {
    if (!confirm('Delete this category?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/cms/categories/${categoryId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Category deleted!');
      loadDashboardData();
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };

  // Brand Handlers
  const saveBrand = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/cms/brands`, brandForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Brand created!');
      setBrandForm({ name: '', slug: '', description: '' });
      loadDashboardData();
    } catch (error) {
      toast.error('Failed to create brand');
    }
  };

  // Banner Handlers
  const saveBanner = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/cms/banners`, bannerForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Banner created!');
      setBannerForm({ title: '', image_url: '', redirect_url: '', placement: 'homepage' });
      loadDashboardData();
    } catch (error) {
      toast.error('Failed to create banner');
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8" data-testid="admin-cms-dashboard">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#1A2F23]" style={{ fontFamily: 'Outfit, sans-serif' }}>
              CMS Dashboard
            </h1>
            <p className="text-slate-600 mt-1">Manage your entire website from here</p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold text-[#2F5C3E]">₹{stats.total_revenue?.toFixed(2) || 0}</p>
                </div>
                <DollarSign className="h-12 w-12 text-[#2F5C3E] opacity-20" />
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
                <Package className="h-12 w-12 text-[#2F5C3E] opacity-20" />
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
                <ShoppingBag className="h-12 w-12 text-[#2F5C3E] opacity-20" />
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
                <Users className="h-12 w-12 text-[#2F5C3E] opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CMS Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="settings">Website Settings</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="brands">Brands</TabsTrigger>
            <TabsTrigger value="banners">Banners</TabsTrigger>
            <TabsTrigger value="homepage">Homepage Content</TabsTrigger>
            <TabsTrigger value="blog">Blog</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button onClick={() => setActiveTab('settings')} className="h-20 flex flex-col gap-2">
                    <Settings className="h-6 w-6" />
                    <span className="text-sm">Settings</span>
                  </Button>
                  <Button onClick={() => setActiveTab('categories')} variant="outline" className="h-20 flex flex-col gap-2">
                    <Tag className="h-6 w-6" />
                    <span className="text-sm">Categories</span>
                  </Button>
                  <Button onClick={() => setActiveTab('brands')} variant="outline" className="h-20 flex flex-col gap-2">
                    <Package className="h-6 w-6" />
                    <span className="text-sm">Brands</span>
                  </Button>
                  <Button onClick={() => setActiveTab('banners')} variant="outline" className="h-20 flex flex-col gap-2">
                    <Image className="h-6 w-6" />
                    <span className="text-sm">Banners</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Website Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Website Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Website Name</Label>
                      <Input
                        value={settings.website_name}
                        onChange={(e) => setSettings({...settings, website_name: e.target.value})}
                        placeholder="AYUSHMEDNEST"
                      />
                    </div>
                    <div>
                      <Label>Theme Primary Color</Label>
                      <Input
                        type="color"
                        value={settings.theme_primary_color}
                        onChange={(e) => setSettings({...settings, theme_primary_color: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Meta Title</Label>
                    <Input
                      value={settings.meta_title}
                      onChange={(e) => setSettings({...settings, meta_title: e.target.value})}
                      placeholder="Best AYUSH Medicines Online"
                    />
                  </div>

                  <div>
                    <Label>Meta Description</Label>
                    <Textarea
                      value={settings.meta_description}
                      onChange={(e) => setSettings({...settings, meta_description: e.target.value})}
                      placeholder="Shop authentic Ayurvedic medicines..."
                      rows={3}
                    />
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">Contact Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Contact Email</Label>
                      <Input
                        type="email"
                        value={settings.contact_email}
                        onChange={(e) => setSettings({...settings, contact_email: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Contact Phone</Label>
                      <Input
                        value={settings.contact_phone}
                        onChange={(e) => setSettings({...settings, contact_phone: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                {/* Social Media */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">Social Media Links</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Facebook URL</Label>
                      <Input
                        value={settings.facebook_url}
                        onChange={(e) => setSettings({...settings, facebook_url: e.target.value})}
                        placeholder="https://facebook.com/..."
                      />
                    </div>
                    <div>
                      <Label>Instagram URL</Label>
                      <Input
                        value={settings.instagram_url}
                        onChange={(e) => setSettings({...settings, instagram_url: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Twitter URL</Label>
                      <Input
                        value={settings.twitter_url}
                        onChange={(e) => setSettings({...settings, twitter_url: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                {/* Analytics */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">Analytics & Tracking</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Google Analytics ID</Label>
                      <Input
                        value={settings.google_analytics_id}
                        onChange={(e) => setSettings({...settings, google_analytics_id: e.target.value})}
                        placeholder="G-XXXXXXXXXX"
                      />
                    </div>
                    <div>
                      <Label>Facebook Pixel ID</Label>
                      <Input
                        value={settings.facebook_pixel_id}
                        onChange={(e) => setSettings({...settings, facebook_pixel_id: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={saveSettings} 
                  disabled={loading}
                  className="bg-[#2F5C3E] hover:bg-[#244A30]"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {loading ? 'Saving...' : 'Save Settings'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Create Category */}
              <Card>
                <CardHeader>
                  <CardTitle>Create Category</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Category Name</Label>
                    <Input
                      value={categoryForm.name}
                      onChange={(e) => {
                        const name = e.target.value;
                        const slug = name.toLowerCase().replace(/\s+/g, '-');
                        setCategoryForm({...categoryForm, name, slug});
                      }}
                      placeholder="Immunity Boosters"
                    />
                  </div>
                  <div>
                    <Label>Slug</Label>
                    <Input
                      value={categoryForm.slug}
                      onChange={(e) => setCategoryForm({...categoryForm, slug: e.target.value})}
                      placeholder="immunity-boosters"
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={categoryForm.description}
                      onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label>SEO Title</Label>
                    <Input
                      value={categoryForm.seo_title}
                      onChange={(e) => setCategoryForm({...categoryForm, seo_title: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>SEO Description</Label>
                    <Textarea
                      value={categoryForm.seo_description}
                      onChange={(e) => setCategoryForm({...categoryForm, seo_description: e.target.value})}
                      rows={2}
                    />
                  </div>
                  <Button onClick={saveCategory} className="w-full bg-[#2F5C3E]">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Category
                  </Button>
                </CardContent>
              </Card>

              {/* Categories List */}
              <Card>
                <CardHeader>
                  <CardTitle>Existing Categories ({categories.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{category.name}</p>
                          <p className="text-sm text-slate-500">/{category.slug}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => deleteCategory(category.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Brands Tab */}
          <TabsContent value="brands">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Create Brand</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Brand Name</Label>
                    <Input
                      value={brandForm.name}
                      onChange={(e) => {
                        const name = e.target.value;
                        const slug = name.toLowerCase().replace(/\s+/g, '-');
                        setBrandForm({...brandForm, name, slug});
                      }}
                    />
                  </div>
                  <div>
                    <Label>Slug</Label>
                    <Input
                      value={brandForm.slug}
                      onChange={(e) => setBrandForm({...brandForm, slug: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={brandForm.description}
                      onChange={(e) => setBrandForm({...brandForm, description: e.target.value})}
                      rows={3}
                    />
                  </div>
                  <Button onClick={saveBrand} className="w-full bg-[#2F5C3E]">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Brand
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Existing Brands ({brands.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {brands.map((brand) => (
                      <div key={brand.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{brand.name}</p>
                          <p className="text-sm text-slate-500">{brand.description}</p>
                        </div>
                        <Button size="sm" variant="ghost">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Banners Tab */}
          <TabsContent value="banners">
            <Card>
              <CardHeader>
                <CardTitle>Banner Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Banner Title</Label>
                    <Input
                      value={bannerForm.title}
                      onChange={(e) => setBannerForm({...bannerForm, title: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Placement</Label>
                    <Select value={bannerForm.placement} onValueChange={(v) => setBannerForm({...bannerForm, placement: v})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="homepage">Homepage</SelectItem>
                        <SelectItem value="category">Category Page</SelectItem>
                        <SelectItem value="product">Product Page</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Image URL (or upload)</Label>
                  <Input
                    value={bannerForm.image_url}
                    onChange={(e) => setBannerForm({...bannerForm, image_url: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Redirect URL</Label>
                  <Input
                    value={bannerForm.redirect_url}
                    onChange={(e) => setBannerForm({...bannerForm, redirect_url: e.target.value})}
                    placeholder="/products/category-name"
                  />
                </div>
                <Button onClick={saveBanner} className="bg-[#2F5C3E]">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Banner
                </Button>

                <div className="mt-6">
                  <h3 className="font-semibold mb-4">Active Banners</h3>
                  <div className="space-y-2">
                    {banners.map((banner) => (
                      <div key={banner.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{banner.title}</p>
                          <p className="text-sm text-slate-500">{banner.placement}</p>
                        </div>
                        <Badge>{banner.is_active ? 'Active' : 'Inactive'}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SEO Tab */}
          <TabsContent value="seo">
            <Card>
              <CardHeader>
                <CardTitle>SEO Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="font-semibold text-green-800 mb-2">Automatic SEO Features</h3>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>✓ XML Sitemap: /api/sitemap.xml</li>
                      <li>✓ Robots.txt: /api/robots.txt</li>
                      <li>✓ SEO-friendly URLs enabled</li>
                      <li>✓ Meta tags per category/product</li>
                    </ul>
                  </div>
                  <p className="text-slate-600">SEO settings for individual pages are managed in their respective sections (Categories, Products, Blog).</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">Google Analytics 4</h3>
                    <p className="text-sm text-slate-600 mb-2">Status: {settings.google_analytics_id ? '✓ Connected' : '✗ Not Connected'}</p>
                    <p className="text-sm text-slate-500">Configure in Website Settings tab</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Facebook Pixel</h3>
                    <p className="text-sm text-slate-600 mb-2">Status: {settings.facebook_pixel_id ? '✓ Connected' : '✗ Not Connected'}</p>
                    <p className="text-sm text-slate-500">Configure in Website Settings tab</p>
                  </div>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">Analytics tracking codes will be automatically injected into your website based on the settings configured.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default AdminCMSDashboard;
