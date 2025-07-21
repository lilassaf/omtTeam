import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { notification, Spin, Popconfirm, Tabs, Table, Tooltip, Modal } from 'antd';
import { getOneLocation, deleteLocation } from '../../../features/servicenow/location/locationSlice';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
const DefaultIcon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

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

function MapViewUpdater({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

function LocationFormPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const [activeTab, setActiveTab] = useState('1');
  const [initialized, setInitialized] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  // Select location data from Redux store
  const { currentLocation, loading, loadingLocation } = useSelector(
    state => state.location
  );

  // Fetch location details
  useEffect(() => {
    if (isEditMode) {
      dispatch(getOneLocation(id)).then(() => setInitialized(true));
    } else {
      setInitialized(true);
    }
  }, [id, isEditMode, dispatch]);

  // Initialize form with proper default values
  const initialValues = {
    name: '',
    street: '',
    city: '',
    state: '',
    country: '',
    zip: '',
    latitude: '',
    longitude: '',
    archived: false,
    account: null,
    contact: null,
    createdAt: '',
    updatedAt: ''
  };

  // Merge with currentLocation.data if available
  if (isEditMode && currentLocation?.data && !loading) {
    const locationData = currentLocation.data;
    initialValues.name = locationData.name || '';
    initialValues.street = locationData.street || '';
    initialValues.city = locationData.city || '';
    initialValues.state = locationData.state || '';
    initialValues.country = locationData.country || '';
    initialValues.zip = locationData.zip || '';
    initialValues.latitude = locationData.latitude || '';
    initialValues.longitude = locationData.longitude || '';
    initialValues.archived = locationData.archived || false;
    initialValues.account = locationData.account || null;
    initialValues.contact = locationData.contact || null;
    initialValues.createdAt = locationData.createdAt || '';
    initialValues.updatedAt = locationData.updatedAt || '';
  }

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
  });

  const handleCancel = () => navigate('/dashboard/location');

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await dispatch(deleteLocation(id)).unwrap();
      notification.success({
        message: 'Location Deleted',
        description: 'Location has been deleted successfully',
      });
      navigate('/dashboard/location');
    } catch (error) {
      notification.error({
        message: 'Deletion Failed',
        description: error.message || 'Failed to delete location',
      });
    } finally {
      setDeleting(false);
    }
  };

  // Get coordinates from location data
  const getCoordinates = () => {
    if (formik.values?.latitude && formik.values?.longitude) {
      return [parseFloat(formik.values.latitude), parseFloat(formik.values.longitude)];
    }
    return null;
  };

  const coordinates = getCoordinates();
  const defaultPosition = [51.505, -0.09]; // London coordinates as fallback
  const position = coordinates || defaultPosition;
  const mapZoom = coordinates ? 13 : 2;

  const formatFullAddress = () => {
    const parts = [
      formik.values?.street,
      formik.values?.city,
      formik.values?.state,
      formik.values?.zip,
      formik.values?.country
    ].filter(Boolean);
    return parts.join(', ');
  };

  useEffect(() => {
    if (mapModalVisible) {
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
        setMapReady(true);
      }, 300);
    } else {
      setMapReady(false);
    }
  }, [mapModalVisible]);

  // Tab items configuration
  const tabItems = [
    {
      key: '1',
      label: (
        <span className="flex items-center">
          <i className="ri-user-line text-lg mr-2"></i>
          Contact
        </span>
      ),
      children: (
        <div className="p-4">
          {formik.values.contact ? (
            <Table
              columns={[
                {
                  title: 'First Name',
                  dataIndex: 'firstName',
                  key: 'firstName',
                  render: (text) => (
                    <span className="text-cyan-600 font-medium">{text}</span>
                  ),
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
                  title: 'Status',
                  dataIndex: 'active',
                  key: 'status',
                  render: (active) => <StatusCell status={active ? 'active' : 'inactive'} />,
                },
              ]}
              dataSource={[formik.values.contact]}
              pagination={false}
              rowKey="_id"
            />
          ) : (
            <div className="py-8 text-center">
              <i className="ri-information-line mx-auto text-3xl text-gray-400 mb-3"></i>
              <p className="text-gray-500">No contact associated with this location.</p>
            </div>
          )}
        </div>
      ),
    },
    {
      key: '2',
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
              <p className="text-gray-500">No account associated with this location.</p>
            </div>
          )}
        </div>
      ),
    },
  ];

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  // Show spinner while loading
  if ((isEditMode && (loadingLocation || !currentLocation?.data)) || !initialized) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin
          size="large"
          tip="Loading location details..."
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
              <h1 className="text-xl font-semibold text-gray-800">Location</h1>
              <p className="text-gray-600 text-md flex items-center gap-2">
                {isEditMode ? formik.values.name : 'New location'}
                <StatusCell status={formik.values.archived ? 'inactive' : 'active'} />
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {isEditMode && (
              <>
                <button
                  type="button"
                  onClick={() => setMapModalVisible(true)}
                  className="overflow-hidden relative w-32 h-10 border-2 rounded-md text-base font-medium z-10 group bg-white border-cyan-700 text-cyan-700 hover:bg-cyan-50 cursor-pointer"
                >
                  <i className="ri-map-pin-line mr-2"></i>
                  View Map
                </button>
                
                <Tooltip placement="top">
                  <div>
                    <Popconfirm
                      title="Delete Location"
                      description={
                        <div>
                          <p className="font-medium">Are you sure you want to delete this location?</p>
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
              </>
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
                {/* Name */}
                <div>
                  <label className="block font-medium mb-1 text-gray-700">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="name"
                    value={formik.values.name}
                    readOnly
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                  />
                </div>

                {/* Street Address */}
                <div>
                  <label className="block font-medium mb-1 text-gray-700">
                    Street Address
                  </label>
                  <input
                    name="street"
                    value={formik.values.street}
                    readOnly
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                  />
                </div>

                {/* City */}
                <div>
                  <label className="block font-medium mb-1 text-gray-700">
                    City
                  </label>
                  <input
                    name="city"
                    value={formik.values.city}
                    readOnly
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                  />
                </div>

                {/* State */}
                <div>
                  <label className="block font-medium mb-1 text-gray-700">
                    State/Province
                  </label>
                  <input
                    name="state"
                    value={formik.values.state}
                    readOnly
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                  />
                </div>

                {/* Country */}
                <div>
                  <label className="block font-medium mb-1 text-gray-700">
                    Country
                  </label>
                  <input
                    name="country"
                    value={formik.values.country}
                    readOnly
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                  />
                </div>

                {/* ZIP/Postal Code */}
                <div>
                  <label className="block font-medium mb-1 text-gray-700">
                    ZIP/Postal Code
                  </label>
                  <input
                    name="zip"
                    value={formik.values.zip}
                    readOnly
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                  />
                </div>

                {/* Coordinates */}
                <div>
                  <label className="block font-medium mb-1 text-gray-700">
                    Latitude
                  </label>
                  <input
                    name="latitude"
                    value={formik.values.latitude}
                    readOnly
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1 text-gray-700">
                    Longitude
                  </label>
                  <input
                    name="longitude"
                    value={formik.values.longitude}
                    readOnly
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                  />
                </div>

                {/* Timestamps */}
                <div>
                  <label className="block font-medium mb-1 text-gray-700">
                    Created At
                  </label>
                  <input
                    value={formatDate(formik.values.createdAt)}
                    readOnly
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1 text-gray-700">
                    Updated At
                  </label>
                  <input
                    value={formatDate(formik.values.updatedAt)}
                    readOnly
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                  />
                </div>
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

      {/* Map Modal */}
      <Modal
        title={`Location Map: ${formik.values.name || ''}`}
        open={mapModalVisible}
        onCancel={() => setMapModalVisible(false)}
        footer={null}
        width={900}
        style={{ top: 20 }}
        destroyOnClose
        afterOpenChange={() => {
          setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
          }, 300);
        }}
      >
        <div style={{ 
          height: '500px', 
          width: '100%', 
          zIndex: 1,
          border: '1px solid #d9d9d9',
          borderRadius: '4px',
          backgroundColor: !coordinates ? '#f0f0f0' : 'transparent'
        }}>
          {!coordinates && (
            <div style={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#666'
            }}>
              <div className="text-center">
                <i className="ri-map-pin-line text-4xl text-gray-400 mb-3"></i>
                <p>No location coordinates available</p>
                <p className="text-sm text-gray-500 mt-2">
                  Add latitude and longitude to view this location on the map
                </p>
              </div>
            </div>
          )}
          
          {mapReady && coordinates && (
            <MapContainer 
              center={position} 
              zoom={mapZoom}
              style={{ height: '100%', width: '100%' }}
              whenCreated={(map) => {
                setTimeout(() => map.invalidateSize(), 100);
              }}
            >
              <MapViewUpdater center={position} zoom={mapZoom} />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={position}>
                <Popup>
                  <div style={{ minWidth: '200px' }}>
                    <h4 style={{ marginBottom: '8px', fontWeight: 'bold' }}>
                      {formik.values?.name || 'Location'}
                    </h4>
                    <p style={{ margin: '4px 0' }}>
                      <strong>Address:</strong> {formatFullAddress() || 'N/A'}
                    </p>
                    <p style={{ margin: '4px 0' }}>
                      <strong>Coordinates:</strong> {position[0]?.toFixed(6)}, {position[1]?.toFixed(6)}
                    </p>
                  </div>
                </Popup>
              </Marker>
            </MapContainer>
          )}
        </div>
      </Modal>
    </div>
  );
}

export default LocationFormPage;