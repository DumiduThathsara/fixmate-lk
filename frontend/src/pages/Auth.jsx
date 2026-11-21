import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Lock, Mail, MapPin, Phone, User, Wrench } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SRI_LANKA_DISTRICTS } from '../constants/districts';

const SERVICE_CATEGORIES = [
  'Plumbing',
  'Electrical',
  'AC Servicing',
  'Carpentry',
  'Painting',
  'Appliance Repair',
  'Masonry',
];

const SL_PHONE_REGEX = /^07\d(?:\s?\d{3}\s?\d{4}|\d{7})$/;

export default function Auth() {
  const [activeTab, setActiveTab] = useState('login');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Login state
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  // Sign Up state
  const [signupForm, setSignupForm] = useState({
    role: 'CUSTOMER',
    fullName: '',
    email: '',
    phone: '',
    district: 'Colombo',
    serviceCategory: 'Plumbing',
    password: '',
    confirmPassword: '',
  });

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const redirectByRole = (role) => {
    if (role === 'TECHNICIAN') {
      navigate('/technician/dashboard', { replace: true });
    } else {
      navigate('/customer/dashboard', { replace: true });
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const { user } = await login({
        email: loginForm.email,
        password: loginForm.password,
        rememberMe: loginForm.rememberMe,
      });
      redirectByRole(user.role);
    } catch (err) {
      setError(err.message || 'Unable to sign in. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!signupForm.fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!SL_PHONE_REGEX.test(signupForm.phone.trim())) {
      setError('Please enter a valid Sri Lankan mobile number (e.g., 077 123 4567).');
      return;
    }

    if (signupForm.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (signupForm.password !== signupForm.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const { user } = await register(signupForm);
      redirectByRole(user.role);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto flex max-w-lg flex-col justify-center px-4 py-12 sm:px-6">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Header */}
        <div className="border-b border-slate-200 bg-slate-50/70 px-6 py-5 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-700 text-white shadow-sm">
            <Wrench className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Welcome to FixMate LK</h1>
          <p className="mt-1 text-sm text-slate-500">
            {activeTab === 'login'
              ? 'Sign in to manage your bookings or service jobs'
              : 'Create an account to get started'}
          </p>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 border-b border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setError('');
            }}
            className={`py-3 text-sm font-semibold transition-colors ${
              activeTab === 'login'
                ? 'border-b-2 border-blue-700 bg-white text-blue-700'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('signup');
              setError('');
            }}
            className={`py-3 text-sm font-semibold transition-colors ${
              activeTab === 'signup'
                ? 'border-b-2 border-blue-700 bg-white text-blue-700'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign Up
          </button>
        </div>

        <div className="p-6 sm:p-8">
          {error && (
            <div
              role="alert"
              className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {activeTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="login-email"
                    type="email"
                    required
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    placeholder="you@example.com"
                    className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/20"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="login-password" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="login-password"
                    type="password"
                    required
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    placeholder="Enter your password"
                    className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/20"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={loginForm.rememberMe}
                    onChange={(e) => setLoginForm({ ...loginForm, rememberMe: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-700"
                  />
                  Remember me
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Signing in...' : 'Sign In'}
              </button>

              <p className="pt-1 text-center text-xs text-slate-500">
                Tip: In mock mode, emails containing <code className="font-mono text-slate-700">tech</code> sign in as Technician; others sign in as Customer.
              </p>
            </form>
          ) : (
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              {/* Role Selector */}
              <div>
                <span className="mb-2 block text-sm font-medium text-slate-700">I want to join as</span>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setSignupForm({ ...signupForm, role: 'CUSTOMER' })}
                    className={`flex flex-col items-start rounded-xl border p-3 text-left transition-all ${
                      signupForm.role === 'CUSTOMER'
                        ? 'border-blue-700 bg-blue-50/70 ring-1 ring-blue-700'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-sm font-semibold text-slate-900">Customer</span>
                    <span className="text-xs text-slate-500">I need a service</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSignupForm({ ...signupForm, role: 'TECHNICIAN' })}
                    className={`flex flex-col items-start rounded-xl border p-3 text-left transition-all ${
                      signupForm.role === 'TECHNICIAN'
                        ? 'border-blue-700 bg-blue-50/70 ring-1 ring-blue-700'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-sm font-semibold text-slate-900">Technician</span>
                    <span className="text-xs text-slate-500">I offer services</span>
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="signup-name" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Full Name
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="signup-name"
                    type="text"
                    required
                    value={signupForm.fullName}
                    onChange={(e) => setSignupForm({ ...signupForm, fullName: e.target.value })}
                    placeholder="Kamal Perera"
                    className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/20"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="signup-email" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="signup-email"
                    type="email"
                    required
                    value={signupForm.email}
                    onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                    placeholder="kamal@example.com"
                    className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="signup-phone" className="mb-1.5 block text-sm font-medium text-slate-700">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="signup-phone"
                      type="tel"
                      required
                      value={signupForm.phone}
                      onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value })}
                      placeholder="077 123 4567"
                      className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/20"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="signup-district" className="mb-1.5 block text-sm font-medium text-slate-700">
                    District
                  </label>
                  <div className="relative">
                    <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <select
                      id="signup-district"
                      value={signupForm.district}
                      onChange={(e) => setSignupForm({ ...signupForm, district: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/20"
                    >
                      {SRI_LANKA_DISTRICTS.map((district) => (
                        <option key={district} value={district}>
                          {district}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {signupForm.role === 'TECHNICIAN' && (
                <div>
                  <label htmlFor="signup-category" className="mb-1.5 block text-sm font-medium text-slate-700">
                    Service Category
                  </label>
                  <div className="relative">
                    <Briefcase className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <select
                      id="signup-category"
                      value={signupForm.serviceCategory}
                      onChange={(e) =>
                        setSignupForm({ ...signupForm, serviceCategory: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/20"
                    >
                      {SERVICE_CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="signup-password" className="mb-1.5 block text-sm font-medium text-slate-700">
                    Password
                  </label>
                  <input
                    id="signup-password"
                    type="password"
                    required
                    value={signupForm.password}
                    onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                    placeholder="Min. 6 characters"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/20"
                  />
                </div>

                <div>
                  <label
                    htmlFor="signup-confirm-password"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Confirm Password
                  </label>
                  <input
                    id="signup-confirm-password"
                    type="password"
                    required
                    value={signupForm.confirmPassword}
                    onChange={(e) =>
                      setSignupForm({ ...signupForm, confirmPassword: e.target.value })
                    }
                    placeholder="Re-enter password"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/20"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? 'Creating account...'
                  : `Create ${signupForm.role === 'TECHNICIAN' ? 'Technician' : 'Customer'} Account`}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
