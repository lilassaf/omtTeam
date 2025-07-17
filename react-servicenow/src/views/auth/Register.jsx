import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Logo from '@assets/logo.png';

function Register() {
  const [formData, setFormData] = useState({
    u_first_name: '',
    u_last_name: '',
    u_username: '',
    u_email_address: '',
    u_phone_number: '',
    u_password: '',
    u_preferred_payment_method: 'credit card',
    u_user_role: 'client',
    u_account_status: 'active'
  });
  
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.u_password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      
      // Create the user directly
      await axios.post('http://localhost:3000/api/clients', formData);
      
      setSuccess(true);
      // Redirect to login after a short delay
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100 p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-amber-400 to-amber-600"></div>
            <div className="p-8 text-center">
              <img src={Logo} className="w-16 h-16 mx-auto mb-3" alt="Logo" />
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Registration Successful!</h1>
              <p className="text-gray-600 mb-6">
                Your account has been created successfully. You will be redirected to the login page.
              </p>
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Gradient header */}
          <div className="h-2 bg-gradient-to-r from-amber-400 to-amber-600"></div>
          
          {/* Content */}
          <div className="p-8">
            {/* Logo and title */}
            <div className="text-center mb-6">
              <img 
                src={Logo} 
                className="w-16 h-16 mx-auto mb-3" 
                alt="Logo" 
              />
              <h1 className="text-2xl font-bold text-gray-800">Create Account</h1>
              <p className="text-gray-500 text-sm">Join us to get started</p>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                {error}
              </div>
            )}

            {/* Registration form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    type="text"
                    name="u_first_name"
                    placeholder="First Name"
                    value={formData.u_first_name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    name="u_last_name"
                    placeholder="Last Name"
                    value={formData.u_last_name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
              </div>

              <input
                type="text"
                name="u_username"
                placeholder="Username"
                value={formData.u_username}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />

              <input
                type="email"
                name="u_email_address"
                placeholder="Email Address"
                value={formData.u_email_address}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />

              <input
                type="tel"
                name="u_phone_number"
                placeholder="Phone Number"
                value={formData.u_phone_number}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />

              <input
                type="password"
                name="u_password"
                placeholder="Password"
                value={formData.u_password}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />

              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />

              {/* Hidden fields for default values */}
              <input type="hidden" name="u_preferred_payment_method" value="credit card" />
              <input type="hidden" name="u_user_role" value="client" />
              <input type="hidden" name="u_account_status" value="active" />

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors disabled:opacity-70"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </span>
                ) : 'Create Account'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">
              Already have an account?{' '}
              <Link to="/" className="text-amber-600 hover:text-amber-500 font-medium">
                Sign in
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} LuxeCart. All rights reserved.
        </div>
      </div>
    </div>
  );
}

export default Register;