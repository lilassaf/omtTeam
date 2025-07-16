import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  RiEditLine, 
  RiSaveLine, 
  RiLockPasswordLine, 
  RiLogoutCircleLine,
  RiUserLine,
  RiMailLine,
  RiPhoneLine,
  RiHomeLine,
  RiCalendarLine,
  RiShieldUserLine,
  RiVisaLine,
  RiPaypalFill
} from 'react-icons/ri';
import { 
  IoCheckmarkCircleOutline, 
  IoCloseCircleOutline,
  IoLockClosedOutline,
  IoEyeOutline,
  IoEyeOffOutline
} from 'react-icons/io5';

const MyProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser?.sys_id) {
          navigate('/login');
          return;
        }

        const response = await axios.get(`http://localhost:3000/api/clients/${currentUser.sys_id}`);
        setUser(response.data);
        setFormData(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handlePaymentMethodChange = (method) => {
    setFormData({
      ...formData,
      u_preferred_payment_method: method
    });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`http://localhost:3000/api/clients/${user.sys_id}`, formData);
      setUser(response.data);
      localStorage.setItem('currentUser', JSON.stringify(response.data));
      setIsEditing(false);
      setUpdateSuccess(true);
      setUpdateError(null);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
      setUpdateError('Failed to update profile. Please try again.');
      setTimeout(() => setUpdateError(null), 3000);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!passwordData.currentPassword) {
      setPasswordError('Please enter your current password');
      setTimeout(() => setPasswordError(null), 3000);
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      setTimeout(() => setPasswordError(null), 3000);
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      setTimeout(() => setPasswordError(null), 3000);
      return;
    }

    try {
      const verifyResponse = await axios.post('http://localhost:3000/api/clients/login', {
        email: user.u_email_address,
        password: passwordData.currentPassword
      });

      if (!verifyResponse.data.user) {
        setPasswordError('Current password is incorrect');
        setTimeout(() => setPasswordError(null), 3000);
        return;
      }

      await axios.put(`http://localhost:3000/api/clients/${user.sys_id}`, {
        u_password: passwordData.newPassword
      });
      
      setPasswordSuccess(true);
      setPasswordError(null);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setTimeout(() => {
        setPasswordSuccess(false);
        setShowPasswordForm(false);
      }, 3000);
    } catch (err) {
      console.error('Password change error:', err);
      setPasswordError(err.response?.data?.error || 'Failed to change password. Please try again.');
      setTimeout(() => setPasswordError(null), 3000);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/');
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
    </div>
  );

  if (error) return (
    <div className="text-center py-8 text-red-500">
      Error: {error}
    </div>
  );

  if (!user) return (
    <div className="text-center py-8">
      User not found
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-amber-700 ">My Profile</h1>
              <p className="text-gray-600">Manage your personal information and security settings</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-700 hover:text-red-600 transition-colors"
            >
              <RiLogoutCircleLine className="text-lg" />
              <span>Logout</span>
            </button>
          </div>

          {/* Alerts */}
          {updateSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg flex items-center">
              <IoCheckmarkCircleOutline className="mr-2 text-xl text-green-500" />
              Profile updated successfully!
            </div>
          )}

          {updateError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg flex items-center">
              <IoCloseCircleOutline className="mr-2 text-xl text-red-500" />
              {updateError}
            </div>
          )}

          {/* Password Change Form */}
          {showPasswordForm && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
              <div className="p-5 border-b border-gray-100 bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <IoLockClosedOutline className="text-gray-600" />
                  Change Password
                </h2>
              </div>
              <div className="p-5">
                {passwordError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg flex items-center gap-2">
                    <IoCloseCircleOutline className="text-red-500" />
                    {passwordError}
                  </div>
                )}
                {passwordSuccess && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 rounded-lg flex items-center gap-2">
                    <IoCheckmarkCircleOutline className="text-green-500" />
                    Password changed successfully!
                  </div>
                )}
                <form onSubmit={handlePasswordSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 pr-10"
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 pr-10"
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 pr-10"
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button
                        type="submit"
                        className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-2 px-4 rounded-md transition-colors flex items-center justify-center gap-2"
                      >
                        <RiSaveLine />
                        Update Password
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowPasswordForm(false)}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Profile Information */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Personal Info */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <RiUserLine className="text-gray-600" />
                  Personal Information
                </h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white py-2 px-4 rounded-md transition-colors text-sm"
                  >
                    <RiEditLine />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setFormData(user);
                        setUpdateError(null);
                      }}
                      className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md transition-colors text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      className="flex items-center gap-2 bg-amber-700 hover:bg-amber-800 text-white py-2 px-4 rounded-md transition-colors text-sm"
                    >
                      <RiSaveLine />
                      Save Changes
                    </button>
                  </div>
                )}
              </div>
              <div className="p-5">
                <form>
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="u_first_name"
                            value={formData.u_first_name || ''}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                          />
                        ) : (
                          <p className="text-gray-900 py-2">{user.u_first_name || 'Not provided'}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="u_last_name"
                            value={formData.u_last_name || ''}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                          />
                        ) : (
                          <p className="text-gray-900 py-2">{user.u_last_name || 'Not provided'}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                      {isEditing ? (
                        <input
                          type="email"
                          name="u_email_address"
                          value={formData.u_email_address || ''}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        />
                      ) : (
                        <p className="text-gray-900 py-2">{user.u_email_address || 'Not provided'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      {isEditing ? (
                        <input
                          type="tel"
                          name="u_phone_number"
                          value={formData.u_phone_number || ''}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        />
                      ) : (
                        <p className="text-gray-900 py-2">{user.u_phone_number || 'Not provided'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      {isEditing ? (
                        <textarea
                          name="u_address"
                          value={formData.u_address || ''}
                          onChange={handleInputChange}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        />
                      ) : (
                        <p className="text-gray-900 py-2 whitespace-pre-line">{user.u_address || 'Not provided'}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="u_city"
                            value={formData.u_city || ''}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                          />
                        ) : (
                          <p className="text-gray-900 py-2">{user.u_city || 'Not provided'}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Province/State</label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="u_province"
                            value={formData.u_province || ''}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                          />
                        ) : (
                          <p className="text-gray-900 py-2">{user.u_province || 'Not provided'}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Postal/Zip Code</label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="u_postal_code"
                            value={formData.u_postal_code || ''}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                          />
                        ) : (
                          <p className="text-gray-900 py-2">{user.u_postal_code || 'Not provided'}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                      {isEditing ? (
                        <input
                          type="date"
                          name="u_date_of_birth"
                          value={formData.u_date_of_birth ? formData.u_date_of_birth.split('T')[0] : ''}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        />
                      ) : (
                        <p className="text-gray-900 py-2">
                          {user.u_date_of_birth ? new Date(user.u_date_of_birth).toLocaleDateString() : 'Not provided'}
                        </p>
                      )}
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* Right Column - Account Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-5 border-b border-gray-100 bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <RiShieldUserLine className="text-gray-600" />
                  Account Settings
                </h2>
              </div>
              <div className="p-5 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <p className="text-gray-900 py-2">{user.u_username || 'Not provided'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Status</label>
                  <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {user.u_account_status || 'Unknown'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
                  <p className="text-gray-900 py-2">
                    {new Date(user.u_account_creation_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Login</label>
                  <p className="text-gray-900 py-2">
                    {new Date(user.u_last_login_date).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Payment Method</label>
                  {isEditing ? (
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => handlePaymentMethodChange('credit card')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 border rounded-md transition-colors ${formData.u_preferred_payment_method === 'credit card' ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray-300 hover:border-amber-300'}`}
                      >
                        <RiVisaLine className="text-xl" />
                        <span>Credit Card</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePaymentMethodChange('paypal')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 border rounded-md transition-colors ${formData.u_preferred_payment_method === 'paypal' ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray-300 hover:border-amber-300'}`}
                      >
                        <RiPaypalFill className="text-xl text-blue-600" />
                        <span>PayPal</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 py-2">
                      {user.u_preferred_payment_method === 'credit card' ? (
                        <>
                          <RiVisaLine className="text-xl text-gray-700" />
                          <span className="text-gray-900">Credit Card</span>
                        </>
                      ) : (
                        <>
                          <RiPaypalFill className="text-xl text-blue-600" />
                          <span className="text-gray-900">PayPal</span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setShowPasswordForm(true)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-300 rounded-md hover:border-amber-400 hover:bg-amber-50 text-amber-700 transition-colors"
                  >
                    <RiLockPasswordLine />
                    Change Password
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;