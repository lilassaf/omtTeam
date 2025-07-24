import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

const NotificationIcon = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifications = useSelector(state => state.notifications?.items || []);

  useEffect(() => {
    const count = notifications.filter(n => !n.read).length;
    setUnreadCount(count);
  }, [notifications]);

  const sampleNotifications = [
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
      message: 'Exclusive 20% off for gold members',
      time: '1 day ago',
      read: false,
      icon: 'ri-coupon-line'
    },
    {
      id: 3,
      title: 'Wishlist Reminder',
      message: 'Items in your wishlist are back in stock',
      time: '3 days ago',
      read: true,
      icon: 'ri-heart-line'
    }
  ];

  const displayNotifications = notifications.length > 0 ? notifications : sampleNotifications;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-[#047857] text-white hover:text-emerald-300 transition-colors relative"
      >
        <i className="ri-notification-3-line text-xl"></i>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center transform translate-x-1 -translate-y-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-[#065F46] rounded-lg shadow-xl border border-[#047857] z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-[#047857] bg-[#047857] flex justify-between items-center">
            <h3 className="font-medium text-white">Notifications</h3>
            <div className="flex space-x-2">
              <button className="text-xs text-emerald-300 hover:text-white">
                Mark all as read
              </button>
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto custom-scrollbar">
            {displayNotifications.length > 0 ? (
              displayNotifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`px-4 py-3 border-b border-[#047857] hover:bg-[#047857] transition-colors cursor-pointer ${
                    !notification.read ? 'bg-[#047857]/70' : ''
                  }`}
                >
                  <div className="flex items-start">
                    <div className={`p-2 rounded-full mr-3 ${
                      !notification.read ? 'bg-emerald-300/20 text-emerald-300' : 'bg-[#047857] text-white'
                    }`}>
                      <i className={`${notification.icon} text-lg`}></i>
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-medium ${
                        !notification.read ? 'text-white' : 'text-emerald-100'
                      }`}>{notification.title}</h4>
                      <p className="text-sm text-emerald-200">{notification.message}</p>
                      <p className="text-xs text-emerald-300 mt-1">{notification.time}</p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 rounded-full bg-emerald-300 ml-2 mt-1.5"></div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-6 text-center">
                <i className="ri-notification-off-line text-3xl text-emerald-300 mb-2"></i>
                <p className="text-emerald-200">No new notifications</p>
              </div>
            )}
          </div>

          <div className="px-4 py-2 border-t border-[#047857] bg-[#047857] text-center">
            <a 
              href="/notifications" 
              className="text-sm text-emerald-300 hover:text-white inline-flex items-center"
            >
              View all notifications <i className="ri-arrow-right-line ml-1"></i>
            </a>
          </div>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #047857;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #065F46;
        }
      `}</style>
    </div>
  );
};

export default NotificationIcon;