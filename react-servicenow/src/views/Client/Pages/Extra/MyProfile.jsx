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
  RiShieldUserLine
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
    
    // Validation checks
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
      // First verify the current password by attempting to login
      const verifyResponse = await axios.post('http://localhost:3000/api/clients/login', {
        email: user.u_email_address,
        password: passwordData.currentPassword
      });

      if (!verifyResponse.data.user) {
        setPasswordError('Current password is incorrect');
        setTimeout(() => setPasswordError(null), 3000);
        return;
      }

      // If login was successful, proceed with password change
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
    navigate('/login');
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
    <div className="bg-amber-50 min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-amber-900">Account Management</h1>
              <p className="text-amber-700">Manage your profile and security settings</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className={`flex items-center py-2 px-4 rounded-lg transition-colors ${showPasswordForm ? 'bg-amber-600 text-white' : 'bg-amber-100 hover:bg-amber-200 text-amber-800'}`}
              >
                <RiLockPasswordLine className="mr-2" />
                {showPasswordForm ? 'Cancel Password Change' : 'Change Password'}
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center bg-red-100 hover:bg-red-200 text-red-800 py-2 px-4 rounded-lg transition-colors"
              >
                <RiLogoutCircleLine className="mr-2" />
                Logout
              </button>
            </div>
          </div>

          {/* Alerts */}
          {updateSuccess && (
            <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-lg flex items-center">
              <IoCheckmarkCircleOutline className="mr-2 text-xl" />
              Profile updated successfully!
            </div>
          )}

          {updateError && (
            <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-lg flex items-center">
              <IoCloseCircleOutline className="mr-2 text-xl" />
              {updateError}
            </div>
          )}

          {/* Password Change Form */}
          {showPasswordForm && (
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
              <div className="p-6 border-b border-amber-100 bg-amber-50">
                <h2 className="text-xl font-semibold text-amber-800 flex items-center">
                  <IoLockClosedOutline className="mr-2" />
                  Change Password
                </h2>
              </div>
              <div className="p-6">
                {passwordError && (
                  <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg flex items-center">
                    <IoCloseCircleOutline className="mr-2" />
                    {passwordError}
                  </div>
                )}
                {passwordSuccess && (
                  <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-lg flex items-center">
                    <IoCheckmarkCircleOutline className="mr-2" />
                    Password changed successfully!
                  </div>
                )}
                <form onSubmit={handlePasswordSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-amber-600 mb-1">Current Password</label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          required
                          className="w-full px-4 py-2 border border-amber-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 pr-10"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-amber-600"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-amber-600 mb-1">New Password</label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          required
                          className="w-full px-4 py-2 border border-amber-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 pr-10"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-amber-600"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-amber-600 mb-1">Confirm New Password</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          required
                          className="w-full px-4 py-2 border border-amber-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 pr-10"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-amber-600"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
                        </button>
                      </div>
                    </div>
                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full bg-amber-600 hover:bg-amber-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
                      >
                        <RiSaveLine className="mr-2" />
                        Update Password
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}
          {/* Profile Information */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Personal Info */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6 border-b border-amber-100 bg-amber-50">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-amber-800 flex items-center">
                    <RiUserLine className="mr-2" />
                    Personal Information
                  </h2>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center bg-amber-600 hover:bg-amber-700 text-white py-2 px-4 rounded-lg transition-colors"
                    >
                      <RiEditLine className="mr-2" />
                      Edit Profile
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setFormData(user);
                          setUpdateError(null);
                        }}
                        className="flex items-center bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSubmit}
                        className="flex items-center bg-amber-600 hover:bg-amber-700 text-white py-2 px-4 rounded-lg transition-colors"
                      >
                        <RiSaveLine className="mr-2" />
                        Save Changes
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-6">
                <form>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-amber-600 mb-1 flex items-center">
                          <RiUserLine className="mr-2" />
                          First Name
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="u_first_name"
                            value={formData.u_first_name || ''}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-amber-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                          />
                        ) : (
                          <p className="text-amber-900 py-2 pl-6">{user.u_first_name || 'N/A'}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-amber-600 mb-1 flex items-center">
                          <RiUserLine className="mr-2" />
                          Last Name
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="u_last_name"
                            value={formData.u_last_name || ''}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-amber-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                          />
                        ) : (
                          <p className="text-amber-900 py-2 pl-6">{user.u_last_name || 'N/A'}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-amber-600 mb-1 flex items-center">
                        <RiMailLine className="mr-2" />
                        Email
                      </label>
                      {isEditing ? (
                        <input
                          type="email"
                          name="u_email_address"
                          value={formData.u_email_address || ''}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-amber-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                        />
                      ) : (
                        <p className="text-amber-900 py-2 pl-6">{user.u_email_address || 'N/A'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-amber-600 mb-1 flex items-center">
                        <RiPhoneLine className="mr-2" />
                        Phone Number
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          name="u_phone_number"
                          value={formData.u_phone_number || ''}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-amber-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                        />
                      ) : (
                        <p className="text-amber-900 py-2 pl-6">{user.u_phone_number || 'N/A'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-amber-600 mb-1 flex items-center">
                        <RiHomeLine className="mr-2" />
                        Address
                      </label>
                      {isEditing ? (
                        <textarea
                          name="u_address"
                          value={formData.u_address || ''}
                          onChange={handleInputChange}
                          rows={3}
                          className="w-full px-4 py-2 border border-amber-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                        />
                      ) : (
                        <p className="text-amber-900 py-2 pl-6 whitespace-pre-line">{user.u_address || 'N/A'}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-amber-600 mb-1">City</label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="u_city"
                            value={formData.u_city || ''}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-amber-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                          />
                        ) : (
                          <p className="text-amber-900 py-2">{user.u_city || 'N/A'}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-amber-600 mb-1">Province</label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="u_province"
                            value={formData.u_province || ''}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-amber-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                          />
                        ) : (
                          <p className="text-amber-900 py-2">{user.u_province || 'N/A'}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-amber-600 mb-1">Postal Code</label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="u_postal_code"
                            value={formData.u_postal_code || ''}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-amber-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                          />
                        ) : (
                          <p className="text-amber-900 py-2">{user.u_postal_code || 'N/A'}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* Right Column - Account Details */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6 border-b border-amber-100 bg-amber-50">
                <h2 className="text-xl font-semibold text-amber-800 flex items-center">
                  <RiShieldUserLine className="mr-2" />
                  Account Details
                </h2>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-amber-600 mb-1">Username</label>
                  <p className="text-amber-900 py-2">{user.u_username || 'N/A'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-amber-600 mb-1">Account Status</label>
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    {user.u_account_status || 'N/A'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-amber-600 mb-1 flex items-center">
                    <RiCalendarLine className="mr-2" />
                    Member Since
                  </label>
                  <p className="text-amber-900 py-2">
                    {new Date(user.u_account_creation_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-amber-600 mb-1">Last Login</label>
                  <p className="text-amber-900 py-2">
                    {new Date(user.u_last_login_date).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-amber-600 mb-1">User Role</label>
                  <p className="text-amber-900 py-2 capitalize">{user.u_user_role || 'N/A'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-amber-600 mb-1">Preferred Payment</label>
                  <p className="text-amber-900 py-2 capitalize">{user.u_preferred_payment_method || 'N/A'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-amber-600 mb-1">Date of Birth</label>
                  <p className="text-amber-900 py-2">
                    {user.u_date_of_birth ? new Date(user.u_date_of_birth).toLocaleDateString() : 'N/A'}
                  </p>
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