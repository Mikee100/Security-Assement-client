import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [twofaRequired, setTwofaRequired] = useState(false);
  const [twofaCode, setTwofaCode] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData.email, formData.password, twofaRequired ? twofaCode : undefined);
    
    if (result.success) {
      // Redirect based on role
      if (result.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } else if (result.twofa_required) {
      setTwofaRequired(true);
      setError('Two-Factor Authentication code required. Please enter the code from your authenticator app.');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row">
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.6)' }}>
          <svg className="animate-spin h-12 w-12 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
        </div>
      )}
      {/* Left: Big Image */}
      <div className="md:w-1/2 w-full h-64 md:h-auto flex-shrink-0">
        <img src="/pexels-pixabay-60504.jpg" alt="Cyber Security" className="w-full h-full object-cover" />
      </div>
      {/* Right: Form */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 py-12 px-4 sm:px-8">
        <div className="w-full max-w-md mx-auto">
          <div className="mb-8 text-center">
            <h2 className="text-4xl font-extrabold text-blue-800 mb-2">Sign in to your account</h2>
            <p className="text-gray-600 text-lg">Welcome back! Securely access your dashboard.</p>
            <p className="mt-2 text-center text-base text-gray-500">
              Or{' '}
              <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500 transition">
                create a new account
              </Link>
            </p>
            <p className="mt-1 text-center text-xs text-gray-400">
              Admin and user accounts use the same login form
            </p>
            {location.state?.verifyMsg && (
              <div className="mt-4 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
                {location.state.verifyMsg}
              </div>
            )}
          </div>
          <form className="space-y-6" onSubmit={handleSubmit} autoComplete="off">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-2 text-center">
                {error}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-blue-700">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 text-lg rounded focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition placeholder-gray-400 bg-white"
                  placeholder="Enter your email"
                  disabled={twofaRequired}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-blue-700">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 text-lg rounded focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition placeholder-gray-400 bg-white"
                  placeholder="Enter your password"
                  disabled={twofaRequired}
                />
              </div>
              {twofaRequired && (
                <div>
                  <label htmlFor="twofaCode" className="block text-sm font-medium text-blue-700">2FA Code</label>
                  <input
                    id="twofaCode"
                    name="twofaCode"
                    type="text"
                    required
                    value={twofaCode}
                    onChange={e => setTwofaCode(e.target.value)}
                    className="mt-1 block w-full px-4 py-3 border border-blue-300 text-lg rounded focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition placeholder-gray-400 bg-white"
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                  />
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-semibold rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 disabled:opacity-50 shadow-md transition"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                twofaRequired ? 'Verify 2FA & Sign in' : 'Sign in'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login; 