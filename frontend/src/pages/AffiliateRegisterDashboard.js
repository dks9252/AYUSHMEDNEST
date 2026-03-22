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
  Users, Link2, DollarSign, TrendingUp, Copy, ExternalLink,
  Share2, Gift, CheckCircle, Clock, BarChart3, Wallet
} from 'lucide-react';
import { toast } from 'sonner';

const AffiliateDashboard = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [affiliateData, setAffiliateData] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [earnings, setEarnings] = useState([]);

  useEffect(() => {
    if (user) {
      loadAffiliateData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadAffiliateData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [dashboardRes, referralsRes, earningsRes] = await Promise.all([
        axios.get(`${API}/affiliate/dashboard`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/affiliate/referrals`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: { referrals: [] } })),
        axios.get(`${API}/affiliate/earnings`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: { payouts: [] } }))
      ]);
      setAffiliateData(dashboardRes.data);
      setReferrals(referralsRes.data.referrals || []);
      setEarnings(earningsRes.data.payouts || []);
    } catch (error) {
      if (error.response?.status === 404) {
        // Not registered as affiliate
        setAffiliateData(null);
      } else {
        console.error('Failed to load affiliate data', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const registerAffiliate = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API}/affiliate/register`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Successfully registered as affiliate!');
      loadAffiliateData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    }
  };

  const copyReferralLink = () => {
    const link = `https://www.ayushmednest.com/?ref=${affiliateData?.referral_code}`;
    navigator.clipboard.writeText(link);
    toast.success('Referral link copied to clipboard!');
  };

  const shareOnWhatsApp = () => {
    const link = `https://www.ayushmednest.com/?ref=${affiliateData?.referral_code}`;
    const text = `Check out AYUSHMEDNEST - India's leading AYUSH healthcare marketplace! Use my referral link: ${link}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
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

  // Show registration page if not an affiliate
  if (!affiliateData) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Gift className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Earn Money with AYUSHMEDNEST
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Join our affiliate program and earn commissions on every sale you refer. 
              Share products with your audience and start earning today!
            </p>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
            <Card className="text-center p-6">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-7 w-7 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Up to 10% Commission</h3>
              <p className="text-sm text-slate-600">Earn competitive commissions on every successful referral</p>
            </Card>
            <Card className="text-center p-6">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">30-Day Cookie</h3>
              <p className="text-sm text-slate-600">Get credit for sales made within 30 days of click</p>
            </Card>
            <Card className="text-center p-6">
              <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wallet className="h-7 w-7 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Weekly Payouts</h3>
              <p className="text-sm text-slate-600">Receive your earnings directly to your bank account</p>
            </Card>
          </div>

          {/* How it works */}
          <div className="max-w-4xl mx-auto mb-12">
            <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">1</div>
                <h4 className="font-semibold text-slate-900 mb-1">Sign Up</h4>
                <p className="text-sm text-slate-600">Register for free affiliate account</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">2</div>
                <h4 className="font-semibold text-slate-900 mb-1">Get Your Link</h4>
                <p className="text-sm text-slate-600">Receive unique referral code</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">3</div>
                <h4 className="font-semibold text-slate-900 mb-1">Share & Promote</h4>
                <p className="text-sm text-slate-600">Share products on social media</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">4</div>
                <h4 className="font-semibold text-slate-900 mb-1">Earn Money</h4>
                <p className="text-sm text-slate-600">Get paid for every sale</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            {user ? (
              <Button onClick={registerAffiliate} size="lg" className="bg-orange-500 hover:bg-orange-600 h-14 px-12 text-lg">
                Join Affiliate Program
              </Button>
            ) : (
              <Link to="/auth">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600 h-14 px-12 text-lg">
                  Login to Join
                </Button>
              </Link>
            )}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Affiliate Dashboard
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Affiliate Dashboard</h1>
            <p className="text-slate-600">Track your referrals and earnings</p>
          </div>
        </div>

        {/* Referral Link Card */}
        <Card className="mb-8 bg-gradient-to-r from-orange-500 to-red-500 text-white">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold mb-1">Your Referral Code</h3>
                <p className="text-2xl font-bold">{affiliateData?.referral_code}</p>
              </div>
              <div className="flex gap-3">
                <Button onClick={copyReferralLink} className="bg-white text-orange-600 hover:bg-orange-50">
                  <Copy className="h-4 w-4 mr-2" /> Copy Link
                </Button>
                <Button onClick={shareOnWhatsApp} className="bg-green-500 hover:bg-green-600 text-white">
                  <Share2 className="h-4 w-4 mr-2" /> Share
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Earnings</p>
                  <p className="text-2xl font-bold text-slate-900">₹{affiliateData?.total_earnings?.toFixed(2) || '0.00'}</p>
                </div>
                <DollarSign className="h-10 w-10 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Pending Earnings</p>
                  <p className="text-2xl font-bold text-slate-900">₹{affiliateData?.pending_earnings?.toFixed(2) || '0.00'}</p>
                </div>
                <Clock className="h-10 w-10 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Commission Rate</p>
                  <p className="text-2xl font-bold text-slate-900">{affiliateData?.commission_rate || 5}%</p>
                </div>
                <TrendingUp className="h-10 w-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Referrals</p>
                  <p className="text-2xl font-bold text-slate-900">{referrals.length}</p>
                </div>
                <Users className="h-10 w-10 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="referrals">Referrals</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
            <TabsTrigger value="resources">Marketing Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Share</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 mb-4">Share your referral link on social media</p>
                  <div className="flex flex-wrap gap-3">
                    <Button onClick={shareOnWhatsApp} className="bg-green-500 hover:bg-green-600">
                      WhatsApp
                    </Button>
                    <Button onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=https://www.ayushmednest.com/?ref=${affiliateData?.referral_code}`, '_blank')} className="bg-blue-600 hover:bg-blue-700">
                      Facebook
                    </Button>
                    <Button onClick={() => window.open(`https://twitter.com/intent/tweet?text=Check%20out%20AYUSHMEDNEST&url=https://www.ayushmednest.com/?ref=${affiliateData?.referral_code}`, '_blank')} className="bg-sky-500 hover:bg-sky-600">
                      Twitter
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Commission Structure</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Standard Products</span>
                      <Badge className="bg-green-100 text-green-700">5%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Premium Products</span>
                      <Badge className="bg-blue-100 text-blue-700">7%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Featured Brands</span>
                      <Badge className="bg-purple-100 text-purple-700">10%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="referrals">
            <Card>
              <CardContent className="p-6">
                {referrals.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Date</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Order ID</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Order Value</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Commission</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {referrals.map((ref, idx) => (
                          <tr key={idx} className="border-b hover:bg-slate-50">
                            <td className="py-3 px-4 text-sm text-slate-600">{new Date(ref.date).toLocaleDateString()}</td>
                            <td className="py-3 px-4 text-sm font-medium text-slate-900">#{ref.order_id?.slice(0, 8)}</td>
                            <td className="py-3 px-4 text-sm text-slate-600">₹{ref.order_value}</td>
                            <td className="py-3 px-4 text-sm font-bold text-green-600">₹{ref.commission}</td>
                            <td className="py-3 px-4">
                              <Badge variant={ref.status === 'paid' ? 'default' : 'secondary'}>
                                {ref.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No Referrals Yet</h3>
                    <p className="text-slate-600 mb-4">Start sharing your referral link to earn commissions</p>
                    <Button onClick={copyReferralLink} className="bg-orange-500 hover:bg-orange-600">
                      <Copy className="h-4 w-4 mr-2" /> Copy Referral Link
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="earnings">
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-12">
                  <Wallet className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">Earnings History</h3>
                  <p className="text-slate-600 mb-4">Your payout history will appear here</p>
                  <div className="bg-slate-50 rounded-lg p-4 max-w-md mx-auto">
                    <p className="text-sm text-slate-600">
                      <strong>Next Payout:</strong> Payouts are processed every Monday for earnings above ₹500
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources">
            <Card>
              <CardHeader>
                <CardTitle>Marketing Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold text-slate-900 mb-2">Product Links</h4>
                    <p className="text-sm text-slate-600 mb-3">Generate affiliate links for specific products</p>
                    <Link to="/products">
                      <Button variant="outline" className="w-full">
                        <ExternalLink className="h-4 w-4 mr-2" /> Browse Products
                      </Button>
                    </Link>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold text-slate-900 mb-2">Banner Ads</h4>
                    <p className="text-sm text-slate-600 mb-3">Download banners for your website</p>
                    <Button variant="outline" className="w-full" disabled>
                      Coming Soon
                    </Button>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold text-slate-900 mb-2">Social Media Posts</h4>
                    <p className="text-sm text-slate-600 mb-3">Ready-to-share social media content</p>
                    <Button variant="outline" className="w-full" disabled>
                      Coming Soon
                    </Button>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold text-slate-900 mb-2">Email Templates</h4>
                    <p className="text-sm text-slate-600 mb-3">Email templates for your newsletter</p>
                    <Button variant="outline" className="w-full" disabled>
                      Coming Soon
                    </Button>
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

export default AffiliateDashboard;
