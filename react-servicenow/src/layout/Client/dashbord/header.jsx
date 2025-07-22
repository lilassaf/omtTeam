import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { userLogout } from '../../../features/auth/authActions';
import SearchButton from '../../../views/Client/components/SearchButton/SearchButton';
import Logo from '@assets/logo.png'; // Make sure this path is correct

function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Client notifications
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Order Shipped',
      message: 'Your order #12345 has been shipped',
      time: '2 hours ago',
      read: false,
      icon: 'ri-truck-line'
    },
    {
      id: 2,
      title: 'Special Offer',
      message: 'Exclusive 20% discount on your next purchase',
      time: '1 day ago',
      read: false,
      icon: 'ri-coupon-line'
    }
  ]);

  // Get user data from localStorage
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('currentUser'));
    if (userData) {
      setCurrentUser(userData);
      fetchCartCount(userData.sys_id);
    }
  }, []);

  // Polling mechanism to check for cart updates
  useEffect(() => {
    if (!currentUser) return;

    const pollInterval = setInterval(() => {
      fetchCartCount(currentUser.sys_id);
    }, 5000); // Check every 5 seconds

    return () => clearInterval(pollInterval);
  }, [currentUser]);

  const fetchCartCount = async (userId) => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3000/orders/count?userId=${userId}&status=in_cart`
      );
      const data = await response.json();
      setCartItemsCount(data.count);
    } catch (error) {
      console.error('Error fetching cart count:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem('currentUser');
      await dispatch(userLogout());
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login', { replace: true });
    }
  };

  // Notification handlers
  const markAsRead = (id) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  // Navigation items
  const quickAccessItems = [
    { label: 'Dashboard', path: '/client' },
    { label: 'Orders', path: '/client/orders/current' },
    { label: 'Wishlist', path: '/client/wishlist/saved' },
    { label: 'Support', path: '/client/support' }
  ];

  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-50 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] backdrop-blur-sm bg-[rgba(255,255,255,0.98)] shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
      {/* Top Bar */}
      <div className="bg-[#005baa] text-[#b3e0fc] px-4 py-1.5 text-sm flex justify-between items-center">
        <div className="flex space-x-4 items-center">
          <span className="font-medium">Client Portal</span>
          <span className="w-px h-4 bg-[#00c6fb] bg-opacity-30"></span>
          <span className="flex items-center">
            <span className="inline-block w-2 h-2 rounded-full bg-[#00c6fb] mr-1.5"></span>
            <span>Online</span>
          </span>
        </div>
        <div className="flex space-x-4 items-center">
          <span>Last seen: {currentUser ? new Date().toLocaleString() : 'Today'}</span>
          <span className="w-px h-4 bg-[#00c6fb] bg-opacity-30"></span>
          <button
            onClick={handleLogout}
            className="hover:text-[#00c6fb] transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Header */}
      <div className="px-6 py-3 flex items-center justify-between bg-white">
        {/* Logo and Navigation */}
        <div className="flex items-center space-x-8">
          <Link to="/" className="text-xl font-bold text-[#005baa] flex items-center">
            <img src={Logo} alt="OMT Logo" className="h-8 mr-2" />
            OMT
          </Link>

          <nav className="hidden md:flex space-x-6">
            {quickAccessItems.map((item, index) => (
              <Link
                key={index}
                to={item.path}
                className="text-[#005baa] hover:text-[#00c6fb] font-medium transition-colors duration-200 relative group"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#00c6fb] transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
          </nav>
        </div>

        {/* User Controls */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="hidden md:block w-64">
            <SearchButton
              placeholder="Search products..."
              darkMode={false}
            />
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotificationOpen(!notificationOpen)}
              className="p-2 rounded-full hover:bg-[#f0f7ff] text-[#005baa] hover:text-[#00c6fb] transition-colors relative"
            >
              <i className="ri-notification-3-line text-xl"></i>
              {unreadNotifications > 0 && (
                <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center transform translate-x-1 -translate-y-1">
                  {unreadNotifications}
                </span>
              )}
            </button>

            {notificationOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-[#e0e0e0] z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-[#e0e0e0] bg-[#f8f8f8] flex justify-between items-center">
                  <h3 className="font-medium text-[#005baa]">Notifications</h3>
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-[#00c6fb] hover:text-[#005baa]"
                  >
                    Mark all as read
                  </button>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map(notification => (
                      <div
                        key={notification.id}
                        className={`px-4 py-3 border-b border-[#e0e0e0] hover:bg-[#f0f7ff] transition-colors cursor-pointer ${
                          !notification.read ? 'bg-[#f0f7ff]' : ''
                        }`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start">
                          <div className={`p-2 rounded-full mr-3 ${
                            !notification.read ? 'bg-[#00c6fb]/20 text-[#00c6fb]' : 'bg-[#e0e0e0] text-[#005baa]'
                          }`}>
                            <i className={`${notification.icon} text-lg`}></i>
                          </div>
                          <div className="flex-1">
                            <h4 className={`font-medium ${
                              !notification.read ? 'text-[#005baa]' : 'text-[#333]'
                            }`}>{notification.title}</h4>
                            <p className="text-sm text-[#555]">{notification.message}</p>
                            <p className="text-xs text-[#888] mt-1">{notification.time}</p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 rounded-full bg-[#00c6fb] ml-2 mt-1.5"></div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-6 text-center">
                      <i className="ri-notification-off-line text-3xl text-[#888] mb-2"></i>
                      <p className="text-[#888]">No notifications</p>
                    </div>
                  )}
                </div>

                <div className="px-4 py-2 border-t border-[#e0e0e0] bg-[#f8f8f8] text-center">
                  <Link
                    to="/client/notifications"
                    className="text-sm text-[#00c6fb] hover:text-[#005baa] inline-block"
                    onClick={() => setNotificationOpen(false)}
                  >
                    View all
                  </Link>
                </div>
              </div>
            )}
          </div>

        

          {/* User Profile */}
          {currentUser && (
            <div className="flex items-center space-x-3 group relative cursor-pointer">
              <div className="h-10 w-10 rounded-full bg-[#005baa] flex items-center justify-center text-white font-medium shadow-sm border border-[#00c6fb]">
                {currentUser.u_email_address?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="hidden md:block">
                <p className="font-medium text-[#005baa] group-hover:text-[#00c6fb] transition-colors">
                  {currentUser?.u_first_name && currentUser?.u_last_name
                    ? `${currentUser.u_first_name} ${currentUser.u_last_name}`
                    : 'User'}
                </p>
                <p className="text-xs text-[#555]">
                  {currentUser.u_email_address || 'user@example.com'}
                </p>
              </div>

              {/* Profile Dropdown */}
              <div className="absolute right-0 top-full mt-1 w-64 bg-white rounded-md shadow-lg py-1 z-50 hidden group-hover:block border border-[#e0e0e0]">
                <div className="px-4 py-3 border-b border-[#e0e0e0] bg-[#f8f8f8]">
                  <p className="font-medium text-[#005baa]">{currentUser.u_first_name}</p>
                  <p className="text-sm text-[#555] truncate">
                    {currentUser?.u_first_name && currentUser?.u_last_name
                      ? `${currentUser.u_first_name} ${currentUser.u_last_name}`
                      : 'User'}
                  </p>
                  <div className="mt-2 flex justify-between text-xs">
                    <span className="text-[#888]">Member since {new Date(currentUser.createdAt).getFullYear()}</span>
                  </div>
                </div>
                <Link to={`/client/MyProfile/${currentUser.sys_id}`} className="block px-4 py-2.5 text-[#005baa] hover:bg-[#f0f7ff] hover:text-[#00c6fb] transition-colors">
                  <i className="ri-user-line mr-2"></i> My Profile
                </Link>
                <Link to="/client/settings" className="block px-4 py-2.5 text-[#005baa] hover:bg-[#f0f7ff] hover:text-[#00c6fb] transition-colors">
                  <i className="ri-settings-3-line mr-2"></i> Settings
                </Link>
                <div className="border-t border-[#e0e0e0]"></div>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2.5 text-[#005baa] hover:bg-[#f0f7ff] hover:text-red-500 transition-colors"
                >
                  <i className="ri-logout-box-r-line mr-2"></i> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;