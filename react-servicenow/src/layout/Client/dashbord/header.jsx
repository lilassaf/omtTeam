import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { userLogout } from '../../../features/auth/authActions';

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
      n.id === id ? {...n, read: true} : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({...n, read: true})));
  };

  // Navigation items
  const quickAccessItems = [
    { label: 'Dashboard', path: '/client' },
    { label: 'Shop', path: '/client/shop' },
    { label: 'Orders', path: '/client/orders/current' },
    { label: 'Wishlist', path: '/client/wishlist/saved' },
    { label: 'Support', path: '/client/support' }
  ];

  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-50 bg-[#9C4221] shadow-sm border-b border-[#B45309]">
      {/* Top Bar */}
      <div className="bg-[#B45309] text-amber-100 px-4 py-1.5 text-sm flex justify-between items-center">
        <div className="flex space-x-4 items-center">
          <span className="font-medium">Client Portal</span>
          <span className="w-px h-4 bg-amber-300 bg-opacity-30"></span>
          <span className="flex items-center">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-300 mr-1.5"></span>
            <span>Online</span>
          </span>
        </div>
        <div className="flex space-x-4 items-center">
          <span>Last seen: {currentUser ? new Date().toLocaleString() : 'Today'}</span>
          <span className="w-px h-4 bg-amber-300 bg-opacity-30"></span>
          <button 
            onClick={handleLogout}
            className="hover:text-amber-300 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Header */}
      <div className="px-6 py-3 flex items-center justify-between bg-[#9C4221]">
        {/* Logo and Navigation */}
        <div className="flex items-center space-x-8">
          <Link to="/client" className="text-xl font-bold text-white flex items-center">
            <i className="ri-shopping-bag-3-line text-amber-300 mr-2" />
            LuxeCart
          </Link>
          
          <nav className="hidden md:flex space-x-6">
            {quickAccessItems.map((item, index) => (
              <Link 
                key={index} 
                to={item.path}
                className="text-white hover:text-amber-300 font-medium transition-colors duration-200 relative group"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-300 transition-all duration-300 group-hover:w-full"></span>
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
              darkMode={true}
            />
          </div>

          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => setNotificationOpen(!notificationOpen)}
              className="p-2 rounded-full hover:bg-[#B45309] text-amber-100 hover:text-amber-300 transition-colors relative"
            >
              <i className="ri-notification-3-line text-xl"></i>
              {unreadNotifications > 0 && (
                <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center transform translate-x-1 -translate-y-1">
                  {unreadNotifications}
                </span>
              )}
            </button>

            {notificationOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-[#9C4221] rounded-lg shadow-xl border border-[#B45309] z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-[#B45309] bg-[#B45309] flex justify-between items-center">
                  <h3 className="font-medium text-white">Notifications</h3>
                  <button 
                    onClick={markAllAsRead}
                    className="text-xs text-amber-300 hover:text-white"
                  >
                    Mark all as read
                  </button>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map(notification => (
                      <div 
                        key={notification.id} 
                        className={`px-4 py-3 border-b border-[#B45309] hover:bg-[#B45309] transition-colors cursor-pointer ${
                          !notification.read ? 'bg-[#B45309]' : ''
                        }`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start">
                          <div className={`p-2 rounded-full mr-3 ${
                            !notification.read ? 'bg-amber-300/20 text-amber-300' : 'bg-amber-100/10 text-amber-100'
                          }`}>
                            <i className={`${notification.icon} text-lg`}></i>
                          </div>
                          <div className="flex-1">
                            <h4 className={`font-medium ${
                              !notification.read ? 'text-white' : 'text-amber-100'
                            }`}>{notification.title}</h4>
                            <p className="text-sm text-amber-200">{notification.message}</p>
                            <p className="text-xs text-amber-300/70 mt-1">{notification.time}</p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 rounded-full bg-amber-300 ml-2 mt-1.5"></div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-6 text-center">
                      <i className="ri-notification-off-line text-3xl text-amber-200/50 mb-2"></i>
                      <p className="text-amber-200/70">No notifications</p>
                    </div>
                  )}
                </div>

                <div className="px-4 py-2 border-t border-[#B45309] bg-[#B45309] text-center">
                  <Link 
                    to="/client/notifications" 
                    className="text-sm text-amber-300 hover:text-white inline-block"
                    onClick={() => setNotificationOpen(false)}
                  >
                    View all
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Shopping Cart with Polling Updates */}
          <Link 
            to="/client/orders/current" 
            className="relative p-2 rounded-full hover:bg-[#B45309] text-amber-100 hover:text-amber-300 transition-colors"
          >
            <i className="ri-shopping-cart-2-line text-xl"></i>
            {cartItemsCount > 0 && (
              <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center transform translate-x-1 -translate-y-1">
                {!loading ? cartItemsCount : '...'}
              </span>
            )}
          </Link>

          {/* User Profile */}
          {currentUser && (
            <div className="flex items-center space-x-3 group relative cursor-pointer">
              <div className="h-10 w-10 rounded-full bg-[#B45309] flex items-center justify-center text-amber-100 font-medium shadow-sm border border-amber-300">
                {currentUser.u_email_address?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="hidden md:block">
                <p className="font-medium text-white group-hover:text-amber-300 transition-colors">
               {currentUser?.u_first_name && currentUser?.u_last_name
  ? `${currentUser.u_first_name} ${currentUser.u_last_name}`
  : 'User'}

                </p>
                <p className="text-xs text-amber-300">
                  {currentUser.u_email_address || 'user@example.com'}
                </p>
              </div>

              {/* Profile Dropdown */}
              <div className="absolute right-0 top-full mt-1 w-64 bg-[#9C4221] rounded-md shadow-lg py-1 z-50 hidden group-hover:block border border-[#B45309]">
                <div className="px-4 py-3 border-b border-[#B45309] bg-[#B45309]">
                  <p className="font-medium text-white">{currentUser.u_first_name }</p>
                  <p className="text-sm text-amber-100 truncate">{currentUser?.u_first_name && currentUser?.u_last_name
  ? `${currentUser.u_first_name} ${currentUser.u_last_name}`
  : 'User'}
</p>
                  <div className="mt-2 flex justify-between text-xs">
                    <span className="text-amber-300">Member since {new Date(currentUser.createdAt).getFullYear()}</span>
                  </div>
                </div>
                <Link to={`/client/MyProfile/${currentUser.sys_id}`} className="block px-4 py-2.5 text-white hover:bg-[#B45309] hover:text-amber-300 transition-colors">
                  <i className="ri-user-line mr-2"></i> My Profile
                </Link>
                <Link to="/client/settings" className="block px-4 py-2.5 text-white hover:bg-[#B45309] hover:text-amber-300 transition-colors">
                  <i className="ri-settings-3-line mr-2"></i> Settings
                </Link>
                <div className="border-t border-[#B45309]"></div>
                <button 
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2.5 text-white hover:bg-[#B45309] hover:text-red-400 transition-colors"
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