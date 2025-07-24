import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { message } from 'antd';

const MESSAGE_MAPPINGS = {
  missing_token: 'Invalid confirmation link',
  invalid_or_expired_token: 'Invalid or expired confirmation link',
  token_expired: 'Confirmation link has expired',
  user_exists: 'User already exists',
  timeout: 'Request timeout',
  auth_failed: 'Authentication failed',
  invalid_data: 'Invalid registration data',
  unknown_error: 'An unexpected error occurred',
  registration_confirmed: 'Registration confirmed successfully! You can now log in.',
  default_success: 'Action completed successfully'
};

// Yup validation schema
const validationSchema = yup.object({
  email: yup.string().email('Invalid email format').required('Email is required'),
  password: yup.string().required('Password is required')
});

function LoginForm({ activeTab }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      email: '',
      password: ''
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        if (activeTab === 'admin') {
          // Admin login flow (keep your existing implementation)
          // ... your existing admin login code ...
        } else {
          // Client login flow
          setSubmitting(true);
          
          const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: values.email,
              password: values.password
            })
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Login failed');
          }

          if (!data.contact) {
            throw new Error('Invalid response from server');
          }

          // Successful login handling
          message.success(data.message || 'Login successful!');
          
          // Store user data in localStorage
          localStorage.setItem('currentUser', JSON.stringify({
  id: data.contact._id,
  email: data.contact.email,
  firstName: data.contact.firstName,
  lastName: data.contact.lastName,
  phone: data.contact.phone,
  sys_id: data.contact.sys_id,
  accountId: data.contact.account,
  isPrimaryContact: data.contact.isPrimaryContact,
  active: data.contact.active,
  archived: data.contact.archived,
  location: data.contact.location,
  createdAt: data.contact.createdAt,
  updatedAt: data.contact.updatedAt
}));

          // Store auth token if available
          if (data.token) {
            localStorage.setItem('access_token', data.token);
          }

          // Redirect to client dashboard
          navigate('/client');
        }
      } catch (error) {
        console.error('Login error:', error);
        message.error(error.message || MESSAGE_MAPPINGS.auth_failed);
      } finally {
        setSubmitting(false);
      }
    }
  });

  return (
    <div className="max-w-md mx-auto">
      <form onSubmit={formik.handleSubmit} className="mb-4 space-y-5">
        {/* Email Field */}
        <div>
          <div className={`shadow-sm flex gap-2 items-center bg-white p-3 rounded-lg group duration-300 border ${
            formik.touched.email && formik.errors.email ? 'border-red-300' : 'border-gray-200 hover:border-[#00c6fb]'
          }`}>
            <i className={`group-hover:text-[#00c6fb] duration-300 ${
              activeTab === 'admin' ? 'ri-admin-line text-[#005baa]' : 'ri-mail-line text-[#005baa]'
            }`}></i>
            <input
              type="email"
              name="email"
              placeholder="Email address"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
              className="flex-1 focus:outline-none text-[#222] placeholder-gray-400"
              autoComplete="email"
            />
          </div>
          {formik.touched.email && formik.errors.email && (
            <p className="text-red-500 text-sm ml-1 mt-1">{formik.errors.email}</p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <div className={`shadow-sm flex gap-2 items-center bg-white p-3 rounded-lg group duration-300 border ${
            formik.touched.password && formik.errors.password ? 'border-red-300' : 'border-gray-200 hover:border-[#00c6fb]'
          }`}>
            <i className={`group-hover:text-[#00c6fb] duration-300 ${
              activeTab === 'admin' ? 'ri-shield-keyhole-line text-[#005baa]' : 'ri-lock-2-line text-[#005baa]'
            }`}></i>
            <input
              type="password"
              name="password"
              placeholder="Password"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.password}
              className="flex-1 focus:outline-none text-[#222] placeholder-gray-400"
              autoComplete="current-password"
            />
          </div>
          {formik.touched.password && formik.errors.password && (
            <p className="text-red-500 text-sm ml-1 mt-1">{formik.errors.password}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={formik.isSubmitting}
          className={`w-full text-white font-medium py-3 px-4 rounded-lg transition duration-300 ${
            formik.isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90'
          }`}
          style={{ 
            backgroundColor: activeTab === 'admin' ? '#003e7d' : '#005baa',
            border: activeTab === 'admin' ? '1px solid #002b57' : '1px solid #004b8f'
          }}
        >
          {formik.isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing in...
            </span>
          ) : (
            'Sign in'
          )}
        </button>

        {/* Forgot Password Link */}
        <div className="text-center">
          <Link 
            to="/forgot-password" 
            className="text-[#005baa] hover:text-[#003e7d] text-sm font-medium"
          >
            Forgot password?
          </Link>
        </div>
      </form>
    </div>
  );
}

export default LoginForm;