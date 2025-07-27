import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { message, Badge, Dropdown } from 'antd';
import { SearchOutlined, BellOutlined, LogoutOutlined, UserOutlined, SettingOutlined } from '@ant-design/icons';
import { logoutClient } from '../../../features/client/auth';
import { selectClientAuthRole, selectClientAuthName, selectClientAuthEmail } from '../../../features/client/auth';

function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get user data from Redux state
  const role = useSelector(selectClientAuthRole);
  const name = useSelector(selectClientAuthName);
  const email = useSelector(selectClientAuthEmail);

  const currentUser = {
    name: name || 'Client',
    email: email || 'contact@company.com',
    role: role || 'Contact',
    lastLogin: new Date().toLocaleString()
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutClient());
      message.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      message.error('Logout failed');
      console.error('Logout error:', error);
    }
  };

  const quickAccessItems = [
    { label: 'Dashboard', path: '/dashboard', icon: 'ri-dashboard-line' },
  ];

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

  return (
    <header className="sticky top-0 z-20 bg-gradient-to-r from-[#c76824] to-[#c76824] shadow-lg">
      {/* Top Bar */}
      <div className="bg-[#a7541d] text-blue-100 px-6 py-2 text-sm flex justify-between items-center border-b border-cyan-900/20">
        <div className="flex items-center space-x-4">
          <span className="font-medium flex items-center">
            <i className="ri-shield-keyhole-line mr-2 text-blue-200" />
            Client Console
          </span>
          <span className="w-px h-5 bg-blue-200/30"></span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            <span>Production Environment</span>
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="hidden md:block">Last login: {currentUser.lastLogin}</span>
          <span className="w-px h-5 bg-blue-200/30 hidden md:block"></span>
          <button
            onClick={handleLogout}
            className="hover:text-blue-200 transition-colors flex items-center text-sm cursor-pointer"
          >
            <i className="ri-logout-circle-r-line mr-1" />
            <span className="hidden md:inline">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Header */}
      <div className="px-6 py-3 flex items-center justify-between">
        {/* Logo and Navigation */}
        <div className="flex items-center space-x-8">
          <Link to="/dashboard" className="flex items-center group">
            <div className="w-10 h-10 rounded-lg bg-[#a7541d] flex items-center justify-center text-white mr-3 transition-all duration-300 group-hover:bg-[#a7541de0]">
              <i className="ri-user-2-line text-xl" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Client Portal</h1>
            
            </div>
          </Link>

          <nav className="hidden md:flex space-x-6">
            {quickAccessItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="text-white hover:text-blue-200 font-medium transition-colors relative group"
              >
                <i className={`${item.icon} mr-1`} />
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-200 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Search and Action Icons */}
        <div className="flex items-center space-x-6">
          {/* Enhanced Product Search */}
          <div className="w-84">
           
          </div>

          {/* User Profile */}
          <Dropdown 
            menu={{ items: profileMenuItems }}
            trigger={['click']}
            placement="bottomRight"
          >
            <div className="flex items-center space-x-3 cursor-pointer group">
              <div className="w-10 h-10 rounded-full bg-[#a7541d] flex items-center justify-center text-white font-medium shadow-sm group-hover:bg-[#a7541de0] transition-colors">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block text-white">
                <p className="text-sm font-medium truncate max-w-[120px]">{currentUser.name}</p>
                <p className="text-xs text-blue-200 truncate max-w-[120px]">{currentUser.role}</p>
              </div>
            </div>
          </Dropdown>
        </div>
      </div>
    </header>
  );
}

export default Header;