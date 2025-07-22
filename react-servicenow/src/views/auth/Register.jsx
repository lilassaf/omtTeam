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
      <div className="min-h-screen flex items-center justify-center bg-[#f6f8fa] p-4 font-['Segoe_UI','Roboto',Arial,sans-serif]">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
            <div className="h-2 bg-gradient-to-r from-[#005baa] to-[#00c6fb]"></div>
            <div className="p-8 text-center">
              <img src={Logo} className="w-16 h-16 mx-auto mb-3" alt="Logo" />
              <h1 className="text-2xl font-bold text-[#222] mb-2">Registration Successful!</h1>
              <p className="text-[#444] mb-6">
                Your account has been created successfully. You will be redirected to the login page.
              </p>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-2 bg-[#005baa] text-white rounded-lg hover:bg-[#004b8f] transition-colors"
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
    <div className="min-h-screen flex items-center justify-center bg-[#f6f8fa] p-4 font-['Segoe_UI','Roboto',Arial,sans-serif]">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          {/* Gradient header */}
          <div className="h-2 bg-gradient-to-r from-[#005baa] to-[#00c6fb]"></div>
          
          {/* Content */}
          <div className="p-8">
            {/* Logo and title */}
            <div className="text-center mb-6">
              <img 
                src={Logo} 
                className="w-16 h-16 mx-auto mb-3" 
                alt="Logo" 
              />
              <h1 className="text-2xl font-bold text-[#222]">Create Account</h1>
              <p className="text-[#444] text-sm">Join us to get started</p>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                {error}
              </div>
            )}

            {/* Registration form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-[#00c6fb]">
                    <i className="ri-user-line text-[#005baa] mr-2"></i>
                    <input
                      type="text"
                      name="u_first_name"
                      placeholder="First Name"
                      value={formData.u_first_name}
                      onChange={handleChange}
                      required
                      className="flex-1 focus:outline-none text-[#222] placeholder-gray-400"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-[#00c6fb]">
                    <i className="ri-user-line text-[#005baa] mr-2"></i>
                    <input
                      type="text"
                      name="u_last_name"
                      placeholder="Last Name"
                      value={formData.u_last_name}
                      onChange={handleChange}
                      required
                      className="flex-1 focus:outline-none text-[#222] placeholder-gray-400"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-[#00c6fb]">
                <i className="ri-user-3-line text-[#005baa] mr-2"></i>
                <input
                  type="text"
                  name="u_username"
                  placeholder="Username"
                  value={formData.u_username}
                  onChange={handleChange}
                  required
                  className="flex-1 focus:outline-none text-[#222] placeholder-gray-400"
                />
              </div>

              <div className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-[#00c6fb]">
                <i className="ri-mail-line text-[#005baa] mr-2"></i>
                <input
                  type="email"
                  name="u_email_address"
                  placeholder="Email Address"
                  value={formData.u_email_address}
                  onChange={handleChange}
                  required
                  className="flex-1 focus:outline-none text-[#222] placeholder-gray-400"
                />
              </div>

              <div className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-[#00c6fb]">
                <i className="ri-phone-line text-[#005baa] mr-2"></i>
                <input
                  type="tel"
                  name="u_phone_number"
                  placeholder="Phone Number"
                  value={formData.u_phone_number}
                  onChange={handleChange}
                  required
                  className="flex-1 focus:outline-none text-[#222] placeholder-gray-400"
                />
              </div>

              <div className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-[#00c6fb]">
                <i className="ri-lock-2-line text-[#005baa] mr-2"></i>
                <input
                  type="password"
                  name="u_password"
                  placeholder="Password"
                  value={formData.u_password}
                  onChange={handleChange}
                  required
                  className="flex-1 focus:outline-none text-[#222] placeholder-gray-400"
                />
              </div>

              <div className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-[#00c6fb]">
                <i className="ri-lock-password-line text-[#005baa] mr-2"></i>
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="flex-1 focus:outline-none text-[#222] placeholder-gray-400"
                />
              </div>

              {/* Hidden fields for default values */}
              <input type="hidden" name="u_preferred_payment_method" value="credit card" />
              <input type="hidden" name="u_user_role" value="client" />
              <input type="hidden" name="u_account_status" value="active" />

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 text-white font-medium rounded-lg transition hover:opacity-90"
                style={{ 
                  backgroundColor: '#005baa',
                  border: '1px solid #004b8f'
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <i className="ri-user-add-line mr-2"></i>
                    Create Account
                  </span>
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-[#444]">
              Already have an account?{' '}
              <Link to="/" className="text-[#005baa] hover:text-[#00c6fb] font-medium">
                Sign in
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center text-xs text-[#444]">
          © {new Date().getFullYear()} OMT. All rights reserved.
        </div>
      </div>
    </div>
  );
}

export default Register;