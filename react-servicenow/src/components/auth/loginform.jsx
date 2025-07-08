import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { userLogin } from '../../features/auth/authActions';
import { message } from 'antd';

const MESSAGE_MAPPINGS = {
  missing_fields: 'Both username and password are required',
  invalid_credentials: 'Incorrect username or password',
  authentication_failed: 'Unable to authenticate',
  csrf_failed: 'Security verification failed',
  invalid_session: 'Your session has expired',
  timeout: 'Request timeout',
  network_error: 'Network error. Please check your connection.',
  unknown_error: 'An unexpected error occurred',
  login_success: 'Login successful'
};

const validationSchema = yup.object({
  username: yup.string().required('Username is required'),
  password: yup.string().required('Password is required')
});

function LoginForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      username: '',
      password: ''
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const result = await dispatch(userLogin(values));

        if (userLogin.fulfilled.match(result)) {          
          message.success(MESSAGE_MAPPINGS.login_success);
          navigate('/dashboard');
        } else {
          const errorPayload = result.payload;
          const errorMessage = typeof errorPayload === 'object'
            ? errorPayload.message || MESSAGE_MAPPINGS[errorPayload.type] || MESSAGE_MAPPINGS.unknown_error
            : errorPayload || MESSAGE_MAPPINGS.unknown_error;

          message.error(errorMessage);
        }
      } catch (error) {
        console.error('Login error:', error);
        message.error(MESSAGE_MAPPINGS.unknown_error);
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
          <div className="shadow-lg flex gap-2 items-center bg-white p-2 rounded group duration-300">
            <i className="ri-user-2-line group-hover:rotate-[360deg] duration-300"></i>
            <input
              type="text"
              name="username"
              placeholder="Username"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.username}
              className="flex-1 focus:outline-none"
              autoComplete="username"
            />
          </div>
          {formik.touched.username && formik.errors.username && (
            <p className="text-red-500 text-sm ml-1">{formik.errors.username}</p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <div className="shadow-lg flex gap-2 items-center bg-white p-2 rounded group duration-300">
            <i className="ri-lock-2-line group-hover:rotate-[360deg] duration-300"></i>
            <input
              type="password"
              name="password"
              placeholder="Password"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.password}
              className="flex-1 focus:outline-none"
              autoComplete="current-password"
            />
          </div>
          {formik.touched.password && formik.errors.password && (
            <p className="text-red-500 text-sm ml-1">{formik.errors.password}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={formik.isSubmitting}
          className={`w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition duration-300 ${
            formik.isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {formik.isSubmitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}

export default LoginForm;