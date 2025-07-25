import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiShoppingBag, 
  FiCheck, 
  FiX,
  FiTruck,
  FiPackage,
  FiClock,
  FiArrowLeft,
  FiCalendar,
  FiMapPin,
  FiBox,
  FiUserCheck,
  FiAlertCircle,
  FiLoader,
  FiMail,
  FiThumbsUp,
  FiThumbsDown,
  FiRotateCcw,
  FiDollarSign
} from 'react-icons/fi';
import { motion } from 'framer-motion';

const ClientOrderTracking = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // Enhanced color palette with status colors
  const colors = {
    primary: {
      50: '#FFFBEB',
      100: '#FEF3C7',
      200: '#FDE68A',
      300: '#FCD34D',
      400: '#FBBF24',
      500: '#F59E0B',
      600: '#D97706',
      700: '#B45309',
      800: '#92400E',
      900: '#78350F'
    },
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827'
    },
    success: '#10B981',
    error: '#EF4444',
    info: '#3B82F6',
    warning: '#F59E0B'
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

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const user = getCurrentUser();
      setCurrentUser(user);
      
      const response = await fetch('http://localhost:3000/orders');
      if (!response.ok) throw new Error('Failed to fetch orders');
      const allOrders = await response.json();

      // Filter orders for current user and fetch product details
      const userOrders = await Promise.all(
        allOrders
          .filter(order => order.u_user?.value === user.sys_id)
          .map(async order => {
            if (order.u_product_offerings?.value) {
              try {
                const productRes = await fetch(`http://localhost:3000/product-offerings/${order.u_product_offerings.value}`);
                if (productRes.ok) {
                  const product = await productRes.json();
                  return { 
                    ...order, 
                    product,
                    u_stage: order.u_stage || 'created' // Default stage if empty
                  };
                }
              } catch (e) {
                console.error('Failed to fetch product', e);
              }
            }
            return {
              ...order,
              u_stage: order.u_stage || 'created' // Default stage if empty
            };
          })
      );

      setOrders(userOrders);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusDetails = (order) => {
    // Enhanced status configuration that combines u_choice and u_stage
    const statusConfig = {
      pending: {
        icon: <FiClock size={18} />,
        color: colors.warning,
        text: 'Pending Review',
        description: 'Waiting for agent to review your order',
        canCancel: true,
        stage: 'created'
      },
      quoted: {
        icon: <FiMail size={18} />,
        color: colors.info,
        text: 'Quotation Sent',
        description: 'Commercial team has sent you a quotation',
        canCancel: true,
        stage: 'quotation-sent',
        canConfirm: true
      },
      confirmed: {
        icon: <FiThumbsUp size={18} />,
        color: colors.success,
        text: 'Order Confirmed',
        description: 'Your order is confirmed and being processed',
        canCancel: false,
        stage: 'order-confirmed'
      },
      shipped: {
        icon: <FiTruck size={18} />,
        color: colors.success,
        text: 'Shipped',
        description: 'Your order is on the way to you',
        canCancel: false,
        stage: 'processing'
      },
      delivered: {
        icon: <FiPackage size={18} />,
        color: colors.success,
        text: 'Delivered',
        description: 'Your order has been delivered',
        canCancel: false,
        stage: 'closed-won',
      },
      completed: {
        icon: <FiCheck size={18} />,
        color: colors.success,
        text: 'Completed',
        description: 'Order successfully completed',
        canCancel: false,
        stage: 'closed-won'
      },
      cancelled: {
        icon: <FiX size={18} />,
        color: colors.error,
        text: 'Cancelled',
        description: order.u_stage === 'closed-lost' ? 
          'Order was cancelled by the system' : 'You cancelled this order',
        canCancel: false,
        stage: 'closed-lost'
      },
      returned: {
        icon: <FiRotateCcw size={18} />,
        color: colors.error,
        text: 'Returned',
        description: 'Items have been returned',
        canCancel: false,
        stage: 'closed-lost'
      },
      refunded: {
        icon: <FiDollarSign size={18} />,
        color: colors.error,
        text: 'Refunded',
        description: 'Payment has been refunded',
        canCancel: false,
        stage: 'closed-lost'
      },
      default: {
        icon: <FiLoader size={18} />,
        color: colors.gray[500],
        text: order.u_choice || 'Processing',
        description: 'Your order is being processed',
        canCancel: true
      }
    };

    let status = statusConfig[order.u_choice] || statusConfig.default;
    
    if (!order.u_choice) {
      const stageBasedStatus = Object.values(statusConfig).find(
        config => config.stage === order.u_stage
      );
      if (stageBasedStatus) {
        status = stageBasedStatus;
      }
    }

    return { status };
  };

  const handleConfirmOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to confirm this order?')) {
      try {
        const response = await fetch(`http://localhost:3000/orders/${orderId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            u_choice: 'confirmed',
            u_stage: 'order-confirmed'
          }),
        });

        if (response.ok) {
          fetchOrders(); // Refresh the orders to show updated status
        } else {
          console.error('Failed to update order status');
        }
      } catch (err) {
        console.error('Error confirming order:', err);
      }
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
      try {
        const response = await fetch(`http://localhost:3000/orders/${orderId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            u_choice: 'cancelled',
            u_stage: 'closed-lost',
          }),
        });

        if (response.ok) {
          fetchOrders();
        }
      } catch (err) {
        console.error('Error cancelling order:', err);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'To be confirmed';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const OrderProgress = ({ order }) => {
    const { status } = getStatusDetails(order);
    
    const allStages = [
      { key: 'created', label: 'Order Created', icon: <FiShoppingBag size={16} /> },
      { key: 'qualification', label: 'Review', icon: <FiUserCheck size={16} /> },
      { key: 'quotation-sent', label: 'Quotation Sent', icon: <FiMail size={16} /> },
      { key: 'order-confirmed', label: 'Processing', icon: <FiPackage size={16} /> },
      { key: 'closed-won', label: 'Completed', icon: <FiCheck size={16} /> }
    ];

    let currentStageIndex = allStages.findIndex(stage => stage.key === order.u_stage);
    if (currentStageIndex === -1) currentStageIndex = 0;
    
    const isCancelled = order.u_choice === 'cancelled' || 
                       order.u_choice === 'returned' || 
                       order.u_choice === 'refunded' ||
                       order.u_stage === 'closed-lost';

    const stageDescriptions = [
      'Order received and being processed',
      'Commercial agent is reviewing your order',
      'Quotation has been prepared and sent',
      'Your items are being prepared for shipping',
      'Order has been successfully completed'
    ];

    return (
      <div className="relative pt-6 pb-8">
        <div className="absolute top-8 left-4 right-4 h-2 bg-gray-200 z-0 rounded-full">
          {!isCancelled && (
            <div 
              className="h-2 bg-amber-500 rounded-full transition-all duration-500"
              style={{ 
                width: `${(currentStageIndex / (allStages.length - 1)) * 100}%`,
                boxShadow: `0 0 8px ${colors.primary[300]}`
              }}
            />
          )}
        </div>

        <div className="relative z-10 grid grid-cols-5">
          {allStages.map((stage, index) => {
            const isCompleted = index < currentStageIndex;
            const isCurrent = index === currentStageIndex;
            const isActive = isCompleted || isCurrent;

            return (
              <div key={stage.key} className="flex flex-col items-center">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all ${
                    isCurrent ? 'ring-4 scale-110' : ''
                  }`}
                  style={{
                    backgroundColor: isCancelled ? colors.gray[200] : 
                                    isActive ? colors.primary[500] : colors.gray[200],
                    color: isCancelled ? colors.gray[500] : 
                           isActive ? 'white' : colors.gray[500],
                    border: isCancelled ? `2px solid ${colors.gray[300]}` : 'none',
                    ringColor: `${colors.primary[300]}80`
                  }}
                >
                  {isCompleted ? <FiCheck size={16} /> : stage.icon}
                </div>
                <div className="text-center px-1">
                  <p 
                    className={`text-xs font-medium ${
                      isCurrent ? 'text-gray-900 font-bold' : 'text-gray-500'
                    }`}
                    style={isCancelled ? { color: colors.gray[400] } : {}}
                  >
                    {stage.label}
                  </p>
                  {isCurrent && !isCancelled && (
                    <p className="text-xs mt-1" style={{ color: colors.primary[600] }}>
                      {stageDescriptions[index]}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: colors.gray[50] }}>
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="rounded-full h-12 w-12 border-t-2 border-b-2 mx-auto" 
            style={{ borderColor: colors.primary[500] }}
          />
          <p className="mt-4 text-sm" style={{ color: colors.gray[600] }}>Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.gray[50] }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="flex items-center mb-4 md:mb-0">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center mr-6 hover:opacity-80 transition-opacity group"
              style={{ color: colors.primary[700] }}
            >
              <motion.div
                whileHover={{ x: -3 }}
                className="flex items-center"
              >
                <FiArrowLeft className="mr-1 group-hover:text-amber-600 transition-colors" />
                <span className="group-hover:text-amber-600 transition-colors">Back</span>
              </motion.div>
            </button>
            <h1 className="text-2xl md:text-3xl font-bold" style={{ color: colors.gray[900] }}>
              <FiShoppingBag className="inline mr-3" style={{ color: colors.primary[500] }} />
              My Orders
            </h1>
          </div>
          
          {orders.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/')}
              className="px-4 py-2 text-sm rounded-md flex items-center border hover:shadow-sm transition-all"
              style={{ 
                borderColor: colors.primary[300],
                color: colors.primary[700],
                backgroundColor: colors.primary[50]
              }}
            >
              <FiShoppingBag className="mr-2" />
              Continue Shopping
            </motion.button>
          )}
        </div>

        {orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm p-8 text-center max-w-md mx-auto border"
            style={{ borderColor: colors.gray[200] }}
          >
            <div 
              className="mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: colors.primary[100] }}
            >
              <FiShoppingBag size={32} style={{ color: colors.primary[500] }} />
            </div>
            <h2 className="text-xl font-semibold mb-2" style={{ color: colors.gray[900] }}>
              No Orders Found
            </h2>
            <p className="mb-6" style={{ color: colors.gray[500] }}>
              You haven't placed any orders yet.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/')}
              className="px-6 py-3 text-white rounded-lg hover:shadow-md transition-all w-full"
              style={{ 
                backgroundColor: colors.primary[500],
                boxShadow: `0 4px 6px -1px ${colors.primary[200]}, 0 2px 4px -1px ${colors.primary[200]}`
              }}
            >
              Browse Products
            </motion.button>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const { status } = getStatusDetails(order);
              const showConfirmButton = order.u_stage === 'quotation-sent';

              return (
                <motion.div 
                  key={order.sys_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -2 }}
                  className="bg-white rounded-xl shadow-sm overflow-hidden border transition-all hover:shadow-lg"
                  style={{ 
                    borderColor: colors.gray[200],
                    boxShadow: `0 2px 4px ${colors.gray[100]}`
                  }}
                >
                  <div className="p-6">
                    {/* Order header */}
                    <div className="flex flex-col md:flex-row md:items-start gap-4 mb-6">
                      {/* Product image */}
                      {order.product?.u_image_url ? (
                        <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border flex items-center justify-center bg-gray-100"
                             style={{ borderColor: colors.gray[200] }}>
                          <img
                            src={order.product.u_image_url}
                            alt={order.product.u_name || 'Product image'}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border flex items-center justify-center bg-gray-100"
                             style={{ borderColor: colors.gray[200] }}>
                          <FiBox size={32} style={{ color: colors.gray[400] }} />
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                          <div>
                            <h3 className="text-lg font-semibold" style={{ color: colors.gray[900] }}>
                              {order.product?.u_name || 'Order'} #{order.u_number || order.sys_id.slice(-6).toUpperCase()}
                            </h3>
                            <p className="text-sm" style={{ color: colors.gray[500] }}>
                              Placed on {formatDate(order.u_order_date)}
                            </p>
                          </div>
                          
                          <div className="mt-2 md:mt-0 flex items-center space-x-3">
                      
                            
                            {/* Show confirm button only for quotation-sent stage */}
                            {showConfirmButton && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleConfirmOrder(order.sys_id)}
                                className="px-3 py-1 text-sm rounded-md flex items-center hover:bg-green-50 transition-colors"
                                style={{ 
                                  color: colors.success,
                                  border: `1px solid ${colors.success}30`
                                }}
                              >
                                <FiThumbsUp className="mr-1" />
                                Confirm Order
                              </motion.button>
                            )}
                            
                            {/* Show cancel button for cancellable orders */}
                            {status.canCancel && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleCancelOrder(order.sys_id)}
                                className="px-3 py-1 text-sm rounded-md flex items-center hover:bg-red-50 transition-colors"
                                style={{ 
                                  color: colors.error,
                                  border: `1px solid ${colors.error}30`
                                }}
                              >
                                <FiX className="mr-1" />
                                Cancel
                              </motion.button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Progress stepper */}
                    <OrderProgress order={order} />

                    {/* Order details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                      {/* Delivery information */}
                      <div className="bg-gray-50 rounded-lg p-4 border" style={{ borderColor: colors.gray[200] }}>
                        <h4 className="text-sm font-medium mb-3 flex items-center" style={{ color: colors.gray[700] }}>
                          <FiMapPin className="mr-2" style={{ color: colors.primary[500] }} />
                          Delivery Information
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs mb-1" style={{ color: colors.gray[500] }}>Expected Delivery</p>
                            <p className="text-sm font-medium" style={{ color: colors.gray[800] }}>
                              {order.u_expected_delivery ? 
                                formatDate(order.u_expected_delivery) : 'To be confirmed'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs mb-1" style={{ color: colors.gray[500] }}>Shipping Address</p>
                            <p className="text-sm" style={{ color: colors.gray[800] }}>
                              {order.u_street_address}, {order.u_city}, {order.u_postal_code}, {order.u_country}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Product information */}
                      <div className="bg-gray-50 rounded-lg p-4 border" style={{ borderColor: colors.gray[200] }}>
                        <h4 className="text-sm font-medium mb-3 flex items-center" style={{ color: colors.gray[700] }}>
                          <FiBox className="mr-2" style={{ color: colors.primary[500] }} />
                          Order Details
                        </h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <div>
                              <p className="text-xs mb-1" style={{ color: colors.gray[500] }}>Quantity</p>
                              <p className="text-sm font-medium" style={{ color: colors.gray[800] }}>
                                {order.u_quantity}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs mb-1" style={{ color: colors.gray[500] }}>Price Each</p>
                              <p className="text-sm font-medium" style={{ color: colors.gray[800] }}>
                                ${order.product?.u_price ? parseFloat(order.product.u_price).toFixed(2) : '0.00'}
                              </p>
                            </div>
                          </div>
                          <div className="pt-3 border-t" style={{ borderColor: colors.gray[200] }}>
                            <p className="text-xs mb-1" style={{ color: colors.gray[500] }}>Total Amount</p>
                            <p className="text-lg font-bold" style={{ color: colors.primary[600] }}>
                              ${order.u_total_price || '0.00'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                  
                    {/* Confirmation banner - shown after user confirms */}
                    {order.u_stage === 'order-confirmed' && (
                      <div 
                        className="mt-4 p-3 rounded-lg flex items-start"
                        style={{ 
                          backgroundColor: `${colors.success}10`, 
                          border: `1px solid ${colors.success}20`
                        }}
                      >
                        <FiThumbsUp className="flex-shrink-0 mt-0.5 mr-2" style={{ color: colors.success }} />
                        <div>
                          <p className="text-sm font-medium" style={{ color: colors.gray[800] }}>
                            Your order is confirmed
                          </p>
                          <p className="text-xs" style={{ color: colors.gray[600] }}>
                            Thank you for your confirmation. We're now processing your order.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Additional status info */}
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="text-xs" style={{ color: colors.gray[500] }}>Status Code</p>
                        <p className="text-sm font-medium" style={{ color: colors.gray[800] }}>
                          {order.u_choice || 'pending'}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="text-xs" style={{ color: colors.gray[500] }}>Workflow Stage</p>
                        <p className="text-sm font-medium" style={{ color: colors.gray[800] }}>
                          {order.u_stage || 'created'}
                        </p>
                      </div>
                    </div>

                    {/* Cancellation notice */}
                    {(order.u_choice === 'cancelled' || order.u_choice === 'returned' || order.u_choice === 'refunded' || order.u_stage === 'closed-lost') && (
                      <div 
                        className="mt-4 p-3 rounded-lg flex items-start"
                        style={{ backgroundColor: `${colors.error}10`, border: `1px solid ${colors.error}20` }}
                      >
                        <FiAlertCircle className="flex-shrink-0 mt-0.5 mr-2" style={{ color: colors.error }} />
                        <div>
                          <p className="text-sm font-medium" style={{ color: colors.gray[800] }}>
                            Order {status.text}
                          </p>
                          <p className="text-xs" style={{ color: colors.gray[600] }}>
                            {status.description}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientOrderTracking;