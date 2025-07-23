import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { userLogin, fetchUserInfo } from '../../features/auth/authActions';
import { loginClient } from '../../features/auth/client/auth'
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
  username: yup.string().required('Username is required'),
  password: yup.string().required('Password is required')
});

function LoginForm({ activeTab }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Color configurations based on activeTab
  const colorConfig = {
    admin: {
      primary: '#007595',
      icon: '#007595',
      hoverBorder: '#00c6fb',
      hoverIcon: '#00c6fb'
    },
    client: {
      primary: '#c76824',
      icon: '#c76824',
      hoverBorder: '#ff8c00',
      hoverIcon: '#ff8c00'
    }
  };

  const currentColors = colorConfig[activeTab] || colorConfig.client;

  const formik = useFormik({
    initialValues: {
      username: '',
      password: ''
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        if (activeTab === 'admin') {
          // Admin login flow
          const result = await dispatch(userLogin(values));

          if (userLogin.fulfilled.match(result)) {
            const token = result.payload?.id_token;
            if (token) {
              localStorage.setItem('access_token', `Bearer ${token}`);
              await dispatch(fetchUserInfo());
              message.success('Admin login successful');
              navigate('/dashboard');
            } else {
              message.error('Login successful but no token received');
            }
          } else {
            const errorPayload = result.payload;
            const errorMessage = typeof errorPayload === 'object'
              ? errorPayload.message || MESSAGE_MAPPINGS[errorPayload.type] || MESSAGE_MAPPINGS.unknown_error
              : errorPayload || MESSAGE_MAPPINGS.unknown_error;
            message.error(errorMessage);
          }
        } else {
          setSubmitting(true);

          // Dispatch the loginClient action
          const resultAction = await dispatch(
            loginClient({
              email: values.username,
              password: values.password
            })
          );

          // Check if the login was successful
          if (loginClient.fulfilled.match(resultAction)) {
            message.success('Client login successful!');
            navigate('/client');
          } else if (loginClient.rejected.match(resultAction)) {
            // The error message is already handled in the auth slice, but you can add additional handling here
            throw new Error(resultAction.payload || 'Client login failed');
          }
        }
      } catch (error) {
        console.error('Login error:', error);
        message.error(error.message || MESSAGE_MAPPINGS.unknown_error);
      } finally {
        setSubmitting(false);
      }
    }
  });

  return (
    <div className="max-w-md mx-auto">
      <form onSubmit={formik.handleSubmit} className="mb-4 space-y-5">
        {/* Username Field */}
        <div>
          <div className={`shadow-sm flex gap-2 items-center bg-white p-3 rounded-lg group duration-300 border ${
            formik.touched.username && formik.errors.username 
              ? 'border-red-300' 
              : `border-gray-200 hover:border-[${currentColors.hoverBorder}]`
            }`}>
            <i className={`group-hover:text-[${currentColors.hoverIcon}] duration-300 ${
              activeTab === 'admin' 
                ? 'ri-admin-line' 
                : 'ri-user-2-line'
              }`} 
              style={{ color: currentColors.icon }}
            ></i>
            <input
              type="text"
              name="username"
              placeholder={activeTab === 'admin' ? 'Admin username' : 'Email address'}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.username}
              className="flex-1 focus:outline-none text-[#222] placeholder-gray-400"
              autoComplete="username"
            />
          </div>
          {formik.touched.username && formik.errors.username && (
            <p className="text-red-500 text-sm ml-1 mt-1">{formik.errors.username}</p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <div className={`shadow-sm flex gap-2 items-center bg-white p-3 rounded-lg group duration-300 border ${
            formik.touched.password && formik.errors.password 
              ? 'border-red-300' 
              : `border-gray-200 hover:border-[${currentColors.hoverBorder}]`
            }`}>
            <i className={`group-hover:text-[${currentColors.hoverIcon}] duration-300 ${
              activeTab === 'admin' 
                ? 'ri-shield-keyhole-line' 
                : 'ri-lock-2-line'
              }`}
              style={{ color: currentColors.icon }}
            ></i>
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
            backgroundColor: currentColors.primary,
            border: `1px solid ${currentColors.primary}`
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
      </form>
    </div>
  );
}

export default LoginForm;