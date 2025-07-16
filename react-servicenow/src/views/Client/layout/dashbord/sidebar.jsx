import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const Sidebar = () => {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState({});

  const handleLogout = async (e) => {
    e.preventDefault();
    console.log('Logging out...');
  };

  const toggleExpand = (path) => {
    setExpandedItems(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  const isActive = (path) => {
    return location.pathname.toLowerCase() === path.toLowerCase();
  };

  const isChildActive = (children) => {
    return children.some(child =>
      location.pathname.toLowerCase().startsWith(child.path.toLowerCase())
    );
  };

  const navItems = [
    {
      path: '/client',
      icon: 'home-line',
      text: 'Dashboard',
      children: [
        { path: '/client/overview', icon: 'bar-chart-line', text: 'Overview' },
        { path: '#', icon: 'pulse-line', text: 'Recent Activity' }
      ]
    },
    {
      path: '/client/shop',
      icon: 'shopping-bag-line',
      text: 'Shop',
      children: [
        { path: '/client/shop/all-products', icon: 'archive-line', text: 'All Products' },
        { path: '#', icon: 'flashlight-line', text: 'Special Deals' }
      ]
    },
    {
      path: '/client/orders',
      icon: 'shopping-cart-line',
      text: 'My Orders',
      children: [
        { path: '/client/orders/current', icon: 'file-list-3-line', text: 'Current Orders' },
        { path: '/client/orders/history', icon: 'price-tag-line', text: 'Orders Tracking' },
        { path: '#', icon: 'arrow-go-back-line', text: 'Returns' }
      ]
    },
    {
      path: '/client/wishlist',
      icon: 'heart-line',
      text: 'Wishlist',
      children: [
        { path: '/client/wishlist/saved', icon: 'bookmark-line', text: 'Saved Items' },
        { path: '#', icon: 'magic-line', text: 'Recommendations' }
      ]
    },
    {
      path: '/client/account',
      icon: 'user-line',
      text: 'My Account',
      children: [
        { path: '#', icon: 'user-settings-line', text: 'Profile' },
        { path: '#', icon: 'map-pin-line', text: 'Addresses' },
        { path: '#', icon: 'bank-card-line', text: 'Payment Methods' }
      ]
    },
    {
      path: '/client/support',
      icon: 'customer-service-line',
      text: 'Support',
      children: [
        { path: '#', icon: 'questionnaire-line', text: 'My Tickets' },
        { path: '#', icon: 'question-line', text: 'FAQs' },
        { path: '#', icon: 'contacts-line', text: 'Contact Us' }
      ]
    }
  ];

  return (
    <>
      <aside className="z-30 h-screen fixed bg-[#9C4221] inset-y-0 py-4 px-4 shadow-lg overflow-hidden w-64 border-r border-[#B45309] flex flex-col">
        {/* Header Section */}
        <div className="mb-8 mt-2 h-12 flex items-center px-2 text-white font-bold text-xl">
          <i className="ri-user-smile-line mr-2 text-amber-300" />
          My Account
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const hasChildren = item.children?.length > 0;
              const isItemActive = isActive(item.path) || (hasChildren && isChildActive(item.children));
              const isExpanded = expandedItems[item.path];

              return (
                <li key={item.path}>
                  <div className="flex flex-col overflow-hidden rounded-lg">
                    <Link
                      to={item.path}
                      onClick={(e) => {
                        if (hasChildren) {
                          e.preventDefault();
                          toggleExpand(item.path);
                        }
                      }}
                      className={`flex items-center px-3 py-2.5 transition-all duration-200 ${
                        isItemActive 
                          ? 'bg-[#B45309] text-white shadow-md' 
                          : 'text-white hover:bg-[#B45309] hover:text-white'
                      }`}
                    >
                      <i className={`ri-${item.icon} mr-3 text-lg`} />
                      <span className="font-medium flex-1">{item.text}</span>
                      {hasChildren && (
                        <i className={`ri-arrow-right-s-line transition-transform duration-200 ${
                          isExpanded ? 'transform rotate-90' : ''
                        }`} />
                      )}
                    </Link>

                    {hasChildren && isExpanded && (
                      <ul className="ml-8 mt-1 space-y-1 py-1 animate-fadeIn">
                        {item.children.map((child) => (
                          <li key={child.path}>
                            <Link
                              to={child.path}
                              className={`flex items-center px-3 py-2 text-sm rounded transition-all duration-200 ${
                                isActive(child.path) 
                                  ? 'bg-[#FEEBC8] text-[#9C4221] font-medium' 
                                  : 'text-white hover:bg-[#B45309] hover:text-white'
                              }`}
                            >
                              <i className={`ri-${child.icon} mr-3 text-base`} />
                              <span>{child.text}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Section */}
        <div className="border-t border-[#B45309] pt-2 pb-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-white hover:bg-[#B45309] transition-colors duration-200 group rounded-lg"
          >
            <i className="ri-logout-circle-r-line mr-3 text-lg group-hover:animate-pulse" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Spacer for main content */}
      <div className="ml-64" />
      
      {/* Custom scrollbar styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #B45309;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9C4221;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        .group-hover\:animate-pulse:hover {
          animation: pulse 1s infinite;
        }
      `}</style>
    </>
  );
};

export default Sidebar;