import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiShoppingBag, 
  FiCheck, 
  FiArrowLeft,
  FiHome,
  FiX,
  FiChevronDown,
  FiChevronUp,
  FiFileText,
  FiTruck,
  FiDollarSign,
  FiClock,
  FiMail,
  FiThumbsUp,
  FiThumbsDown,
  FiRotateCcw,
  FiPackage
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const ClientDashboard = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('pending');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Color scheme
  const colors = {
    primary: '#B45309',
    primaryLight: '#FB923C',
    primaryDark: '#7C2D12',
    background: '#FFF7ED',
    cardBg: '#FFFFFF',
    textDark: '#1E293B',
    textLight: '#64748B',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
    border: '#E5E7EB'
  };

  const getCurrentUser = () => {
    try {
      const user = JSON.parse(localStorage.getItem('currentUser'));
      if (!user?.sys_id) {
        navigate('/login');
        return null;
      }
      return user;
    } catch (err) {
      navigate('/login');
      return null;
    }
  };

  const currentUser = getCurrentUser();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setSuccessMessage('');

      const ordersResponse = await fetch('http://localhost:3000/orders');
      if (!ordersResponse.ok) throw new Error('Failed to fetch orders');
      const allOrders = await ordersResponse.json();

      const userOrders = allOrders.filter(
        (order) => order.u_user?.value === currentUser.sys_id
      );

      const ordersWithProducts = await Promise.all(
        userOrders.map(async (order) => {
          if (!order.u_product_offerings?.value) return null;

          try {
            const productResponse = await fetch(
              `http://localhost:3000/product-offerings/${order.u_product_offerings.value}`
            );
            if (!productResponse.ok) throw new Error('Product not found');
            const productData = await productResponse.json();

            return {
              ...order,
              product: {
                name: productData.u_name,
                image: productData.u_image_url,
                price: parseFloat(productData.u_price),
                category: productData.u_category,
              },
            };
          } catch (err) {
            console.error(`Error fetching product ${order.u_product_offerings.value}:`, err);
            return {
              ...order,
              product: null,
            };
          }
        })
      );

      setOrders(ordersWithProducts.filter(Boolean));
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(order => {
    switch (selectedTab) {
      case 'pending':
        return order.u_choice === 'pending';
      case 'quoted':
        return order.u_choice === 'quoted' || order.u_stage === 'quotation-sent';
      case 'confirmed':
        return order.u_choice === 'confirmed' || order.u_stage === 'order-confirmed';
      case 'processing':
        return order.u_choice === 'shipped' || order.u_stage === 'processing';
      case 'completed':
        return order.u_choice === 'delivered' || order.u_choice === 'completed' || order.u_stage === 'closed-won';
      case 'cancelled':
        return order.u_choice === 'cancelled' || order.u_choice === 'returned' || 
               order.u_choice === 'refunded' || order.u_stage === 'closed-lost';
      default:
        return true;
    }
  });

  const getStatusBadge = (order) => {
    const choice = order.u_choice;
    const stage = order.u_stage;
    
    // Priority to u_choice for display
    if (choice) {
      switch (choice) {
        case 'pending':
          return {
            text: 'Pending Review',
            bg: '#FEF3C7',
            color: '#92400E',
            icon: <FiClock className="mr-1" />
          };
        case 'quoted':
          return {
            text: 'Quotation Sent',
            bg: '#BFDBFE',
            color: '#1E40AF',
            icon: <FiMail className="mr-1" />
          };
        case 'confirmed':
          return {
            text: 'Order Confirmed',
            bg: '#A7F3D0',
            color: '#065F46',
            icon: <FiThumbsUp className="mr-1" />
          };
        case 'shipped':
          return {
            text: 'Shipped',
            bg: '#FBCFE8',
            color: '#9D174D',
            icon: <FiTruck className="mr-1" />
          };
        case 'delivered':
          return {
            text: 'Delivered',
            bg: '#D1FAE5',
            color: '#065F46',
            icon: <FiPackage className="mr-1" />
          };
        case 'completed':
          return {
            text: 'Completed',
            bg: '#D1FAE5',
            color: '#065F46',
            icon: <FiCheck className="mr-1" />
          };
        case 'cancelled':
          return {
            text: 'Cancelled',
            bg: '#FEE2E2',
            color: '#991B1B',
            icon: <FiX className="mr-1" />
          };
        case 'returned':
          return {
            text: 'Returned',
            bg: '#FEE2E2',
            color: '#991B1B',
            icon: <FiRotateCcw className="mr-1" />
          };
        case 'refunded':
          return {
            text: 'Refunded',
            bg: '#FEE2E2',
            color: '#991B1B',
            icon: <FiDollarSign className="mr-1" />
          };
        default:
          return {
            text: 'Unknown',
            bg: '#E5E7EB',
            color: '#1F2937',
            icon: <FiShoppingBag className="mr-1" />
          };
      }
    }
    
    // Fallback to u_stage if u_choice not set
    switch (stage) {
      case 'created':
        return {
          text: 'Order Created',
          bg: '#E0F2FE',
          color: '#0369A1',
          icon: <FiShoppingBag className="mr-1" />
        };
      case 'quotation_sent':
        return {
          text: 'Quotation Sent',
          bg: '#BFDBFE',
          color: '#1E40AF',
          icon: <FiMail className="mr-1" />
        };
      case 'order_confirmed':
        return {
          text: 'Order Confirmed',
          bg: '#A7F3D0',
          color: '#065F46',
          icon: <FiThumbsUp className="mr-1" />
        };
      case 'processing':
        return {
          text: 'Processing',
          bg: '#FDE68A',
          color: '#92400E',
          icon: <FiClock className="mr-1" />
        };
      case 'closed_won':
        return {
          text: 'Completed',
          bg: '#D1FAE5',
          color: '#065F46',
          icon: <FiCheck className="mr-1" />
        };
      case 'closed_lost':
        return {
          text: 'Cancelled',
          bg: '#FEE2E2',
          color: '#991B1B',
          icon: <FiThumbsDown className="mr-1" />
        };
      default:
        return {
          text: 'Unknown',
          bg: '#E5E7EB',
          color: '#1F2937',
          icon: <FiShoppingBag className="mr-1" />
        };
    }
  };

  const handleStatusAction = async (orderId, action) => {
    try {
      let updateData = {};
      
      switch (action) {
        case 'accept_quotation':
          updateData = {
            u_choice: 'confirmed',
            u_stage: 'order_confirmed'
          };
          break;
        case 'mark_delivered':
          updateData = {
            u_choice: 'delivered',
            u_stage: 'closed_won'
          };
          break;
        case 'confirm_completion':
          updateData = {
            u_choice: 'completed',
            u_stage: 'closed_won'
          };
          break;
        case 'cancel_order':
          updateData = {
            u_choice: 'cancelled',
            u_stage: 'closed_lost'
          };
          break;
        default:
          return;
      }

      const response = await fetch(`http://localhost:3000/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        setSuccessMessage(`Order ${action.replace('_', ' ')} successful!`);
        setTimeout(() => setSuccessMessage(''), 5000);
        fetchOrders();
      }
    } catch (err) {
      console.error(`Error performing ${action}:`, err);
    }
  };

  const toggleExpandOrder = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: colors.background }}>
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-r-2 border-transparent" 
               style={{ borderTopColor: colors.primary, borderBottomColor: colors.primary }}></div>
          <p className="mt-4" style={{ color: colors.textLight }}>Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div className="flex items-center mb-4 md:mb-0">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center mr-6 hover:opacity-80 transition-opacity"
              style={{ color: colors.primary }}
            >
              <FiArrowLeft className="mr-1" /> Back
            </button>
            <h1 className="text-2xl md:text-3xl font-bold" style={{ color: colors.primaryDark }}>
              <FiShoppingBag className="inline mr-3" />
              All Products
            </h1>
          </div>
          
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 text-sm rounded-md flex items-center border hover:opacity-90 transition-opacity"
            style={{ 
              borderColor: colors.primaryLight,
              color: colors.primaryDark
            }}
          >
            <FiHome className="mr-2" />
            Continue Shopping
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b" style={{ borderColor: colors.border }}>
          <div className="flex space-x-4 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedTab('pending')}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 ${selectedTab === 'pending' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Pending
            </button>
            <button
              onClick={() => setSelectedTab('quoted')}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 ${selectedTab === 'quoted' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Quotations
            </button>
            <button
              onClick={() => setSelectedTab('confirmed')}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 ${selectedTab === 'confirmed' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Confirmed
            </button>
            <button
              onClick={() => setSelectedTab('processing')}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 ${selectedTab === 'processing' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Processing
            </button>
            <button
              onClick={() => setSelectedTab('completed')}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 ${selectedTab === 'completed' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Completed
            </button>
            <button
              onClick={() => setSelectedTab('cancelled')}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 ${selectedTab === 'cancelled' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Cancelled
            </button>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div 
            className="rounded-xl shadow-sm p-8 text-center max-w-md mx-auto"
            style={{ backgroundColor: colors.cardBg }}
          >
            <div 
              className="mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: '#FEEBC8' }}
            >
              <FiShoppingBag className="text-3xl" style={{ color: colors.primary }} />
            </div>
            <h2 className="text-xl font-semibold mb-2" style={{ color: colors.textDark }}>
              No orders found
            </h2>
            <p className="mb-6" style={{ color: colors.textLight }}>
              {selectedTab === 'pending' 
                ? "You don't have any pending orders right now." 
                : selectedTab === 'quoted'
                ? "No quotations awaiting your approval."
                : selectedTab === 'confirmed'
                ? "No confirmed orders at this time."
                : selectedTab === 'processing'
                ? "No orders in processing/shipping status."
                : selectedTab === 'completed'
                ? "No completed orders yet."
                : "No cancelled orders."}
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 text-white rounded-lg hover:opacity-90 transition-opacity w-full"
              style={{ backgroundColor: colors.primary }}
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const status = getStatusBadge(order);
              return (
                <motion.div 
                  key={order.sys_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg shadow-sm overflow-hidden"
                  style={{ 
                    backgroundColor: colors.cardBg,
                    border: `1px solid ${colors.border}`
                  }}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start">
                        {order.product?.image && (
                          <div 
                            className="flex-shrink-0 h-16 w-16 rounded-md overflow-hidden mr-4"
                            style={{ border: `1px solid ${colors.border}` }}
                          >
                            <img
                              className="h-full w-full object-cover"
                              src={order.product.image}
                              alt={order.product.name}
                            />
                          </div>
                        )}
                        <div>
                          <div className="flex items-center">
                            <h3 className="font-medium mr-2" style={{ color: colors.textDark }}>
                              {order.product?.name || 'N/A'}
                            </h3>
                            <span 
                              className="text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center"
                              style={{ backgroundColor: status.bg, color: status.color }}
                            >
                              {status.icon}
                              {status.text}
                            </span>
                          </div>
                          <p className="text-sm" style={{ color: colors.textLight }}>
                            {order.product?.category || 'No category'}
                          </p>
                          <div className="mt-1">
                            <span className="font-medium mr-4" style={{ color: colors.primary }}>
                              ${order.product?.price?.toFixed(2) || '0.00'}
                            </span>
                            <span className="text-sm" style={{ color: colors.textLight }}>
                              Qty: {order.u_quantity || 1}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <span className="font-medium mr-4" style={{ color: colors.primary }}>
                          ${(order.product?.price * (order.u_quantity || 1)).toFixed(2) || '0.00'}
                        </span>
                        <button
                          onClick={() => toggleExpandOrder(order.sys_id)}
                          style={{ color: colors.textLight }}
                          className="hover:text-amber-700 p-1 transition-colors"
                        >
                          {expandedOrder === order.sys_id ? (
                            <FiChevronUp className="h-5 w-5" />
                          ) : (
                            <FiChevronDown className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <AnimatePresence>
                    {expandedOrder === order.sys_id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-4 py-4"
                        style={{ borderTop: `1px solid ${colors.border}` }}
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="text-sm font-medium mb-3 flex items-center" style={{ color: colors.textDark }}>
                              <FiFileText className="mr-2" /> Order Details
                            </h4>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span style={{ color: colors.textLight }}>Order ID:</span>
                                <span style={{ color: colors.textDark }}>{order.sys_id}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span style={{ color: colors.textLight }}>Date:</span>
                                <span style={{ color: colors.textDark }}>
                                  {new Date(order.sys_created_on).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span style={{ color: colors.textLight }}>Status:</span>
                                <span style={{ color: colors.textDark }}>
                                  {status.text}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span style={{ color: colors.textLight }}>Stage:</span>
                                <span style={{ color: colors.textDark }}>
                                  {order.u_stage || 'N/A'}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm font-medium">
                                <span style={{ color: colors.textLight }}>Total:</span>
                                <span style={{ color: colors.primaryDark }}>
                                  ${(order.product?.price * (order.u_quantity || 1)).toFixed(2) || '0.00'}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium mb-3 flex items-center" style={{ color: colors.textDark }}>
                              <FiTruck className="mr-2" /> Shipping Information
                            </h4>
                            <div className="space-y-2">
                              <div className="text-sm">
                                <p style={{ color: colors.textLight }}>Address:</p>
                                <p style={{ color: colors.textDark }}>
                                  {order.u_street_address || 'N/A'}<br />
                                  {order.u_city || ''} {order.u_postal_code || ''}<br />
                                  {order.u_country || ''}
                                </p>
                              </div>
                              {order.u_tracking_number && (
                                <div className="text-sm">
                                  <p style={{ color: colors.textLight }}>Tracking Number:</p>
                                  <p style={{ color: colors.textDark }}>{order.u_tracking_number}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Action buttons based on status */}
                        <div className="mt-6 flex justify-end space-x-3">
                          {(order.u_choice === 'quoted' || order.u_stage === 'quotation_sent') && (
                            <button
                              onClick={() => handleStatusAction(order.sys_id, 'accept_quotation')}
                              className="px-4 py-2 text-sm rounded-md flex items-center hover:opacity-90 transition-opacity"
                              style={{ 
                                backgroundColor: colors.success,
                                color: 'white'
                              }}
                            >
                              <FiCheck className="mr-2" />
                              Accept Quotation
                            </button>
                          )}
                          
                          {(order.u_choice === 'shipped' || order.u_stage === 'processing') && (
                            <button
                              onClick={() => handleStatusAction(order.sys_id, 'mark_delivered')}
                              className="px-4 py-2 text-sm rounded-md flex items-center hover:opacity-90 transition-opacity"
                              style={{ 
                                backgroundColor: colors.success,
                                color: 'white'
                              }}
                            >
                              <FiCheck className="mr-2" />
                              Mark as Delivered
                            </button>
                          )}
                          
                          {(order.u_choice === 'delivered') && (
                            <button
                              onClick={() => handleStatusAction(order.sys_id, 'confirm_completion')}
                              className="px-4 py-2 text-sm rounded-md flex items-center hover:opacity-90 transition-opacity"
                              style={{ 
                                backgroundColor: colors.success,
                                color: 'white'
                              }}
                            >
                              <FiCheck className="mr-2" />
                              Confirm Completion
                            </button>
                          )}
                          
                          {(order.u_choice === 'pending' || order.u_choice === 'quoted' || order.u_choice === 'confirmed') && (
                            <button
                              onClick={() => handleStatusAction(order.sys_id, 'cancel_order')}
                              className="px-4 py-2 text-sm rounded-md flex items-center hover:opacity-90 transition-opacity"
                              style={{ 
                                backgroundColor: colors.error,
                                color: 'white'
                              }}
                            >
                              <FiX className="mr-2" />
                              Cancel Order
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Success Notification */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg flex items-center"
              style={{ 
                backgroundColor: colors.primaryDark,
                color: 'white',
                zIndex: 1000
              }}
            >
              <FiCheck className="mr-2 text-xl" />
              {successMessage}
              <button 
                onClick={() => setSuccessMessage('')}
                className="ml-4 text-white hover:text-amber-200 transition-colors"
              >
                <FiX />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ClientDashboard;