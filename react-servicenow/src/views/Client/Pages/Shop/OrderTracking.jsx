import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  FiShoppingBag, FiCheck, FiX, FiTruck, FiPackage, FiClock, 
  FiArrowLeft, FiCalendar, FiMapPin, FiBox, FiUserCheck, 
  FiAlertCircle, FiLoader, FiMail, FiThumbsUp, FiThumbsDown, 
  FiRotateCcw, FiDollarSign, FiMessageSquare, FiEdit
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const ClientOrderTracking = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [notification, setNotification] = useState(null);

  // Color palette
  const colors = {
    primary: { 50: '#FFFBEB', 500: '#F59E0B', 700: '#B45309' },
    gray: { 50: '#F9FAFB', 200: '#E5E7EB', 500: '#6B7280', 700: '#374151', 900: '#111827' },
    success: '#10B981', error: '#EF4444', info: '#3B82F6', warning: '#F59E0B'
  };

  // Fetch current user
  const getCurrentUser = () => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user?.sys_id) navigate('/login');
    return user;
  };

  // Fetch orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const user = getCurrentUser();
      setCurrentUser(user);
      
      const response = await fetch('http://localhost:3000/orders?user=' + user.sys_id);
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  // Status configuration
  const getStatusDetails = (order) => {
    const statusConfig = {
      pending: { icon: <FiClock />, color: colors.warning, text: 'Pending Review', 
                description: 'Waiting for agent to review your order', canCancel: true },
      quoted: { icon: <FiDollarSign />, color: colors.info, text: 'Quotation Sent', 
                description: 'Please review the quotation', canCancel: true, canAccept: true },
      confirmed: { icon: <FiThumbsUp />, color: colors.success, text: 'Confirmed', 
                  description: 'You accepted the quotation', canCancel: false },
      shipped: { icon: <FiTruck />, color: colors.success, text: 'Shipped', 
                description: 'Your order is on the way', canCancel: false },
      delivered: { icon: <FiPackage />, color: colors.success, text: 'Delivered', 
                  description: 'Your order has arrived', canCancel: false },
      cancelled: { icon: <FiX />, color: colors.error, text: 'Cancelled', 
                  description: 'Order was cancelled', canCancel: false }
    };
    
    return statusConfig[order.u_choice] || statusConfig.pending;
  };

  // Action handlers
  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Are you sure?')) {
      const response = await fetch(`http://localhost:3000/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ u_choice: 'cancelled', u_stage: 'closed_lost' })
      });
      if (response.ok) {
        fetchOrders();
        setNotification({ type: 'success', message: 'Order cancelled' });
      }
    }
  };

  const handleAcceptQuotation = async (orderId) => {
    const response = await fetch(`http://localhost:3000/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ u_choice: 'confirmed', u_stage: 'order_confirmed' })
    });
    if (response.ok) {
      fetchOrders();
      setNotification({ type: 'success', message: 'Quotation accepted!' });
    }
  };

  // Notification component
  const Notification = () => (
    <AnimatePresence>
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`fixed bottom-4 right-4 p-4 rounded-md shadow-lg ${
            notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {notification.message}
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <FiLoader className="animate-spin text-amber-500 text-4xl" />
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 flex items-center">
        <FiShoppingBag className="mr-2" /> My Orders
      </h1>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No orders found</p>
          <button 
            onClick={() => navigate('/products')}
            className="bg-amber-500 text-white px-4 py-2 rounded-md hover:bg-amber-600"
          >
            Browse Products
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => {
            const status = getStatusDetails(order);
            return (
              <div key={order.sys_id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold">Order #{order.u_number}</h3>
                    <p className="text-gray-500">{order.product?.u_name}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm ${
                    status.color === colors.success ? 'bg-green-100 text-green-800' :
                    status.color === colors.error ? 'bg-red-100 text-red-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {status.text}
                  </div>
                </div>

                <div className="my-6">
                  {/* Progress tracker would go here */}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2 flex items-center">
                      <FiMapPin className="mr-2" /> Delivery Info
                    </h4>
                    <p>{order.u_street_address}, {order.u_city}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2 flex items-center">
                      <FiDollarSign className="mr-2" /> Payment
                    </h4>
                    <p>Total: ${order.u_total_price}</p>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  {status.canAccept && (
                    <button
                      onClick={() => handleAcceptQuotation(order.sys_id)}
                      className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 flex items-center"
                    >
                      <FiThumbsUp className="mr-2" /> Accept Quotation
                    </button>
                  )}
                  {status.canCancel && (
                    <button
                      onClick={() => handleCancelOrder(order.sys_id)}
                      className="border border-red-500 text-red-500 px-4 py-2 rounded-md hover:bg-red-50 flex items-center"
                    >
                      <FiX className="mr-2" /> Cancel Order
                    </button>
                  )}
                  <button
                    onClick={() => navigate(`/orders/${order.sys_id}`)}
                    className="border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 flex items-center"
                  >
                    <FiEdit className="mr-2" /> Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <Notification />
    </div>
  );
};

export default ClientOrderTracking;