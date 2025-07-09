import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';


const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Real-time validation
    let error = '';
    if (name === 'fullName') {
      if (/[^A-Za-z ]/.test(value)) {
        error = 'Full name cannot contain numbers or special characters';
      } else if (value.replace(/\s+/g, '').length < 3 || value.trim().split(' ').length < 2) {
        error = 'Full name must be at least 3 letters and include at least two words';
      }
    }
    if (name === 'email') {
      if (!/^\S+@\S+\.\S+$/.test(value)) {
        error = 'Please enter a valid email address';
      }
    }
    if (name === 'password') {
      if (value.length < 6) {
        error = 'Password must be at least 6 characters long';
      }
    }
    if (name === 'confirmPassword') {
      if (value !== (name === 'password' ? value : formData.password)) {
        error = 'Passwords do not match';
      }
    }
    setFormErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    let error = '';
    if (name === 'fullName') {
      if (/[^A-Za-z ]/.test(value)) {
        error = 'Full name cannot contain numbers or special characters';
      } else if (value.replace(/\s+/g, '').length < 3 || value.trim().split(' ').length < 2) {
        error = 'Full name must be at least 3 letters and include at least two words';
      }
    }
    if (name === 'email') {
      if (!/^\S+@\S+\.\S+$/.test(value)) {
        error = 'Please enter a valid email address';
      }
    }
    if (name === 'password') {
      if (value.length < 6) {
        error = 'Password must be at least 6 characters long';
      }
    }
    if (name === 'confirmPassword') {
      if (value !== formData.password) {
        error = 'Passwords do not match';
      }
    }
    setFormErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Full name validation
    if (/[^A-Za-z ]/.test(formData.fullName)) {
      setError('Full name cannot contain numbers or special characters');
      return;
    }
    if (formData.fullName.replace(/\s+/g, '').length < 3 || formData.fullName.trim().split(' ').length < 2) {
      setError('Full name must be at least 3 letters and include at least two words');
      return;
    }

    // Email validation
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    // Password match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Password length
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    const result = await register(formData.fullName, formData.email, formData.password);
    if (result.success) {
      navigate('/login', { state: { verifyMsg: 'Registration successful! Please check your email and verify your account before logging in.' } });
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
            <h2 className="text-4xl font-extrabold text-blue-800 mb-2">Create Your Account</h2>
            <p className="text-gray-600 text-lg">Join our secure platform and boost your cyber awareness!</p>
          </div>
          <form className="space-y-6" onSubmit={handleSubmit} autoComplete="off">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-2 text-center">
                {error}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-blue-700">Full Name</label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 text-lg rounded focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition placeholder-gray-400 bg-white"
                  placeholder="Enter your full name"
                />
                {formErrors.fullName && <div className="text-red-600 text-xs mt-1">{formErrors.fullName}</div>}
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-blue-700">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 text-lg rounded focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition placeholder-gray-400 bg-white"
                  placeholder="Enter your email"
                />
                {formErrors.email && <div className="text-red-600 text-xs mt-1">{formErrors.email}</div>}
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
                  onBlur={handleBlur}
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 text-lg rounded focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition placeholder-gray-400 bg-white"
                  placeholder="Enter your password"
                />
                {formErrors.password && <div className="text-red-600 text-xs mt-1">{formErrors.password}</div>}
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-blue-700">Confirm Password</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 text-lg rounded focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition placeholder-gray-400 bg-white"
                  placeholder="Confirm your password"
                />
                {formErrors.confirmPassword && <div className="text-red-600 text-xs mt-1">{formErrors.confirmPassword}</div>}
              </div>
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
                  Creating account...
                </span>
              ) : (
                'Create account'
              )}
            </button>
            <p className="mt-6 text-center text-base text-gray-600">
              Already have an account?{' '}
              <a href="/login" className="font-medium text-blue-600 hover:text-blue-500 transition">Sign in</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register; 