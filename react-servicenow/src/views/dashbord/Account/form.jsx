import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { notification, Spin, Popconfirm, Tabs, Table } from 'antd';
import { getOneAccount } from '../../../features/servicenow/account/accountSlice';

// StatusCell component for consistent status rendering
const StatusCell = ({ status }) => {
  const statusColors = {
    active: { dot: 'bg-green-500', text: 'text-green-700' },
    inactive: { dot: 'bg-gray-400', text: 'text-gray-600' },
  };

  const colors = statusColors[status?.toLowerCase()] || statusColors.inactive;
  const displayText = status ?
    status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : '';

  return (
    <div className="flex items-center">
      <span className={`h-2 w-2 rounded-full mr-2 ${colors.dot}`}></span>
      <span className={`text-xs ${colors.text}`}>
        {displayText}
      </span>
    </div>
  );
};

function AccountFormPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const [activeTab, setActiveTab] = useState('1');
  const [initialized, setInitialized] = useState(false);

  // Select account data from Redux store
  const { currentAccount, loading, loadingAccount } = useSelector(
    state => state.account
  );

  // Fetch account details
  useEffect(() => {
    if (isEditMode) {
      dispatch(getOneAccount(id)).then(() => setInitialized(true));
    } else {
      setInitialized(true);
    }
  }, [id, isEditMode, dispatch]);

  // Initialize form with proper default values
  const initialValues = {
    name: '',
    email: '',
    phone: '',
    status: 'active',
    description: '',
  };

  // Merge with currentAccount.data if available
  if (isEditMode && currentAccount?.data && !loading) {
    initialValues.name = currentAccount.data.name || '';
    initialValues.email = currentAccount.data.email || '';
    initialValues.phone = currentAccount.data.phone || '';
    initialValues.status = currentAccount.data.status || 'active';
    initialValues.description = currentAccount.data.description || '';
  }

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
  });

  const handleCancel = () => navigate('/dashboard/account');

  const handleContactClick = (id) => {
    // Navigate to contact edit page
    console.log('Edit contact:', id);
  };

  const handleLocationClick = (id) => {
    // Navigate to location edit page
    console.log('Edit location:', id);
  };

  // Tab items configuration
  const tabItems = [
    {
      key: '1',
      label: (
        <span className="flex items-center">
          <i className="ri-contacts-line text-lg mr-2"></i>
          Contacts
        </span>
      ),
      children: (
        <div className="p-4">
          <Table
            columns={[
              {
                title: 'First Name',
                dataIndex: 'firstName',
                key: 'firstName',
              },
              {
                title: 'Last Name',
                dataIndex: 'lastName',
                key: 'lastName',
              },
              {
                title: 'Email',
                dataIndex: 'email',
                key: 'email',
              },
              {
                title: 'Phone',
                dataIndex: 'phone',
                key: 'phone',
              },
              {
                title: 'Primary',
                dataIndex: 'isPrimaryContact',
                key: 'isPrimaryContact',
                render: (isPrimary) => (
                  <span className={`px-2 py-1 rounded ${
                    isPrimary ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {isPrimary ? 'Yes' : 'No'}
                  </span>
                ),
              },
            ]}
            dataSource={currentAccount?.data?.contacts || []}
            pagination={{ pageSize: 5 }}
            rowKey="_id"
            locale={{
              emptyText: (
                <div className="py-8 text-center">
                  <i className="ri-information-line mx-auto text-3xl text-gray-400 mb-3"></i>
                  <p className="text-gray-500">No contacts associated with this account.</p>
                </div>
              )
            }}
          />
        </div>
      ),
    },
    {
      key: '2',
      label: (
        <span className="flex items-center">
          <i className="ri-map-pin-line text-lg mr-2"></i>
          Locations
        </span>
      ),
      children: (
        <div className="p-4">
          <Table
            columns={[
              {
                title: 'Name',
                dataIndex: 'name',
                key: 'name',
              },
              {
                title: 'City',
                dataIndex: 'city',
                key: 'city',
              },
              {
                title: 'State',
                dataIndex: 'state',
                key: 'state',
              },
              {
                title: 'Country',
                dataIndex: 'country',
                key: 'country',
              },
            ]}
            dataSource={currentAccount?.data?.locations || []}
            pagination={{ pageSize: 5 }}
            rowKey="_id"
            locale={{
              emptyText: (
                <div className="py-8 text-center">
                  <i className="ri-information-line mx-auto text-3xl text-gray-400 mb-3"></i>
                  <p className="text-gray-500">No locations associated with this account.</p>
                </div>
              )
            }}
          />
        </div>
      ),
    },
  ];

  // Show spinner while loading
  if ((isEditMode && (loadingAccount || !currentAccount?.data)) || !initialized) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin
          size="large"
          tip="Loading account details..."
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
              <h1 className="text-xl font-semibold text-gray-800">Account</h1>
              <p className="text-gray-600 text-md flex items-center gap-2">
                {isEditMode ? currentAccount?.data?.name : 'New record'}
                {isEditMode && (
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-md capitalize ${
                    currentAccount?.data?.status === 'active' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {currentAccount?.data?.status}
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
                {/* Name */}
                <div>
                  <label className="block font-medium mb-1 text-gray-700">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="name"
                    value={formik.values.name}
                    disabled={true}
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block font-medium mb-1 text-gray-700">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="email"
                    value={formik.values.email}
                    disabled={true}
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block font-medium mb-1 text-gray-700">Phone</label>
                  <input
                    name="phone"
                    value={formik.values.phone}
                    disabled={true}
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block font-medium mb-1 text-gray-700">Status</label>
                  <div className="flex space-x-4">
                    {['active', 'inactive'].map(status => (
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
                        <span className="capitalize">{status}</span>
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
        {isEditMode && currentAccount?.data && (
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

export default AccountFormPage;