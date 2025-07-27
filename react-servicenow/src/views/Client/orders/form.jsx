import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Spin, Tabs, Table, Descriptions } from 'antd';
import { getOneOrder } from './orderSlice';

// StatusCell component for consistent status rendering
const StatusCell = ({ status }) => {
  const statusColors = {
    new: { dot: 'bg-blue-500', text: 'text-blue-700' },
    in_progress: { dot: 'bg-orange-500', text: 'text-orange-700' },
    completed: { dot: 'bg-green-500', text: 'text-green-700' },
    cancelled: { dot: 'bg-red-500', text: 'text-red-700' },
  };

  const colors = statusColors[status?.toLowerCase()] || statusColors.new;
  const displayText = status ?
    status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : '';

  return (
    <div className="flex items-center">
      <span className={`h-2 w-2 rounded-full mr-2 ${colors.dot}`}></span>
      <span className={`text-xs ${colors.text}`}>
        {displayText}
      </span>
    </div>
  );
};

function OrderViewPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const [activeTab, setActiveTab] = useState('1');
  const [initialized, setInitialized] = useState(false);

  // Select order data from Redux store
  const { currentOrder, loading } = useSelector(
    state => state.order
  );

  // Fetch order details
  useEffect(() => {
    if (isEditMode) {
      dispatch(getOneOrder(id)).then(() => setInitialized(true));
    } else {
      setInitialized(true);
    }
  }, [id, isEditMode, dispatch]);

  // Initialize form with proper default values
  const initialValues = {
    number: '',
    order_date: '',
    status: 'new',
    description: '',
    total_price: 0,
    currency: 'USD'
  };

  // Merge with currentOrder if available
  if (isEditMode && currentOrder && !loading) {
    initialValues.number = currentOrder.number || '';
    initialValues.order_date = currentOrder.order_date || '';
    initialValues.status = currentOrder.status || 'new';
    initialValues.description = currentOrder.description || '';
    initialValues.total_price = currentOrder.total_price || 0;
    initialValues.currency = currentOrder.currency || 'USD';
  }

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
  });

  const handleCancel = () => navigate('/client/order');

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const handleLineItemClick = (id) => navigate(`/client/order/view/${id}`);

  // Tab items configuration
  const tabItems = [
  {
    key: '1',
    label: (
      <span className="flex items-center">
        <i className="ri-list-check-2 text-lg mr-2"></i>
        Line Items
      </span>
    ),
    children: (
      <div className="p-4">
        <Table
          columns={[
            {
              title: 'Item Number',
              dataIndex: 'number',
              key: 'number',
              render: (text) => ( // Removed record parameter since we don't need it
                <span className="text-gray-800 font-medium"> {/* Removed cursor-pointer and hover styles */}
                  {text}
                </span>
              )
            },
            {
              title: 'Description',
              dataIndex: 'description',
              key: 'description',
            },
            {
              title: 'Status',
              dataIndex: 'status',
              key: 'status',
              render: (status) => <StatusCell status={status} />,
            },
            {
              title: 'Price',
              dataIndex: 'price',
              key: 'price',
              render: (price) => `${currentOrder?.currency || 'USD'} ${price}`
            },
            {
              title: 'Quantity',
              dataIndex: 'quantity',
              key: 'quantity',
            }
          ]}
          dataSource={currentOrder?.lineItems || []}
          pagination={{ pageSize: 5 }}
          rowKey="_id"
          locale={{
            emptyText: (
              <div className="py-8 text-center">
                <i className="ri-information-line mx-auto text-3xl text-gray-400 mb-3"></i>
                <p className="text-gray-500">No line items found for this order.</p>
              </div>
            )
          }}
        />
      </div>
    ),
  },
  ];

  // Show spinner while loading
  if ((isEditMode && loading) || !initialized) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin
          size="large"
          tip="Loading order details..."
          indicator={<i className="ri-refresh-line animate-spin text-2xl"></i>}
        />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 h-full flex flex-col">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="flex flex-col md:flex-row px-6 py-2.5 bg-gray-200 justify-between items-start md:items-center gap-4">
          <div className="flex items-center">
            <button
              onClick={handleCancel}
              className="mr-3 text-cyan-700 hover:text-cyan-800 bg-white border border-cyan-700 hover:bg-cyan-50 w-10 h-10 flex justify-center items-center "
            >
              <i className="ri-arrow-left-s-line text-2xl"></i>
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-800">Order Details</h1>
              <p className="text-gray-600 text-md flex items-center gap-2">
                {isEditMode ? currentOrder?.number : 'New order'}
                {isEditMode && (
                  <span className="px-2 py-0.5 bg-cyan-100 text-cyan-800 text-xs font-medium rounded-md capitalize">
                    {currentOrder?.status?.split('_').join(' ')}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-grow overflow-y-auto">
        <div className="bg-white shadow-sm max-w-6xl mx-auto my-6">
          <div className="p-6">
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Order Number */}
                <div>
                  <label className="block font-medium mb-1 text-gray-700">
                    Order Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="number"
                    value={formik.values.number}
                    disabled={true}
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                  />
                </div>

                {/* Order Date */}
                <div>
                  <label className="block font-medium mb-1 text-gray-700">
                    Order Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="order_date"
                    value={formatDate(formik.values.order_date)}
                    disabled={true}
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                  />
                </div>

                {/* Total Price */}
                <div>
                  <label className="block font-medium mb-1 text-gray-700">
                    Total Price
                  </label>
                  <input
                    name="total_price"
                    value={`${formik.values.currency} ${formik.values.total_price}`}
                    disabled={true}
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block font-medium mb-1 text-gray-700">Status</label>
                  <div className="flex space-x-4">
                    {['new', 'in_progress', 'completed', 'cancelled'].map(status => (
                      <label
                        key={status}
                        className={`flex items-center px-4 py-2 border rounded-md cursor-not-allowed ${formik.values.status === status
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 bg-gray-100'}`}
                      >
                        <input
                          type="radio"
                          name="status"
                          value={status}
                          checked={formik.values.status === status}
                          disabled={true}
                          className="mr-2"
                        />
                        <span className="capitalize">{status.split('_').join(' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-medium mb-1 text-gray-700">Description</label>
                <textarea
                  name="description"
                  value={formik.values.description}
                  rows="4"
                  disabled={true}
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
              </div>
            </form>
          </div>
        </div>

        {/* Tabs Section */}
        {isEditMode && currentOrder && (
          <div className='bg-white max-w-7xl mx-auto my-4'>
            <div className="p-3">
              <Tabs
                activeKey={activeTab}
                type="card"
                onChange={setActiveTab}
                items={tabItems}
                className="tabs"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderViewPage;