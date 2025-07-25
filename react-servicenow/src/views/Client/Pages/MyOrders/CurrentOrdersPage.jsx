import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiShoppingBag, 
  FiCheck, 
  FiArrowLeft,
  FiPlus,
  FiMinus,
  FiHome,
  FiTrash2,
  FiX,
  FiChevronDown,
  FiChevronUp,
  FiEdit,
  FiInfo,
  FiTruck,
  FiPackage,
  FiDollarSign
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const OrdersList = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [addresses, setAddresses] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [useSameAddress, setUseSameAddress] = useState(false);
  const [sameAddress, setSameAddress] = useState({
    street: '',
    city: '',
    postalCode: '',
    country: ''
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'confirmed', 'shipped', 'delivered'
  const [editMode, setEditMode] = useState(false);

  // Original color scheme
const colors = {
  primary: '#005baa',
  primaryLight: '#00c6fb',
  primaryDark: '#003e7d',
  background: '#f8fafc',
  cardBg: '#FFFFFF',
  textDark: '#1e293b',
  textLight: '#64748b',
  success: '#10b981',
  error: '#ef4444',
  border: '#e2e8f0'
};

// Status colors
const statusColors = {
  pending: '#f59e0b',
  quoted: '#3b82f6',
  confirmed: '#10b981',
  cancelled: '#ef4444',
  shipped: '#8b5cf6',
  delivered: '#10b981',
  returned: '#f97316',
  refunded: '#64748b',
  completed: '#10b981'
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

      const filtered = ordersWithProducts.filter(Boolean);
      const quantityState = {};
      const addressState = {};

      filtered.forEach((order) => {
        quantityState[order.sys_id] = parseInt(order.u_quantity) || 1;
        addressState[order.sys_id] = {
          street: order.u_street_address || '',
          city: order.u_city || '',
          postalCode: order.u_postal_code || '',
          country: order.u_country || ''
        };
      });

      setQuantities(quantityState);
      setAddresses(addressState);
      setOrders(filtered);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleQuantityChange = (sysId, value) => {
    const newValue = Math.max(1, parseInt(value) || 1);
    setQuantities((prev) => ({ ...prev, [sysId]: newValue }));
  };

  const handleAddressChange = (sysId, field, value) => {
    setAddresses((prev) => ({
      ...prev,
      [sysId]: {
        ...prev[sysId],
        [field]: value
      }
    }));
  };

  const handleSameAddressChange = (field, value) => {
    setSameAddress(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateOrderTotal = (price, quantity) => {
    return (price * quantity).toFixed(2);
  };

  const toggleOrderSelection = (sysId) => {
    setSelectedOrders(prev => 
      prev.includes(sysId) 
        ? prev.filter(id => id !== sysId) 
        : [...prev, sysId]
    );
  };

  const selectAllOrders = () => {
    setSelectedOrders(prev => 
      prev.length === orders.length ? [] : orders.map(o => o.sys_id)
    );
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      const response = await fetch(`http://localhost:3000/orders/${orderId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setOrders(prev => prev.filter(order => order.sys_id !== orderId));
        setSelectedOrders(prev => prev.filter(id => id !== orderId));
      }
    } catch (err) {
      console.error('Error deleting order:', err);
    }
  };

  const handleCreateOrders = async () => {
    try {
      setLoading(true);
      
      const ordersToUpdate = selectedOrders.length > 0 
        ? orders.filter(order => selectedOrders.includes(order.sys_id))
        : orders;

      for (const order of ordersToUpdate) {
        const addressToUse = useSameAddress ? sameAddress : addresses[order.sys_id];
        
        const updatedOrder = {
          u_quantity: quantities[order.sys_id],
          u_street_address: addressToUse.street,
          u_city: addressToUse.city,
          u_postal_code: addressToUse.postalCode,
          u_country: addressToUse.country,
          u_total_price: calculateOrderTotal(order.product?.price || 0, quantities[order.sys_id]),
          u_choice: 'pending', // Updated to 'pending' from 'created'
          u_stage: 'created'  // Added stage
        };

        const response = await fetch(`http://localhost:3000/orders/${order.sys_id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedOrder),
        });

        if (!response.ok) {
          throw new Error(`Failed to update order ${order.sys_id}`);
        }
      }

      setSuccessMessage(`${ordersToUpdate.length} order(s) submitted successfully!`);
      setTimeout(() => setSuccessMessage(''), 5000);
      fetchOrders();
      setSelectedOrders([]);
    } catch (err) {
      console.error('Error creating orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      const updatedOrder = {
        u_choice: 'cancelled',
        u_stage: 'closed_lost'
      };

      const response = await fetch(`http://localhost:3000/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedOrder),
      });

      if (response.ok) {
        setSuccessMessage('Order cancelled successfully!');
        setTimeout(() => setSuccessMessage(''), 5000);
        fetchOrders();
      }
    } catch (err) {
      console.error('Error cancelling order:', err);
    }
  };

  const calculateGrandTotal = () => {
    return orders
      .filter(order => selectedOrders.includes(order.sys_id))
      .reduce((total, order) => {
        return total + (order.product?.price || 0) * quantities[order.sys_id];
      }, 0)
      .toFixed(2);
  };

  const toggleExpandOrder = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const filteredOrders = () => {
    if (filter === 'all') return orders;
    return orders.filter(order => order.u_choice === filter);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'shipped':
        return <FiTruck className="mr-1" />;
      case 'delivered':
        return <FiPackage className="mr-1" />;
      case 'confirmed':
        return <FiCheck className="mr-1" />;
      case 'cancelled':
        return <FiX className="mr-1" />;
      case 'refunded':
        return <FiDollarSign className="mr-1" />;
      default:
        return <FiInfo className="mr-1" />;
    }
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
              My Orders
            </h1>
          </div>
          
          {orders.length > 0 && (
            <div className="flex items-center">
              <span className="text-sm mr-3" style={{ color: colors.textLight }}>
                {filteredOrders().length} {filteredOrders().length === 1 ? 'item' : 'items'}
              </span>
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
          )}
        </div>

        {/* Filter Controls */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-sm rounded-full border ${filter === 'all' ? 'bg-amber-100 border-amber-500' : 'border-gray-300'}`}
            style={{ color: filter === 'all' ? colors.primaryDark : colors.textLight }}
          >
            All Orders
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1 text-sm rounded-full border ${filter === 'pending' ? 'bg-amber-100 border-amber-500' : 'border-gray-300'}`}
            style={{ color: filter === 'pending' ? colors.primaryDark : colors.textLight }}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('confirmed')}
            className={`px-3 py-1 text-sm rounded-full border ${filter === 'confirmed' ? 'bg-green-100 border-green-500' : 'border-gray-300'}`}
            style={{ color: filter === 'confirmed' ? colors.primaryDark : colors.textLight }}
          >
            Confirmed
          </button>
          <button
            onClick={() => setFilter('shipped')}
            className={`px-3 py-1 text-sm rounded-full border ${filter === 'shipped' ? 'bg-purple-100 border-purple-500' : 'border-gray-300'}`}
            style={{ color: filter === 'shipped' ? colors.primaryDark : colors.textLight }}
          >
            Shipped
          </button>
          <button
            onClick={() => setFilter('delivered')}
            className={`px-3 py-1 text-sm rounded-full border ${filter === 'delivered' ? 'bg-green-100 border-green-500' : 'border-gray-300'}`}
            style={{ color: filter === 'delivered' ? colors.primaryDark : colors.textLight }}
          >
            Delivered
          </button>
          <button
            onClick={() => setFilter('cancelled')}
            className={`px-3 py-1 text-sm rounded-full border ${filter === 'cancelled' ? 'bg-red-100 border-red-500' : 'border-gray-300'}`}
            style={{ color: filter === 'cancelled' ? colors.primaryDark : colors.textLight }}
          >
            Cancelled
          </button>
        </div>

        {orders.length === 0 ? (
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
              Your cart is empty
            </h2>
            <p className="mb-6" style={{ color: colors.textLight }}>
              You don't have any orders right now.
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
          <>
            {/* Bulk Actions Panel */}
            {selectedOrders.length > 0 && filter === 'pending' && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg shadow-sm p-4 mb-6"
                style={{ 
                  backgroundColor: colors.cardBg,
                  border: `1px solid ${colors.primaryLight}`
                }}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center">
                    <span className="font-medium mr-4" style={{ color: colors.textDark }}>
                      {selectedOrders.length} {selectedOrders.length === 1 ? 'item' : 'items'} selected
                    </span>
                    <span className="text-lg font-semibold" style={{ color: colors.primary }}>
                      ${calculateGrandTotal()}
                    </span>
                  </div>
                  
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="sameAddressCheckbox"
                        checked={useSameAddress}
                        onChange={() => setUseSameAddress(!useSameAddress)}
                        className="h-4 w-4 rounded"
                        style={{ color: colors.primary }}
                      />
                      <label 
                        htmlFor="sameAddressCheckbox" 
                        className="ml-2 text-sm"
                        style={{ color: colors.textDark }}
                      >
                        Use same address for all
                      </label>
                    </div>
                    
                    <button
                      onClick={handleCreateOrders}
                      disabled={loading}
                      className={`px-4 py-2 rounded-md text-white flex items-center justify-center hover:opacity-90 transition-opacity ${
                        loading ? 'bg-amber-600' : 'bg-amber-700'
                      }`}
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        <>
                          <FiCheck className="mr-2" />
                          Submit Selected
                        </>
                      )}
                    </button>
                  </div>
                </div>
                
                {useSameAddress && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4"
                    style={{ borderTop: `1px solid ${colors.primaryLight}` }}
                  >
                    <h4 className="text-sm font-medium mb-3" style={{ color: colors.textDark }}>
                      Shipping Address
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm mb-1" style={{ color: colors.textLight }}>
                          Street Address
                        </label>
                        <input
                          type="text"
                          value={sameAddress.street}
                          onChange={(e) => handleSameAddressChange('street', e.target.value)}
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1"
                          style={{ 
                            borderColor: colors.border,
                            focusRingColor: colors.primaryLight
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm mb-1" style={{ color: colors.textLight }}>
                          City
                        </label>
                        <input
                          type="text"
                          value={sameAddress.city}
                          onChange={(e) => handleSameAddressChange('city', e.target.value)}
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1"
                          style={{ 
                            borderColor: colors.border,
                            focusRingColor: colors.primaryLight
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm mb-1" style={{ color: colors.textLight }}>
                          Postal Code
                        </label>
                        <input
                          type="text"
                          value={sameAddress.postalCode}
                          onChange={(e) => handleSameAddressChange('postalCode', e.target.value)}
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1"
                          style={{ 
                            borderColor: colors.border,
                            focusRingColor: colors.primaryLight
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm mb-1" style={{ color: colors.textLight }}>
                          Country
                        </label>
                        <input
                          type="text"
                          value={sameAddress.country}
                          onChange={(e) => handleSameAddressChange('country', e.target.value)}
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1"
                          style={{ 
                            borderColor: colors.border,
                            focusRingColor: colors.primaryLight
                          }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Orders List */}
            <div className="space-y-4">
              {filteredOrders().map((order) => (
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
                    <div className="flex items-start">
                      {filter === 'pending' && (
                        <div className="flex items-center mr-4">
                          <input
                            type="checkbox"
                            checked={selectedOrders.includes(order.sys_id)}
                            onChange={() => toggleOrderSelection(order.sys_id)}
                            className="h-5 w-5 rounded"
                            style={{ 
                              borderColor: colors.primaryLight,
                              color: colors.primary
                            }}
                          />
                        </div>
                      )}
                      
                      <div className="flex-1">
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
                                <h3 className="font-medium" style={{ color: colors.textDark }}>
                                  {order.product?.name || 'N/A'}
                                </h3>
                                {order.u_choice && (
                                  <span 
                                    className="ml-3 px-2 py-1 text-xs rounded-full flex items-center"
                                    style={{ 
                                      backgroundColor: `${statusColors[order.u_choice]}20`,
                                      color: statusColors[order.u_choice]
                                    }}
                                  >
                                    {getStatusIcon(order.u_choice)}
                                    {order.u_choice.charAt(0).toUpperCase() + order.u_choice.slice(1)}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm" style={{ color: colors.textLight }}>
                                {order.product?.category || 'No category'}
                              </p>
                              <div className="mt-1 flex items-center">
                                <span className="font-medium" style={{ color: colors.primary }}>
                                  ${order.product?.price?.toFixed(2) || '0.00'}
                                </span>
                                <span className="mx-2" style={{ color: colors.border }}>•</span>
                                <span className="text-sm" style={{ color: colors.textLight }}>
                                  Qty: {order.u_quantity || 1}
                                </span>
                                {filter === 'pending' && (
                                  <>
                                    <span className="mx-2" style={{ color: colors.border }}>•</span>
                                    <div 
                                      className="flex items-center border rounded-md overflow-hidden"
                                      style={{ borderColor: colors.border }}
                                    >
                                      <button
                                        onClick={() => handleQuantityChange(order.sys_id, quantities[order.sys_id] - 1)}
                                        className="px-2 py-1 flex items-center justify-center hover:bg-amber-50 transition-colors"
                                        style={{ color: colors.primary }}
                                      >
                                        <FiMinus className="h-4 w-4" />
                                      </button>
                                      
                                      <input
                                        type="number"
                                        min="1"
                                        value={quantities[order.sys_id] || 1}
                                        onChange={(e) => handleQuantityChange(order.sys_id, e.target.value)}
                                        className="w-12 text-center border-x py-1 focus:outline-none focus:ring-1"
                                        style={{ 
                                          borderColor: colors.border,
                                          focusRingColor: colors.primaryLight,
                                          backgroundColor: colors.background
                                        }}
                                      />
                                      
                                      <button
                                        onClick={() => handleQuantityChange(order.sys_id, quantities[order.sys_id] + 1)}
                                        className="px-2 py-1 flex items-center justify-center hover:bg-amber-50 transition-colors"
                                        style={{ color: colors.primary }}
                                      >
                                        <FiPlus className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            <span className="font-medium mr-4" style={{ color: colors.primary }}>
                              ${calculateOrderTotal(order.product?.price || 0, quantities[order.sys_id])}
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
                            <h4 className="text-sm font-medium mb-3" style={{ color: colors.textDark }}>
                              Order Details
                            </h4>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm" style={{ color: colors.textLight }}>Order ID:</span>
                                <span className="text-sm font-medium" style={{ color: colors.textDark }}>{order.sys_id}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm" style={{ color: colors.textLight }}>Date Created:</span>
                                <span className="text-sm font-medium" style={{ color: colors.textDark }}>
                                  {new Date(order.sys_created_at).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm" style={{ color: colors.textLight }}>Status:</span>
                                <span 
                                  className="text-sm font-medium px-2 py-1 rounded-full"
                                  style={{ 
                                    backgroundColor: `${statusColors[order.u_choice]}20`,
                                    color: statusColors[order.u_choice]
                                  }}
                                >
                                  {order.u_choice}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm" style={{ color: colors.textLight }}>Stage:</span>
                                <span className="text-sm font-medium" style={{ color: colors.textDark }}>
                                  {order.u_stage || 'N/A'}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium mb-3" style={{ color: colors.textDark }}>
                              Shipping Address
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm mb-1" style={{ color: colors.textLight }}>
                                  Street Address
                                </label>
                                <input
                                  type="text"
                                  value={useSameAddress && selectedOrders.includes(order.sys_id) ? sameAddress.street : (addresses[order.sys_id]?.street || '')}
                                  onChange={(e) => handleAddressChange(order.sys_id, 'street', e.target.value)}
                                  disabled={useSameAddress && selectedOrders.includes(order.sys_id) || order.u_choice !== 'pending'}
                                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 ${
                                    useSameAddress && selectedOrders.includes(order.sys_id) ? 'bg-amber-50' : ''
                                  } ${order.u_choice !== 'pending' ? 'bg-gray-100' : ''}`}
                                  style={{ 
                                    borderColor: colors.border,
                                    focusRingColor: colors.primaryLight
                                  }}
                                />
                              </div>
                              <div>
                                <label className="block text-sm mb-1" style={{ color: colors.textLight }}>
                                  City
                                </label>
                                <input
                                  type="text"
                                  value={useSameAddress && selectedOrders.includes(order.sys_id) ? sameAddress.city : (addresses[order.sys_id]?.city || '')}
                                  onChange={(e) => handleAddressChange(order.sys_id, 'city', e.target.value)}
                                  disabled={useSameAddress && selectedOrders.includes(order.sys_id) || order.u_choice !== 'pending'}
                                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 ${
                                    useSameAddress && selectedOrders.includes(order.sys_id) ? 'bg-amber-50' : ''
                                  } ${order.u_choice !== 'pending' ? 'bg-gray-100' : ''}`}
                                  style={{ 
                                    borderColor: colors.border,
                                    focusRingColor: colors.primaryLight
                                  }}
                                />
                              </div>
                              <div>
                                <label className="block text-sm mb-1" style={{ color: colors.textLight }}>
                                  Postal Code
                                </label>
                                <input
                                  type="text"
                                  value={useSameAddress && selectedOrders.includes(order.sys_id) ? sameAddress.postalCode : (addresses[order.sys_id]?.postalCode || '')}
                                  onChange={(e) => handleAddressChange(order.sys_id, 'postalCode', e.target.value)}
                                  disabled={useSameAddress && selectedOrders.includes(order.sys_id) || order.u_choice !== 'pending'}
                                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 ${
                                    useSameAddress && selectedOrders.includes(order.sys_id) ? 'bg-amber-50' : ''
                                  } ${order.u_choice !== 'pending' ? 'bg-gray-100' : ''}`}
                                  style={{ 
                                    borderColor: colors.border,
                                    focusRingColor: colors.primaryLight
                                  }}
                                />
                              </div>
                              <div>
                                <label className="block text-sm mb-1" style={{ color: colors.textLight }}>
                                  Country
                                </label>
                                <input
                                  type="text"
                                  value={useSameAddress && selectedOrders.includes(order.sys_id) ? sameAddress.country : (addresses[order.sys_id]?.country || '')}
                                  onChange={(e) => handleAddressChange(order.sys_id, 'country', e.target.value)}
                                  disabled={useSameAddress && selectedOrders.includes(order.sys_id) || order.u_choice !== 'pending'}
                                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 ${
                                    useSameAddress && selectedOrders.includes(order.sys_id) ? 'bg-amber-50' : ''
                                  } ${order.u_choice !== 'pending' ? 'bg-gray-100' : ''}`}
                                  style={{ 
                                    borderColor: colors.border,
                                    focusRingColor: colors.primaryLight
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-4 flex justify-between">
                          {order.u_choice === 'pending' && (
                            <button
                              onClick={() => handleDeleteOrder(order.sys_id)}
                              className="flex items-center text-sm font-medium hover:text-amber-800 transition-colors"
                              style={{ color: colors.primaryDark }}
                            >
                              <FiTrash2 className="mr-1" />
                              Remove Item
                            </button>
                          )}
                          
                          {order.u_choice === 'confirmed' && (
                            <button
                              onClick={() => handleCancelOrder(order.sys_id)}
                              className="flex items-center text-sm font-medium hover:text-red-700 transition-colors"
                              style={{ color: colors.error }}
                            >
                              <FiX className="mr-1" />
                              Cancel Order
                            </button>
                          )}
                          
                          <div className="text-sm" style={{ color: colors.textLight }}>
                            Last updated: {new Date(order.sys_updated_on).toLocaleString()}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>

            {/* Checkout Button (for all pending orders) */}
            {filter === 'pending' && orders.filter(o => o.u_choice === 'pending').length > 0 && selectedOrders.length === 0 && (
              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleCreateOrders}
                  disabled={loading}
                  className={`px-6 py-3 rounded-lg text-white shadow-md flex items-center hover:opacity-90 transition-opacity ${
                    loading ? 'bg-amber-600' : 'bg-amber-700'
                  }`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <FiCheck className="mr-2" />
                      Submit All Pending Orders
                    </>
                  )}
                </button>
              </div>
            )}
          </>
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

export default OrdersList;