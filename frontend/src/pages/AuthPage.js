import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API, AuthContext } from '@/App';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const AuthPage = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    role: 'customer'
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(`${API}/auth/login`, loginForm);
      login(res.data.token, res.data.user);
      toast.success('Login successful!');
      
      if (res.data.user.role === 'admin') {
        navigate('/admin');
      } else if (res.data.user.role === 'vendor') {
        navigate('/vendor');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(`${API}/auth/register`, registerForm);
      login(res.data.token, res.data.user);
      toast.success('Registration successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E8F3EA] to-stone-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0" data-testid="auth-card">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-[#1A2F23]" style={{ fontFamily: 'Outfit, sans-serif' }}>
            AYUSHMEDNEST
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login" data-testid="login-tab">Login</TabsTrigger>
              <TabsTrigger value="register" data-testid="register-tab">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <Input
                    type="email"
                    required
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    className="h-11 rounded-xl"
                    data-testid="login-email-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                  <Input
                    type="password"
                    required
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="h-11 rounded-xl"
                    data-testid="login-password-input"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-[#2F5C3E] hover:bg-[#244A30] text-white rounded-full h-11"
                  disabled={loading}
                  data-testid="login-submit-button"
                >
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <Input
                    required
                    value={registerForm.full_name}
                    onChange={(e) => setRegisterForm({ ...registerForm, full_name: e.target.value })}
                    className="h-11 rounded-xl"
                    data-testid="register-name-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <Input
                    type="email"
                    required
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    className="h-11 rounded-xl"
                    data-testid="register-email-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                  <Input
                    type="tel"
                    value={registerForm.phone}
                    onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                    className="h-11 rounded-xl"
                    data-testid="register-phone-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                  <Input
                    type="password"
                    required
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    className="h-11 rounded-xl"
                    data-testid="register-password-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Register As</label>
                  <Select value={registerForm.role} onValueChange={(value) => setRegisterForm({ ...registerForm, role: value })} defaultValue="customer">
                    <SelectTrigger className="h-11 rounded-xl" data-testid="register-role-select">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer">Customer</SelectItem>
                      <SelectItem value="vendor">Vendor</SelectItem>
                      <SelectItem value="affiliate">Affiliate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-[#2F5C3E] hover:bg-[#244A30] text-white rounded-full h-11"
                  disabled={loading}
                  data-testid="register-submit-button"
                >
                  {loading ? 'Registering...' : 'Register'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;
