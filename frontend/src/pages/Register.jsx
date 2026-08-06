import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiPhone, FiLock, FiUserPlus, FiEye, FiEyeOff, FiHash } from 'react-icons/fi';

export const Register = () => {
  const [form, setForm] = useState({ fullName: '', email: '', mobile: '', password: '', referralCode: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      const details = err.response?.data?.data;
      if (Array.isArray(details) && details.length > 0) {
        toast.error(details.join('. '));
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: 'fullName', label: 'Full Name', type: 'text', icon: FiUser, placeholder: 'John Doe' },
    { name: 'email', label: 'Email Address', type: 'email', icon: FiMail, placeholder: 'you@example.com' },
    { name: 'mobile', label: 'Mobile Number', type: 'tel', icon: FiPhone, placeholder: '+1 234 567 890' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 py-12 px-4 transition-colors">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-violet-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-md w-full relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl shadow-lg shadow-primary-500/25 mb-4">
            <span className="text-2xl font-bold text-white">IP</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-zinc-100 tracking-tight">Create account</h1>
          <p className="text-gray-500 dark:text-zinc-400 mt-2">Start your investment journey today</p>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 dark:border dark:border-zinc-800 dark:shadow-2xl dark:shadow-black/40 rounded-2xl p-8 space-y-4 transition-colors">
          {fields.map((field) => (
            <div key={field.name}>
              <label className="block text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1.5">{field.label}</label>
              <div className="relative">
                <field.icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-zinc-500" />
                <input
                  type={field.type}
                  name={field.name}
                  value={form[field.name]}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-zinc-700 rounded-xl bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder={field.placeholder}
                  required
                />
              </div>
            </div>
          ))}

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1.5">Password</label>
            <div className="relative">
              <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-zinc-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full pl-10 pr-11 py-2.5 border border-gray-200 dark:border-zinc-700 rounded-xl bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="Min 6 characters"
                required
                minLength={6}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 transition-colors">
                {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1.5">Referral Code <span className="text-gray-400 dark:text-zinc-500">(optional)</span></label>
            <div className="relative">
              <FiHash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-zinc-500" />
              <input
                type="text"
                name="referralCode"
                value={form.referralCode}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-zinc-700 rounded-xl bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="Enter referral code"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-medium hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 transition-all shadow-lg shadow-primary-500/25 mt-2"
          >
            <FiUserPlus className="w-4 h-4" />
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          <p className="text-center text-sm text-gray-500 dark:text-zinc-400 pt-2">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};
