import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { login as apiLogin, seedData } from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate(`/${user.role}`);
    }
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setLoading(true);
    try {
      const response = await apiLogin(email, password);
      const { access_token, user: userData } = response.data;
      login(access_token, userData);
      toast.success(`Welcome back, ${userData.name}!`);
      navigate(`/${userData.role}`);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleSeedData = async () => {
    setSeeding(true);
    try {
      await seedData();
      toast.success('Demo data created! Use the credentials below to login.');
    } catch (error) {
      toast.error('Failed to seed data');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Image/Brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-secondary relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-white">
          <div className="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-8">
            <GraduationCap size={48} className="text-white" />
          </div>
          <h1 className="text-4xl font-heading font-bold text-center mb-4">
            Shri B. G. Garaiya
          </h1>
          <h2 className="text-2xl font-heading text-center mb-2">
            Homoeopathic Medical College
          </h2>
          <p className="text-lg text-white/80 text-center mb-8">& Hospital, Rajkot</p>
          <div className="max-w-md text-center">
            <p className="text-white/70 text-sm leading-relaxed">
              Empowering future homeopathic physicians with excellence in education,
              research, and patient care since inception.
            </p>
          </div>
        </div>
        {/* Decorative circles */}
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/5 rounded-full"></div>
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full"></div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile header */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
              <GraduationCap size={32} className="text-white" />
            </div>
            <h1 className="text-xl font-heading font-bold text-secondary">
              Shri B. G. Garaiya College
            </h1>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-heading font-bold text-gray-900">Welcome Back</h2>
              <p className="text-gray-500 mt-2">Sign in to your account</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="input-field pl-11"
                    data-testid="login-email-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="input-field pl-11 pr-11"
                    data-testid="login-password-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 flex items-center justify-center gap-2"
                data-testid="login-submit-button"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Demo credentials */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-sm text-gray-500 text-center mb-4">Demo Credentials</p>
              <div className="space-y-3 text-sm">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="font-medium text-gray-700">Principal</p>
                  <p className="text-gray-500 font-mono text-xs">principal@bggaraiya.edu / principal123</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="font-medium text-gray-700">Teacher</p>
                  <p className="text-gray-500 font-mono text-xs">teacher@bggaraiya.edu / teacher123</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="font-medium text-gray-700">Student</p>
                  <p className="text-gray-500 font-mono text-xs">student@bggaraiya.edu / student123</p>
                </div>
              </div>
              <button
                onClick={handleSeedData}
                disabled={seeding}
                className="w-full mt-4 btn-outline py-2 text-sm"
                data-testid="seed-data-button"
              >
                {seeding ? 'Creating Demo Data...' : 'Initialize Demo Data'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
