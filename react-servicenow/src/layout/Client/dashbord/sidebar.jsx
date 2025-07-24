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
      { path: '/client/wishlist/saved', icon: 'bookmark-line', text: 'Saved Items' },
      ]
    },
    {
      path: '/client/orders',
      icon: 'shopping-cart-line',
      text: 'Orders',
      children: [
        { path: '/client/orders/current', icon: 'file-list-3-line', text: 'Opportunities' },
        { path: '/client/orders/history', icon: 'price-tag-line', text: 'Quotes' },
      ]
    },
  ];

  return (
    <>
      <aside className="z-30 h-screen fixed bg-[#005baa] inset-y-0 py-4 px-4 shadow-lg overflow-hidden w-64 border-r border-[#00c6fb]/30 flex flex-col">
        {/* Header Section */}
        <div className="mb-8 mt-2 h-12 flex items-center px-2 text-white font-bold text-xl">
          <i className="ri-user-smile-line mr-2 text-[#00c6fb]" />
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
                          ? 'bg-[#00c6fb]/20 text-white shadow-md border-l-4 border-[#00c6fb]' 
                          : 'text-white hover:bg-[#00c6fb]/10 hover:text-white'
                      }`}
                    >
                      <i className={`ri-${item.icon} mr-3 text-lg ${isItemActive ? 'text-[#00c6fb]' : ''}`} />
                      <span className="font-medium flex-1">{item.text}</span>
                      {hasChildren && (
                        <i className={`ri-arrow-right-s-line transition-transform duration-200 ${
                          isExpanded ? 'transform rotate-90' : ''
                        }`} />
                      )}
                    </Link>

                    {hasChildren && isExpanded && (
                      <ul className="ml-4 mt-1 space-y-1 py-1 animate-fadeIn">
                        {item.children.map((child) => (
                          <li key={child.path}>
                            <Link
                              to={child.path}
                              className={`flex items-center px-3 py-2 text-sm rounded transition-all duration-200 ${
                                isActive(child.path) 
                                  ? 'bg-[#00c6fb]/10 text-[#00c6fb] font-medium border-l-2 border-[#00c6fb]' 
                                  : 'text-white hover:bg-[#00c6fb]/5 hover:text-white'
                              }`}
                            >
                              <i className={`ri-${child.icon} mr-3 text-base ${isActive(child.path) ? 'text-[#00c6fb]' : ''}`} />
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
        <div className="border-t border-[#00c6fb]/30 pt-2 pb-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-white hover:bg-[#00c6fb]/10 transition-colors duration-200 group rounded-lg"
          >
            <i className="ri-logout-circle-r-line mr-3 text-lg group-hover:text-[#00c6fb]" />
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
          background: #00c6fb;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #00c6fb;
          opacity: 0.8;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}</style>
    </>
  );
};

export default Sidebar;