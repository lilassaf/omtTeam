import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { userLogout } from '../../../features/auth/authActions';
import SearchButton from '../../../views/Client/components/SearchButton/SearchButton';
import Logo from '@assets/logo.png';

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
    const storedUser = JSON.parse(localStorage.getItem('currentUser'));

    if (storedUser) {
      // If the API response was stored as-is (with `contact` field)
      if (storedUser.contact) {
        setCurrentUser(storedUser.contact);
      }
      // If only the `contact` object was stored
      else {
        setCurrentUser(storedUser);
      }
    }
  }, []);

  // Polling mechanism to check for cart updates
  useEffect(() => {
    if (!currentUser) return;

    const pollInterval = setInterval(() => {
      fetchCartCount(currentUser.id);
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
  ];

  const unreadNotifications = notifications.filter(n => !n.read).length;

  // This function conditionally renders the "Create Contact" button
  const renderCreateContactButton = () => {
    // Only render if currentUser exists and is a primary contact
    if (currentUser && currentUser.isPrimaryContact) {
      return (
        <Link
          to="/client/create"
          className="flex items-center px-4 py-2.5 text-[#005baa] hover:bg-[#f0f7ff] hover:text-[#00c6fb] transition-colors"
        >
          <i className="ri-user-add-line mr-2"></i> Create Contact
        </Link>
      );
    }
    return null; // Don't render if not a primary contact
  };

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

          {/* User Profile Dropdown */}
          {currentUser && (
            <div className="flex items-center space-x-3 group relative cursor-pointer">
              <div className="relative">
                <div className="h-10 w-10 rounded-full bg-[#005baa] flex items-center justify-center text-white font-medium shadow-sm border border-[#00c6fb]">
                  {currentUser.firstName?.charAt(0).toUpperCase() || 'U'}
                </div>
                {currentUser?.isPrimaryContact && (
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
                    <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Primary
                  </div>
                )}
              </div>
              <div className="hidden md:block">
                <p className="font-medium text-[#005baa] group-hover:text-[#00c6fb] transition-colors">
                  {currentUser?.firstName} {currentUser?.lastName}
                </p>
                <p className="text-xs text-[#555]">
                  {currentUser.email}
                </p>
              </div>

              {/* Profile Dropdown */}
              <div className="absolute right-0 top-full mt-1 w-64 bg-white rounded-md shadow-lg py-1 z-50 hidden group-hover:block border border-[#e0e0e0]">
                <div className="px-4 py-3 border-b border-[#e0e0e0] bg-[#f8f8f8]">
                  <p className="font-medium text-[#005baa]">{currentUser.firstName} {currentUser.lastName}</p>
                  <p className="text-sm text-[#555] truncate">
                    {currentUser.email}
                  </p>
                </div>

                {/* Render Create Contact Button based on privilege */}
                {renderCreateContactButton()}

                {/* My Profile Button */}
                <Link
                  to={`/client/MyProfile/${currentUser.id}`}
                  className="flex items-center px-4 py-2.5 text-[#005baa] hover:bg-[#f0f7ff] hover:text-[#00c6fb] transition-colors"
                >
                  <i className="ri-user-line mr-2"></i> My Profile
                </Link>

                {/* Settings Button */}
                <Link
                  to="/client/settings"
                  className="flex items-center px-4 py-2.5 text-[#005baa] hover:bg-[#f0f7ff] hover:text-[#00c6fb] transition-colors"
                >
                  <i className="ri-settings-3-line mr-2"></i> Settings
                </Link>

                <div className="border-t border-[#e0e0e0]"></div>

                {/* Sign Out Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full text-left px-4 py-2.5 text-[#005baa] hover:bg-[#f0f7ff] hover:text-red-500 transition-colors"
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