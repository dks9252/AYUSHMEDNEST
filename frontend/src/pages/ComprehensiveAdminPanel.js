import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API } from '@/App';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Settings, CreditCard, Truck, Mail, Bell, Database,
  Search, BarChart3, FileText, Star, Heart, MessageSquare,
  Users, Package, AlertCircle, Save, Plus, Edit, Trash2, Eye,
  CheckCircle, XCircle, HelpCircle, Store, UserCheck, Loader2,
  RefreshCw, DollarSign, Palette, Globe, Image, Menu
} from 'lucide-react';
import { toast } from 'sonner';

const ComprehensiveAdminPanel = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [loading, setLoading] = useState(false);

  // Integration Settings State
  const [integrations, setIntegrations] = useState({
    razorpay_key_id: '',
    razorpay_key_secret: '',
    shiprocket_email: '',
    shiprocket_password: '',
    msg91_auth_key: '',
    msg91_sender_id: '',
    smtp_host: '',
    smtp_port: 587,
    smtp_username: '',
    smtp_password: '',
    smtp_from_email: '',
    google_indexing_json_key: '',
    commission_rate: 5.0,
    shipping_charge: 50.0,
    tax_rate: 18.0
  });

  // Connection Test States
  const [razorpayStatus, setRazorpayStatus] = useState(null);
  const [shiprocketStatus, setShiprocketStatus] = useState(null);
  const [testingRazorpay, setTestingRazorpay] = useState(false);
  const [testingShiprocket, setTestingShiprocket] = useState(false);

  // Reviews, Questions, Vendors, Affiliates States
  const [pendingReviews, setPendingReviews] = useState([]);
  const [pendingQuestions, setPendingQuestions] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [affiliates, setAffiliates] = useState([]);

  // Email & SMS Templates
  const [emailTemplates, setEmailTemplates] = useState([]);
  const [smsTemplates, setSmsTemplates] = useState([]);
  const [emailForm, setEmailForm] = useState({ name: '', subject: '', body: '', variables: [] });
  const [smsForm, setSmsForm] = useState({ name: '', template_id: '', message: '', variables: [] });

  // Testimonials
  const [testimonialForm, setTestimonialForm] = useState({ customer_name: '', rating: 5, comment: '', is_featured: false });

  // Newsletter & Audit
  const [newsletterSubscribers, setNewsletterSubscribers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  // Q&A Answer Modal State
  const [answerModal, setAnswerModal] = useState({ open: false, questionId: null, answer: '' });

  // Website Settings State
  const [websiteSettings, setWebsiteSettings] = useState({
    website_name: 'AYUSHMEDNEST',
    logo_url: '',
    favicon_url: '',
    meta_title: "India's Most Trusted AYUSH Marketplace",
    meta_description: 'Buy authentic Ayurvedic medicines online',
    contact_email: 'support@ayushmednest.com',
    contact_phone: '+91 1800-XXX-XXXX',
    facebook_url: '',
    twitter_url: '',
    instagram_url: '',
    youtube_url: '',
    theme_primary_color: '#2F5C3E',
    theme_secondary_color: '#F97316',
    google_analytics_id: '',
    facebook_pixel_id: '',
    google_tag_manager_id: '',
    announcement_bar_text: '',
    announcement_bar_enabled: false
  });

  // Menus State
  const [menus, setMenus] = useState([]);
  const [menuForm, setMenuForm] = useState({ name: '', url: '', order: 0, is_active: true });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [
        integrationsRes, 
        emailTemplatesRes, 
        smsTemplatesRes, 
        newsletterRes, 
        logsRes,
        reviewsRes,
        questionsRes,
        vendorsRes,
        affiliatesRes,
        websiteRes,
        menusRes
      ] = await Promise.all([
        axios.get(`${API}/admin/integrations`, { headers }).catch(() => ({ data: {} })),
        axios.get(`${API}/admin/email-templates`, { headers }).catch(() => ({ data: { templates: [] } })),
        axios.get(`${API}/admin/sms-templates`, { headers }).catch(() => ({ data: { templates: [] } })),
        axios.get(`${API}/admin/newsletter`, { headers }).catch(() => ({ data: { subscribers: [] } })),
        axios.get(`${API}/admin/audit-logs?limit=50`, { headers }).catch(() => ({ data: { logs: [] } })),
        axios.get(`${API}/admin/reviews/pending`, { headers }).catch(() => ({ data: { reviews: [] } })),
        axios.get(`${API}/admin/questions/pending`, { headers }).catch(() => ({ data: { questions: [] } })),
        axios.get(`${API}/admin/vendors`, { headers }).catch(() => ({ data: { vendors: [] } })),
        axios.get(`${API}/admin/affiliates`, { headers }).catch(() => ({ data: { affiliates: [] } })),
        axios.get(`${API}/cms/settings`).catch(() => ({ data: {} })),
        axios.get(`${API}/cms/menus`).catch(() => ({ data: { menus: [] } }))
      ]);

      setIntegrations(prev => ({ ...prev, ...integrationsRes.data }));
      setEmailTemplates(emailTemplatesRes.data.templates || []);
      setSmsTemplates(smsTemplatesRes.data.templates || []);
      setNewsletterSubscribers(newsletterRes.data.subscribers || []);
      setAuditLogs(logsRes.data.logs || []);
      setPendingReviews(reviewsRes.data.reviews || []);
      setPendingQuestions(questionsRes.data.questions || []);
      setVendors(vendorsRes.data.vendors || []);
      setAffiliates(affiliatesRes.data.affiliates || []);
      if (websiteRes.data && Object.keys(websiteRes.data).length > 0) {
        setWebsiteSettings(prev => ({ ...prev, ...websiteRes.data }));
      }
      setMenus(menusRes.data.menus || []);
    } catch (error) {
      console.error('Failed to load data', error);
    }
  };

  const saveIntegrations = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API}/admin/integrations`, integrations, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Integration settings saved!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  // Connection Tests
  const testRazorpayConnection = async () => {
    setTestingRazorpay(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API}/admin/razorpay/test-connection`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRazorpayStatus(res.data);
      if (res.data.success) {
        toast.success('Razorpay connected successfully!');
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      setRazorpayStatus({ success: false, message: error.response?.data?.detail || 'Connection failed' });
      toast.error('Razorpay connection test failed');
    } finally {
      setTestingRazorpay(false);
    }
  };

  const testShiprocketConnection = async () => {
    setTestingShiprocket(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API}/admin/shiprocket/test-connection`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShiprocketStatus(res.data);
      if (res.data.success) {
        toast.success('Shiprocket connected successfully!');
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      setShiprocketStatus({ success: false, message: error.response?.data?.detail || 'Connection failed' });
      toast.error('Shiprocket connection test failed');
    } finally {
      setTestingShiprocket(false);
    }
  };

  // Review Actions
  const approveReview = async (reviewId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API}/admin/reviews/${reviewId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Review approved!');
      setPendingReviews(prev => prev.filter(r => r.id !== reviewId));
    } catch (error) {
      toast.error('Failed to approve review');
    }
  };

  const deleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/admin/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Review deleted!');
      setPendingReviews(prev => prev.filter(r => r.id !== reviewId));
    } catch (error) {
      toast.error('Failed to delete review');
    }
  };

  // Question Actions
  const approveQuestion = async (questionId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API}/admin/questions/${questionId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Question approved!');
      setPendingQuestions(prev => prev.filter(q => q.id !== questionId));
    } catch (error) {
      toast.error('Failed to approve question');
    }
  };

  const deleteQuestion = async (questionId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/admin/questions/${questionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Question deleted!');
      setPendingQuestions(prev => prev.filter(q => q.id !== questionId));
    } catch (error) {
      toast.error('Failed to delete question');
    }
  };

  // Vendor Actions
  const approveVendor = async (vendorId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API}/admin/vendors/${vendorId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Vendor approved!');
      setVendors(prev => prev.map(v => v.id === vendorId ? { ...v, is_approved: true } : v));
    } catch (error) {
      toast.error('Failed to approve vendor');
    }
  };

  // Template creation
  const createEmailTemplate = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/admin/email-templates`, emailForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Email template created!');
      setEmailForm({ name: '', subject: '', body: '', variables: [] });
      loadAllData();
    } catch (error) {
      toast.error('Failed to create template');
    }
  };

  const createSMSTemplate = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/admin/sms-templates`, smsForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('SMS template created!');
      setSmsForm({ name: '', template_id: '', message: '', variables: [] });
      loadAllData();
    } catch (error) {
      toast.error('Failed to create template');
    }
  };

  const createTestimonial = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/admin/testimonials`, testimonialForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Testimonial created!');
      setTestimonialForm({ customer_name: '', rating: 5, comment: '', is_featured: false });
    } catch (error) {
      toast.error('Failed to create testimonial');
    }
  };

  // Website Settings
  const saveWebsiteSettings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API}/cms/settings`, websiteSettings, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Website settings saved!');
    } catch (error) {
      toast.error('Failed to save website settings');
    } finally {
      setLoading(false);
    }
  };

  // Menu Management
  const addMenu = async () => {
    if (!menuForm.name || !menuForm.url) {
      toast.error('Name and URL are required');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/cms/menus`, { ...menuForm, order: menus.length }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Menu item added!');
      setMenuForm({ name: '', url: '', order: 0, is_active: true });
      loadAllData();
    } catch (error) {
      toast.error('Failed to add menu');
    }
  };

  const deleteMenu = async (menuId) => {
    if (!window.confirm('Delete this menu item?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/cms/menus/${menuId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Menu deleted!');
      loadAllData();
    } catch (error) {
      toast.error('Failed to delete menu');
    }
  };

  const navItems = [
    { id: 'overview', icon: BarChart3, label: 'Overview' },
    { id: 'website', icon: Globe, label: 'Website' },
    { id: 'reviews', icon: Star, label: 'Reviews', badge: pendingReviews.length },
    { id: 'questions', icon: HelpCircle, label: 'Q&A', badge: pendingQuestions.length },
    { id: 'vendors', icon: Store, label: 'Vendors', badge: vendors.filter(v => !v.is_approved).length },
    { id: 'affiliates', icon: Users, label: 'Affiliates' },
    { id: 'payment', icon: CreditCard, label: 'Payment' },
    { id: 'shipping', icon: Truck, label: 'Shipping' },
    { id: 'email', icon: Mail, label: 'Email' },
    { id: 'notifications', icon: Bell, label: 'SMS' },
    { id: 'testimonials', icon: MessageSquare, label: 'Testimonials' },
    { id: 'newsletter', icon: Mail, label: 'Newsletter' },
    { id: 'seo', icon: Search, label: 'SEO' },
    { id: 'audit', icon: FileText, label: 'Audit Logs' },
  ];

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8" data-testid="admin-panel">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1A2F23]" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Admin Control Panel
          </h1>
          <p className="text-slate-600 mt-1">Manage your marketplace platform</p>
        </div>

        {/* Section Navigation */}
        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-3 mb-8">
          {navItems.map(item => (
            <Button
              key={item.id}
              variant={activeSection === item.id ? 'default' : 'outline'}
              onClick={() => setActiveSection(item.id)}
              className={`h-16 flex flex-col gap-1 relative ${activeSection === item.id ? 'bg-[#2F5C3E]' : ''}`}
              data-testid={`nav-${item.id}`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs">{item.label}</span>
              {item.badge > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500">
                  {item.badge}
                </Badge>
              )}
            </Button>
          ))}
        </div>

        {/* Overview Section */}
        {activeSection === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-80">Pending Reviews</p>
                    <p className="text-3xl font-bold">{pendingReviews.length}</p>
                  </div>
                  <Star className="h-10 w-10 opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-80">Pending Questions</p>
                    <p className="text-3xl font-bold">{pendingQuestions.length}</p>
                  </div>
                  <HelpCircle className="h-10 w-10 opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-80">Total Vendors</p>
                    <p className="text-3xl font-bold">{vendors.length}</p>
                  </div>
                  <Store className="h-10 w-10 opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-80">Affiliates</p>
                    <p className="text-3xl font-bold">{affiliates.length}</p>
                  </div>
                  <Users className="h-10 w-10 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Website Settings Section */}
        {activeSection === 'website' && (
          <div className="space-y-6" data-testid="website-section">
            {/* General Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  General Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Website Name</Label>
                    <Input
                      value={websiteSettings.website_name}
                      onChange={(e) => setWebsiteSettings({...websiteSettings, website_name: e.target.value})}
                      placeholder="AYUSHMEDNEST"
                      data-testid="website-name"
                    />
                  </div>
                  <div>
                    <Label>Contact Email</Label>
                    <Input
                      type="email"
                      value={websiteSettings.contact_email}
                      onChange={(e) => setWebsiteSettings({...websiteSettings, contact_email: e.target.value})}
                      placeholder="support@example.com"
                    />
                  </div>
                  <div>
                    <Label>Contact Phone</Label>
                    <Input
                      value={websiteSettings.contact_phone}
                      onChange={(e) => setWebsiteSettings({...websiteSettings, contact_phone: e.target.value})}
                      placeholder="+91 1800-XXX-XXXX"
                    />
                  </div>
                  <div>
                    <Label>Logo URL</Label>
                    <Input
                      value={websiteSettings.logo_url}
                      onChange={(e) => setWebsiteSettings({...websiteSettings, logo_url: e.target.value})}
                      placeholder="https://example.com/logo.png"
                    />
                  </div>
                  <div>
                    <Label>Favicon URL</Label>
                    <Input
                      value={websiteSettings.favicon_url}
                      onChange={(e) => setWebsiteSettings({...websiteSettings, favicon_url: e.target.value})}
                      placeholder="https://example.com/favicon.ico"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Theme Colors */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Theme Colors
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Primary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={websiteSettings.theme_primary_color}
                        onChange={(e) => setWebsiteSettings({...websiteSettings, theme_primary_color: e.target.value})}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={websiteSettings.theme_primary_color}
                        onChange={(e) => setWebsiteSettings({...websiteSettings, theme_primary_color: e.target.value})}
                        placeholder="#2F5C3E"
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Secondary/Accent Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={websiteSettings.theme_secondary_color}
                        onChange={(e) => setWebsiteSettings({...websiteSettings, theme_secondary_color: e.target.value})}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={websiteSettings.theme_secondary_color}
                        onChange={(e) => setWebsiteSettings({...websiteSettings, theme_secondary_color: e.target.value})}
                        placeholder="#F97316"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 p-4 rounded-lg border">
                  <div className="w-20 h-20 rounded-lg" style={{ backgroundColor: websiteSettings.theme_primary_color }}></div>
                  <div className="w-20 h-20 rounded-lg" style={{ backgroundColor: websiteSettings.theme_secondary_color }}></div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-600">Preview your theme colors</p>
                    <Button className="mt-2" style={{ backgroundColor: websiteSettings.theme_primary_color }}>Primary Button</Button>
                    <Button className="mt-2 ml-2" style={{ backgroundColor: websiteSettings.theme_secondary_color }}>Secondary Button</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SEO Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  SEO Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Meta Title</Label>
                  <Input
                    value={websiteSettings.meta_title}
                    onChange={(e) => setWebsiteSettings({...websiteSettings, meta_title: e.target.value})}
                    placeholder="India's Most Trusted AYUSH Marketplace"
                  />
                </div>
                <div>
                  <Label>Meta Description</Label>
                  <Textarea
                    value={websiteSettings.meta_description}
                    onChange={(e) => setWebsiteSettings({...websiteSettings, meta_description: e.target.value})}
                    placeholder="Buy authentic Ayurvedic medicines online..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Social Media Links
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Facebook URL</Label>
                    <Input
                      value={websiteSettings.facebook_url}
                      onChange={(e) => setWebsiteSettings({...websiteSettings, facebook_url: e.target.value})}
                      placeholder="https://facebook.com/ayushmednest"
                    />
                  </div>
                  <div>
                    <Label>Twitter/X URL</Label>
                    <Input
                      value={websiteSettings.twitter_url}
                      onChange={(e) => setWebsiteSettings({...websiteSettings, twitter_url: e.target.value})}
                      placeholder="https://twitter.com/ayushmednest"
                    />
                  </div>
                  <div>
                    <Label>Instagram URL</Label>
                    <Input
                      value={websiteSettings.instagram_url}
                      onChange={(e) => setWebsiteSettings({...websiteSettings, instagram_url: e.target.value})}
                      placeholder="https://instagram.com/ayushmednest"
                    />
                  </div>
                  <div>
                    <Label>YouTube URL</Label>
                    <Input
                      value={websiteSettings.youtube_url}
                      onChange={(e) => setWebsiteSettings({...websiteSettings, youtube_url: e.target.value})}
                      placeholder="https://youtube.com/ayushmednest"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Analytics & Tracking
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Google Analytics ID</Label>
                    <Input
                      value={websiteSettings.google_analytics_id}
                      onChange={(e) => setWebsiteSettings({...websiteSettings, google_analytics_id: e.target.value})}
                      placeholder="G-XXXXXXXXXX"
                    />
                  </div>
                  <div>
                    <Label>Google Tag Manager ID</Label>
                    <Input
                      value={websiteSettings.google_tag_manager_id}
                      onChange={(e) => setWebsiteSettings({...websiteSettings, google_tag_manager_id: e.target.value})}
                      placeholder="GTM-XXXXXXX"
                    />
                  </div>
                  <div>
                    <Label>Facebook Pixel ID</Label>
                    <Input
                      value={websiteSettings.facebook_pixel_id}
                      onChange={(e) => setWebsiteSettings({...websiteSettings, facebook_pixel_id: e.target.value})}
                      placeholder="XXXXXXXXXXXXXXX"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Announcement Bar */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Announcement Bar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Switch
                    checked={websiteSettings.announcement_bar_enabled}
                    onCheckedChange={(checked) => setWebsiteSettings({...websiteSettings, announcement_bar_enabled: checked})}
                  />
                  <Label>Enable Announcement Bar</Label>
                </div>
                <div>
                  <Label>Announcement Text</Label>
                  <Input
                    value={websiteSettings.announcement_bar_text}
                    onChange={(e) => setWebsiteSettings({...websiteSettings, announcement_bar_text: e.target.value})}
                    placeholder="Free shipping on orders above ₹500!"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Navigation Menu */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Menu className="h-5 w-5" />
                  Navigation Menu
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Menu Name</Label>
                    <Input
                      value={menuForm.name}
                      onChange={(e) => setMenuForm({...menuForm, name: e.target.value})}
                      placeholder="Products"
                    />
                  </div>
                  <div>
                    <Label>URL</Label>
                    <Input
                      value={menuForm.url}
                      onChange={(e) => setMenuForm({...menuForm, url: e.target.value})}
                      placeholder="/products"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={addMenu} className="bg-[#2F5C3E] w-full">
                      <Plus className="h-4 w-4 mr-2" /> Add Menu Item
                    </Button>
                  </div>
                </div>
                
                {menus.length > 0 && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>URL</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {menus.map((menu) => (
                        <TableRow key={menu.id}>
                          <TableCell className="font-medium">{menu.name}</TableCell>
                          <TableCell>{menu.url}</TableCell>
                          <TableCell>
                            <Badge variant={menu.is_active ? 'success' : 'secondary'}>
                              {menu.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button size="sm" variant="destructive" onClick={() => deleteMenu(menu.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <Button onClick={saveWebsiteSettings} disabled={loading} className="bg-[#2F5C3E] w-full h-12" data-testid="save-website-settings">
              <Save className="mr-2 h-4 w-4" />
              {loading ? 'Saving...' : 'Save All Website Settings'}
            </Button>
          </div>
        )}

        {/* Reviews Section */}
        {activeSection === 'reviews' && (
          <Card data-testid="reviews-section">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Pending Reviews ({pendingReviews.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingReviews.length === 0 ? (
                <div className="text-center py-10 text-slate-500">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p>All reviews have been processed!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingReviews.map(review => (
                    <div key={review.id} className="border rounded-lg p-4" data-testid={`review-${review.id}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold">{review.user_name}</span>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                              ))}
                            </div>
                          </div>
                          {review.title && <p className="font-medium">{review.title}</p>}
                          <p className="text-slate-600 text-sm mt-1">{review.comment}</p>
                          <p className="text-xs text-slate-400 mt-2">Product ID: {review.product_id}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => approveReview(review.id)} className="bg-green-600 hover:bg-green-700" data-testid={`approve-review-${review.id}`}>
                            <CheckCircle className="h-4 w-4 mr-1" /> Approve
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => deleteReview(review.id)} data-testid={`delete-review-${review.id}`}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Questions Section */}
        {activeSection === 'questions' && (
          <Card data-testid="questions-section">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Pending Questions ({pendingQuestions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingQuestions.length === 0 ? (
                <div className="text-center py-10 text-slate-500">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p>All questions have been answered!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingQuestions.map(question => (
                    <div key={question.id} className="border rounded-lg p-4" data-testid={`question-${question.id}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium mb-1">Q: {question.question_text}</p>
                          <p className="text-xs text-slate-400">Product ID: {question.product_id}</p>
                          <p className="text-xs text-slate-400">Asked by: {question.user_name || 'Anonymous'}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => approveQuestion(question.id)} className="bg-green-600 hover:bg-green-700" data-testid={`approve-question-${question.id}`}>
                            <CheckCircle className="h-4 w-4 mr-1" /> Approve
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => deleteQuestion(question.id)} data-testid={`delete-question-${question.id}`}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Vendors Section */}
        {activeSection === 'vendors' && (
          <Card data-testid="vendors-section">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Vendor Management ({vendors.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {vendors.length === 0 ? (
                <div className="text-center py-10 text-slate-500">
                  <Store className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No vendors registered yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Business Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>GST Number</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vendors.map(vendor => (
                      <TableRow key={vendor.id} data-testid={`vendor-${vendor.id}`}>
                        <TableCell className="font-medium">{vendor.business_name || vendor.full_name}</TableCell>
                        <TableCell>{vendor.email}</TableCell>
                        <TableCell>{vendor.phone || '-'}</TableCell>
                        <TableCell>{vendor.gst_number || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={vendor.is_approved ? 'success' : 'warning'}>
                            {vendor.is_approved ? 'Approved' : 'Pending'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {!vendor.is_approved && (
                            <Button size="sm" onClick={() => approveVendor(vendor.id)} className="bg-green-600 hover:bg-green-700" data-testid={`approve-vendor-${vendor.id}`}>
                              <UserCheck className="h-4 w-4 mr-1" /> Approve
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}

        {/* Affiliates Section */}
        {activeSection === 'affiliates' && (
          <Card data-testid="affiliates-section">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Affiliate Management ({affiliates.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {affiliates.length === 0 ? (
                <div className="text-center py-10 text-slate-500">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No affiliates registered yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Referral Code</TableHead>
                      <TableHead>Commission Rate</TableHead>
                      <TableHead>Total Earnings</TableHead>
                      <TableHead>Pending</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {affiliates.map(aff => (
                      <TableRow key={aff.id} data-testid={`affiliate-${aff.id}`}>
                        <TableCell className="font-medium">{aff.user?.full_name || 'N/A'}</TableCell>
                        <TableCell>{aff.user?.email || 'N/A'}</TableCell>
                        <TableCell>
                          <code className="bg-slate-100 px-2 py-1 rounded text-sm">{aff.referral_code}</code>
                        </TableCell>
                        <TableCell>{aff.commission_rate}%</TableCell>
                        <TableCell className="text-green-600 font-medium">₹{aff.total_earnings?.toFixed(2) || '0.00'}</TableCell>
                        <TableCell className="text-amber-600">₹{aff.pending_earnings?.toFixed(2) || '0.00'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}

        {/* Payment Gateway Section */}
        {activeSection === 'payment' && (
          <Card data-testid="payment-section">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Gateway Settings (Razorpay)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Razorpay Key ID</Label>
                  <Input
                    value={integrations.razorpay_key_id}
                    onChange={(e) => setIntegrations({...integrations, razorpay_key_id: e.target.value})}
                    placeholder="rzp_live_xxxxx or rzp_test_xxxxx"
                    data-testid="razorpay-key-id"
                  />
                </div>
                <div>
                  <Label>Razorpay Key Secret</Label>
                  <Input
                    type="password"
                    value={integrations.razorpay_key_secret}
                    onChange={(e) => setIntegrations({...integrations, razorpay_key_secret: e.target.value})}
                    placeholder="Enter your Razorpay secret key"
                    data-testid="razorpay-key-secret"
                  />
                </div>
              </div>

              {/* Connection Status */}
              {razorpayStatus && (
                <div className={`p-4 rounded-lg border ${razorpayStatus.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex items-center gap-2">
                    {razorpayStatus.success ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <span className={razorpayStatus.success ? 'text-green-700' : 'text-red-700'}>
                      {razorpayStatus.message}
                    </span>
                  </div>
                </div>
              )}

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  Get your Razorpay keys from: <a href="https://dashboard.razorpay.com/app/keys" target="_blank" rel="noopener noreferrer" className="underline font-medium">Razorpay Dashboard</a>
                </p>
              </div>

              <div className="flex gap-4">
                <Button onClick={saveIntegrations} disabled={loading} className="bg-[#2F5C3E]" data-testid="save-payment-btn">
                  <Save className="mr-2 h-4 w-4" />
                  {loading ? 'Saving...' : 'Save Settings'}
                </Button>
                <Button onClick={testRazorpayConnection} disabled={testingRazorpay} variant="outline" data-testid="test-razorpay-btn">
                  {testingRazorpay ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                  Test Connection
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Shipping Section */}
        {activeSection === 'shipping' && (
          <Card data-testid="shipping-section">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Shipping Integration (Shiprocket)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Shiprocket Email</Label>
                  <Input
                    type="email"
                    value={integrations.shiprocket_email}
                    onChange={(e) => setIntegrations({...integrations, shiprocket_email: e.target.value})}
                    placeholder="your@email.com"
                    data-testid="shiprocket-email"
                  />
                </div>
                <div>
                  <Label>Shiprocket Password</Label>
                  <Input
                    type="password"
                    value={integrations.shiprocket_password}
                    onChange={(e) => setIntegrations({...integrations, shiprocket_password: e.target.value})}
                    placeholder="Your Shiprocket password"
                    data-testid="shiprocket-password"
                  />
                </div>
              </div>

              {/* Connection Status */}
              {shiprocketStatus && (
                <div className={`p-4 rounded-lg border ${shiprocketStatus.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex items-center gap-2">
                    {shiprocketStatus.success ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <span className={shiprocketStatus.success ? 'text-green-700' : 'text-red-700'}>
                      {shiprocketStatus.message}
                      {shiprocketStatus.company_name && ` (${shiprocketStatus.company_name})`}
                    </span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Default Shipping Charge (₹)</Label>
                  <Input
                    type="number"
                    value={integrations.shipping_charge}
                    onChange={(e) => setIntegrations({...integrations, shipping_charge: parseFloat(e.target.value)})}
                    data-testid="shipping-charge"
                  />
                </div>
                <div>
                  <Label>Tax Rate (%)</Label>
                  <Input
                    type="number"
                    value={integrations.tax_rate}
                    onChange={(e) => setIntegrations({...integrations, tax_rate: parseFloat(e.target.value)})}
                    data-testid="tax-rate"
                  />
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  Orders will automatically push to Shiprocket when marked as "Confirmed". Sign up at: <a href="https://app.shiprocket.in/register" target="_blank" rel="noopener noreferrer" className="underline font-medium">Shiprocket</a>
                </p>
              </div>

              <div className="flex gap-4">
                <Button onClick={saveIntegrations} disabled={loading} className="bg-[#2F5C3E]" data-testid="save-shipping-btn">
                  <Save className="mr-2 h-4 w-4" />
                  Save Settings
                </Button>
                <Button onClick={testShiprocketConnection} disabled={testingShiprocket} variant="outline" data-testid="test-shiprocket-btn">
                  {testingShiprocket ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                  Test Connection
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Email Section */}
        {activeSection === 'email' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email SMTP Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>SMTP Host</Label>
                    <Input
                      value={integrations.smtp_host}
                      onChange={(e) => setIntegrations({...integrations, smtp_host: e.target.value})}
                      placeholder="smtp.gmail.com"
                    />
                  </div>
                  <div>
                    <Label>SMTP Port</Label>
                    <Input
                      type="number"
                      value={integrations.smtp_port}
                      onChange={(e) => setIntegrations({...integrations, smtp_port: parseInt(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label>SMTP Username</Label>
                    <Input
                      value={integrations.smtp_username}
                      onChange={(e) => setIntegrations({...integrations, smtp_username: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>SMTP Password</Label>
                    <Input
                      type="password"
                      value={integrations.smtp_password}
                      onChange={(e) => setIntegrations({...integrations, smtp_password: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <Label>From Email Address</Label>
                  <Input
                    value={integrations.smtp_from_email}
                    onChange={(e) => setIntegrations({...integrations, smtp_from_email: e.target.value})}
                    placeholder="noreply@ayushmednest.com"
                  />
                </div>
                <Button onClick={saveIntegrations} className="bg-[#2F5C3E]">
                  <Save className="mr-2 h-4 w-4" />
                  Save SMTP Settings
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Email Templates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Template Name</Label>
                    <Input
                      value={emailForm.name}
                      onChange={(e) => setEmailForm({...emailForm, name: e.target.value})}
                      placeholder="Order Confirmation"
                    />
                  </div>
                  <div>
                    <Label>Subject</Label>
                    <Input
                      value={emailForm.subject}
                      onChange={(e) => setEmailForm({...emailForm, subject: e.target.value})}
                      placeholder="Your Order #{{order_id}} is Confirmed"
                    />
                  </div>
                </div>
                <div>
                  <Label>Email Body (HTML supported)</Label>
                  <Textarea
                    value={emailForm.body}
                    onChange={(e) => setEmailForm({...emailForm, body: e.target.value})}
                    rows={6}
                    placeholder="Dear {{customer_name}}, Your order has been confirmed..."
                  />
                </div>
                <Button onClick={createEmailTemplate} className="bg-[#2F5C3E]">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Email Template
                </Button>

                <div className="mt-6">
                  <h4 className="font-semibold mb-3">Existing Templates</h4>
                  <div className="space-y-2">
                    {emailTemplates.map((template) => (
                      <div key={template.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{template.name}</p>
                          <p className="text-sm text-slate-500">{template.subject}</p>
                        </div>
                        <Button size="sm" variant="ghost">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {emailTemplates.length === 0 && <p className="text-slate-500 text-sm">No templates created yet</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* SMS/Notifications Section */}
        {activeSection === 'notifications' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  MSG91 SMS Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>MSG91 Auth Key</Label>
                  <Input
                    value={integrations.msg91_auth_key}
                    onChange={(e) => setIntegrations({...integrations, msg91_auth_key: e.target.value})}
                    placeholder="Your MSG91 Auth Key"
                  />
                </div>
                <div>
                  <Label>Sender ID</Label>
                  <Input
                    value={integrations.msg91_sender_id}
                    onChange={(e) => setIntegrations({...integrations, msg91_sender_id: e.target.value})}
                    placeholder="AYUSMD"
                    maxLength={6}
                  />
                </div>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    Get MSG91 credentials from: <a href="https://control.msg91.com/signup/" target="_blank" rel="noopener noreferrer" className="underline">MSG91 Dashboard</a>
                  </p>
                </div>
                <Button onClick={saveIntegrations} className="bg-[#2F5C3E]">
                  <Save className="mr-2 h-4 w-4" />
                  Save MSG91 Settings
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SMS Templates (MSG91)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Template Name</Label>
                    <Input
                      value={smsForm.name}
                      onChange={(e) => setSmsForm({...smsForm, name: e.target.value})}
                      placeholder="Order Confirmation SMS"
                    />
                  </div>
                  <div>
                    <Label>MSG91 Template ID</Label>
                    <Input
                      value={smsForm.template_id}
                      onChange={(e) => setSmsForm({...smsForm, template_id: e.target.value})}
                      placeholder="65abc123def..."
                    />
                  </div>
                </div>
                <div>
                  <Label>Message Template</Label>
                  <Textarea
                    value={smsForm.message}
                    onChange={(e) => setSmsForm({...smsForm, message: e.target.value})}
                    rows={3}
                    placeholder="Your order ##order_id## is confirmed. Track at: ##link##"
                  />
                </div>
                <Button onClick={createSMSTemplate} className="bg-[#2F5C3E]">
                  <Plus className="mr-2 h-4 w-4" />
                  Create SMS Template
                </Button>

                <div className="mt-6">
                  <h4 className="font-semibold mb-3">Existing SMS Templates</h4>
                  <div className="space-y-2">
                    {smsTemplates.map((template) => (
                      <div key={template.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{template.name}</p>
                          <p className="text-xs text-slate-500">Template ID: {template.template_id}</p>
                        </div>
                        <Badge>{template.is_active ? 'Active' : 'Inactive'}</Badge>
                      </div>
                    ))}
                    {smsTemplates.length === 0 && <p className="text-slate-500 text-sm">No templates created yet</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Testimonials Section */}
        {activeSection === 'testimonials' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Create Testimonial</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Customer Name</Label>
                  <Input
                    value={testimonialForm.customer_name}
                    onChange={(e) => setTestimonialForm({...testimonialForm, customer_name: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Rating (1-5)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="5"
                    value={testimonialForm.rating}
                    onChange={(e) => setTestimonialForm({...testimonialForm, rating: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <Label>Comment</Label>
                  <Textarea
                    value={testimonialForm.comment}
                    onChange={(e) => setTestimonialForm({...testimonialForm, comment: e.target.value})}
                    rows={4}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={testimonialForm.is_featured}
                    onCheckedChange={(checked) => setTestimonialForm({...testimonialForm, is_featured: checked})}
                  />
                  <Label>Feature on Homepage</Label>
                </div>
                <Button onClick={createTestimonial} className="w-full bg-[#2F5C3E]">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Testimonial
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Testimonials</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 text-sm">Testimonials will appear here after creation</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Newsletter Section */}
        {activeSection === 'newsletter' && (
          <Card>
            <CardHeader>
              <CardTitle>Newsletter Subscribers ({newsletterSubscribers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Button className="bg-[#2F5C3E]">Export to CSV</Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Subscribed Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {newsletterSubscribers.slice(0, 20).map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell>{sub.email}</TableCell>
                      <TableCell>{new Date(sub.subscribed_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={sub.is_active ? 'success' : 'secondary'}>
                          {sub.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {newsletterSubscribers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-slate-500">No subscribers yet</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* SEO Section */}
        {activeSection === 'seo' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                SEO & Google Indexing API
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Google Indexing API JSON Key</Label>
                <Textarea
                  value={integrations.google_indexing_json_key}
                  onChange={(e) => setIntegrations({...integrations, google_indexing_json_key: e.target.value})}
                  rows={8}
                  placeholder='Paste your Google Cloud service account JSON key here...'
                />
                <div className="mt-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800 font-semibold mb-2">Setup Instructions:</p>
                  <ol className="text-sm text-yellow-700 space-y-1 list-decimal ml-4">
                    <li>Go to <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a></li>
                    <li>Create a new project or select existing</li>
                    <li>Enable "Web Search Indexing API"</li>
                    <li>Create Service Account credentials</li>
                    <li>Download JSON key file and paste content above</li>
                    <li>Add service account email to Search Console</li>
                  </ol>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">Auto-Generated</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>✓ XML Sitemap: /api/sitemap.xml</li>
                    <li>✓ Robots.txt: /api/robots.txt</li>
                  </ul>
                </div>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Auto-Indexing</h4>
                  <p className="text-sm text-blue-700">
                    New products, categories, and blog posts are automatically submitted to Google for instant indexing.
                  </p>
                </div>
              </div>

              <Button onClick={saveIntegrations} className="bg-[#2F5C3E]">
                <Save className="mr-2 h-4 w-4" />
                Save SEO Settings
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Audit Logs Section */}
        {activeSection === 'audit' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Audit Logs (Recent 50)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Changes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-xs">{new Date(log.timestamp).toLocaleString()}</TableCell>
                      <TableCell className="text-sm">{log.user_email}</TableCell>
                      <TableCell><Badge variant="outline">{log.action}</Badge></TableCell>
                      <TableCell className="text-sm">{log.entity_type}</TableCell>
                      <TableCell className="text-xs">
                        <Button size="sm" variant="ghost"><Eye className="h-3 w-3" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {auditLogs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-slate-500">No audit logs yet</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ComprehensiveAdminPanel;
