import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { message, Dropdown } from 'antd';
import { LogoutOutlined, UserOutlined, SettingOutlined } from '@ant-design/icons';
import { userLogout } from '../../features/auth/authActions';
import ProductSearch from '../../views/dashbord/npl-search';

function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo } = useSelector(state => state.auth);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false); // Simplified loading since we're not fetching data here
  }, []);

  const handleLogout = async () => {
    try {
      await dispatch(userLogout());
      message.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      message.error('Logout failed');
      console.error('Logout error:', error);
    }
  };

  const profileMenuItems = [
    {
      key: 'profile',
      label: (
        <Link to="/dashboard/profile" className="flex items-center">
          <UserOutlined className="mr-2" />
          My Profile
        </Link>
      )
    },
    {
      key: 'settings',
      label: (
        <Link to="/settings" className="flex items-center">
          <SettingOutlined className="mr-2" />
          Settings
        </Link>
      )
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      label: (
        <button onClick={handleLogout} className="flex items-center w-full">
          <LogoutOutlined className="mr-2" />
          Sign Out
        </button>
      )
    }
  ];

  if (loading) {
    return (
      <header className="sticky top-0 z-20 bg-gradient-to-r from-cyan-700 to-cyan-600 h-20 shadow-md">
        <div className="animate-pulse h-full w-full"></div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-20 bg-gradient-to-r from-cyan-700 to-cyan-600 shadow-lg">
      {/* Top Bar - Simplified */}
      <div className="bg-cyan-800/90 text-blue-100 px-6 py-2 text-sm flex justify-end items-center border-b border-cyan-900/20">
        <div className="flex items-center space-x-4">
          {userInfo?.last_login_time && (
            <span className="hidden md:block">
              Last login: {new Date(userInfo.last_login_time).toLocaleString()}
            </span>
          )}
          <button
            onClick={handleLogout}
            className="hover:text-blue-200 transition-colors flex items-center text-sm"
          >
            <i className="ri-logout-circle-r-line mr-1" />
            <span className="hidden md:inline">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Header */}
      <div className="px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <Link to="/dashboard" className="flex items-center group">
            <div className="w-10 h-10 rounded-lg bg-cyan-800 flex items-center justify-center text-white mr-3 transition-all duration-300 group-hover:bg-cyan-900">
              <i className="ri-admin-line text-xl" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Admin Portal</h1>
            </div>
          </Link>
        </div>

        {/* Search and User Profile */}
        <div className="flex items-center space-x-6">
          {/* Product Search */}
          <div className="w-84">
            <ProductSearch />
          </div>

          {/* User Profile Dropdown */}
          <Dropdown 
            menu={{ items: profileMenuItems }}
            trigger={['click']}
            placement="bottomRight"
          >
            <div className="flex items-center space-x-3 cursor-pointer group">
              <div className="w-10 h-10 rounded-full bg-cyan-800 flex items-center justify-center text-white font-medium shadow-sm group-hover:bg-cyan-900 transition-colors">
                {userInfo?.name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="hidden md:block text-white">
                <p className="text-sm font-medium truncate max-w-[120px]">
                  {userInfo?.name || 'Admin User'}
                </p>
                <p className="text-xs text-blue-200 truncate max-w-[120px]">
                  {userInfo?.role || 'System Administrator'}
                </p>
              </div>
            </div>
          </Dropdown>
        </div>
      </div>
    </header>
  );
}

export default Header;