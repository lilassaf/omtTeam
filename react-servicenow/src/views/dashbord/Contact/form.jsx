import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { notification, Spin, Popconfirm, Tabs, Table, Tooltip } from 'antd';
import { getOneContact, deleteContact } from '../../../features/servicenow/contact/contactSlice';

const StatusCell = ({ status }) => {
  const statusColors = {
    active: { dot: 'bg-green-500', text: 'text-green-700' },
    inactive: { dot: 'bg-gray-400', text: 'text-gray-600' },
  };

  const colors = statusColors[status?.toLowerCase()] || statusColors.inactive;
  const displayText = status ?
    status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : 'Inactive';

  return (
    <div className="flex items-center">
      <span className={`h-2 w-2 rounded-full mr-2 ${colors.dot}`}></span>
      <span className={`text-xs ${colors.text}`}>
        {displayText}
      </span>
    </div>
  );
};

function ContactFormPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const [activeTab, setActiveTab] = useState('1');
  const [initialized, setInitialized] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Select contact data from Redux store
  const { currentContact, loading, loadingContact } = useSelector(
    state => state.contact
  );

  // Fetch contact details
  useEffect(() => {
    if (isEditMode) {
      dispatch(getOneContact(id)).then(() => setInitialized(true));
    } else {
      setInitialized(true);
    }
  }, [id, isEditMode, dispatch]);

  // Initialize form with proper default values
  const initialValues = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    isPrimaryContact: false,
    active: false,
    account: null,
    location: null
  };

  // Merge with currentContact.data if available
  if (isEditMode && currentContact?.data && !loading) {
    const contactData = currentContact.data;
    initialValues.firstName = contactData.firstName || '';
    initialValues.lastName = contactData.lastName || '';
    initialValues.email = contactData.email || '';
    initialValues.phone = contactData.phone || '';
    initialValues.isPrimaryContact = contactData.isPrimaryContact || false;
    initialValues.active = contactData.active || false;
    initialValues.account = contactData.account || null;
    initialValues.location = contactData.location || null;
  }

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
  });

  const handleCancel = () => navigate('/dashboard/contact');

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await dispatch(deleteContact(id)).unwrap();
      notification.success({
        message: 'Contact Deleted',
        description: 'Contact has been deleted successfully',
      });
      navigate('/dashboard/contact');
    } catch (error) {
      notification.error({
        message: 'Deletion Failed',
        description: error.message || 'Failed to delete contact',
      });
    } finally {
      setDeleting(false);
    }
  };

  // Tab items configuration
  const tabItems = [
    {
      key: '1',
      label: (
        <span className="flex items-center">
          <i className="ri-building-line text-lg mr-2"></i>
          Account
        </span>
      ),
      children: (
        <div className="p-4">
          {formik.values.account ? (
            <Table
              columns={[
                {
                  title: 'Name',
                  dataIndex: 'name',
                  key: 'name',
                  render: (text) => (
                    <span className="text-cyan-600 font-medium">{text}</span>
                  ),
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
                  title: 'Status',
                  dataIndex: 'status',
                  key: 'status',
                  render: (status) => <StatusCell status={status} />,
                },
              ]}
              dataSource={[formik.values.account]}
              pagination={false}
              rowKey="_id"
            />
          ) : (
            <div className="py-8 text-center">
              <i className="ri-information-line mx-auto text-3xl text-gray-400 mb-3"></i>
              <p className="text-gray-500">No account associated with this contact.</p>
            </div>
          )}
        </div>
      ),
    },
    {
      key: '2',
      label: (
        <span className="flex items-center">
          <i className="ri-map-pin-line text-lg mr-2"></i>
          Location
        </span>
      ),
      children: (
        <div className="p-4">
          {formik.values.location ? (
            <Table
              columns={[
                {
                  title: 'Name',
                  dataIndex: 'name',
                  key: 'name',
                },
                {
                  title: 'Street',
                  dataIndex: 'street',
                  key: 'street',
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
              dataSource={[formik.values.location]}
              pagination={false}
              rowKey="_id"
            />
          ) : (
            <div className="py-8 text-center">
              <i className="ri-information-line mx-auto text-3xl text-gray-400 mb-3"></i>
              <p className="text-gray-500">No location associated with this contact.</p>
            </div>
          )}
        </div>
      ),
    },
  ];

  // Show spinner while loading
  if ((isEditMode && (loadingContact || !currentContact?.data)) || !initialized) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin
          size="large"
          tip="Loading contact details..."
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
              className="mr-3 text-cyan-700 hover:text-cyan-800 bg-white border border-cyan-700 hover:bg-cyan-50 w-10 h-10 flex justify-center items-center"
            >
              <i className="ri-arrow-left-s-line text-2xl"></i>
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-800">Contact</h1>
              <p className="text-gray-600 text-md flex items-center gap-2">
                {isEditMode ? `${formik.values.firstName} ${formik.values.lastName}` : 'New contact'}
                <StatusCell status={formik.values.active ? 'active' : 'inactive'} />
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {isEditMode && (
              <Tooltip placement="top">
                <div>
                  <Popconfirm
                    title="Delete Contact"
                    description={
                      <div>
                        <p className="font-medium">Are you sure you want to delete this contact?</p>
                        <p className="text-gray-600 mt-2">
                          This action cannot be undone. All associated information will be removed.
                        </p>
                      </div>
                    }
                    icon={<i className="ri-error-warning-line text-red-500 text-xl mr-2"></i>}
                    onConfirm={handleDelete}
                    okText="Delete"
                    okButtonProps={{
                      loading: deleting,
                      danger: true
                    }}
                    cancelText="Cancel"
                  >
                    <button
                      type="button"
                      disabled={deleting}
                      className="overflow-hidden relative w-32 h-10 border-2 rounded-md text-base font-medium z-10 group bg-white border-cyan-700 text-cyan-700 hover:bg-cyan-50 cursor-pointer"
                    >
                      Delete
                    </button>
                  </Popconfirm>
                </div>
              </Tooltip>
            )}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-grow overflow-y-auto">
        <div className="bg-white shadow-sm max-w-6xl mx-auto my-6">
          <div className="p-6">
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div>
                  <label className="block font-medium mb-1 text-gray-700">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="firstName"
                    value={formik.values.firstName}
                    readOnly
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label className="block font-medium mb-1 text-gray-700">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="lastName"
                    value={formik.values.lastName}
                    readOnly
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
                    readOnly
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block font-medium mb-1 text-gray-700">Phone</label>
                  <input
                    name="phone"
                    value={formik.values.phone}
                    readOnly
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                  />
                </div>

                {/* Primary Contact */}
                <div>
                  <label className="block font-medium mb-1 text-gray-700">Primary Contact</label>
                  <div className="flex space-x-4">
                    {[true, false].map(value => (
                      <label
                        key={value.toString()}
                        className={`flex items-center px-4 py-2 border rounded-md cursor-not-allowed ${
                          formik.values.isPrimaryContact === value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 bg-gray-100'
                        }`}
                      >
                        <input
                          type="radio"
                          name="isPrimaryContact"
                          checked={formik.values.isPrimaryContact === value}
                          disabled
                          className="mr-2"
                        />
                        <span>{value ? 'Yes' : 'No'}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Status */}
                {/* <div>
                  <label className="block font-medium mb-1 text-gray-700">Status</label>
                  <div className="flex space-x-4">
                    {[true, false].map(value => (
                      <label
                        key={value.toString()}
                        className={`flex items-center px-4 py-2 border rounded-md cursor-not-allowed ${
                          formik.values.active === value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 bg-gray-100'
                        }`}
                      >
                        <input
                          type="radio"
                          name="active"
                          checked={formik.values.active === value}
                          disabled
                          className="mr-2"
                        />
                        <span>{value ? 'Active' : 'Inactive'}</span>
                      </label>
                    ))}
                  </div>
                </div> */}
              </div>
            </form>
          </div>
        </div>

        {/* Tabs Section */}
        {isEditMode && (
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

export default ContactFormPage;