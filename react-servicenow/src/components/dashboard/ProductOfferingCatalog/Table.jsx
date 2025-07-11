import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getall,
  updateCategoryStatus,
  deleteCategory
} from '../../../features/servicenow/product-offering/productOfferingCategorySlice';
import {
  Table,
  Input,
  Button,
  Popconfirm,
  Pagination,
  Spin,
  Tooltip,
  Badge
} from 'antd';
import { debounce } from 'lodash';
import { useNavigate } from 'react-router-dom';

const { Search } = Input;

const ProductOfferingCategory = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    data,
    currentPage,
    totalPages,
    totalItems,
    loading,
    error
  } = useSelector(state => state.productOfferingCategory);

  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [current, setCurrent] = useState(1);
  const [sortConfig, setSortConfig] = useState({
    field: null,
    direction: null
  });
  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  // Row selection state
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const selectionType = 'checkbox';

  // Row selection configuration
  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys) => {
      setSelectedRowKeys(selectedKeys);
    },
    getCheckboxProps: (record) => ({
      disabled: record.status === 'inactive',
    }),
  };

  // Measure header height
  useEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight);
    }
  }, [loading, error, selectedRowKeys]);

  // Fetch data with debounced search
  const fetchData = debounce((page, size, query) => {
    dispatch(getall({
      page,
      limit: size,
      q: query,
      sortField: sortConfig.field,
      sortOrder: sortConfig.direction
    }));
  }, 500);

  useEffect(() => {
    fetchData(current, pageSize, searchTerm);
    return () => fetchData.cancel();
  }, [current, pageSize, searchTerm, sortConfig]);

  useEffect(() => {
    if (currentPage) setCurrent(currentPage);
  }, [currentPage]);

  // Navigation handlers
  const navigateToCreate = () => navigate('/dashboard/category/create');
  const handleNumberClick = (id) => navigate(`/dashboard/category/edit/${id}`);

  // Bulk actions
  const handleBulkDelete = () => {
    selectedRowKeys.forEach(id => dispatch(deleteCategory(id)));
    setSelectedRowKeys([]);
  };

  const handleBulkStatusChange = (status) => {
    selectedRowKeys.forEach(id =>
      dispatch(updateCategoryStatus({ id, status }))
    );
    setSelectedRowKeys([]);
  };

  // Table columns configuration
  const columns = [
    {
      title: (
        <div className="flex items-center  font-semibold">
          <span>Number</span>
        </div>
      ),
      dataIndex: 'number',
      key: 'number',
      sorter: (a, b) => a.number.localeCompare(b.number),
      render: (text, record) => (
        <span
          className="text-cyan-600 font-medium hover:underline cursor-pointer"
          onClick={() => handleNumberClick(record._id)}
        >
          {text}
        </span>
      )
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: <span className="font-semibold">Status</span>,
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        // Define color mapping for all statuses
        const statusColors = {
          published: {
            dot: 'bg-green-500',
            text: 'text-green-700'
          },
          draft: {
            dot: 'bg-blue-500',
            text: 'text-blue-700'
          },
          archived: {
            dot: 'bg-gray-400',
            text: 'text-gray-600'
          },
          retired: {
            dot: 'bg-red-500',
            text: 'text-red-700'
          }
        };

        // Get colors for current status or use archived as default
        const colors = statusColors[status] || statusColors.archived;
        const displayText = status ?
          status.charAt(0).toUpperCase() + status.slice(1) :
          '';

        return (
          <div className="flex items-center">
            <span className={`h-2 w-2 rounded-full mr-2 ${colors.dot}`}></span>
            <span className={`text-xs ${colors.text}`}>
              {displayText}
            </span>
          </div>
        );
      },
      filters: [
        { text: 'Published', value: 'published' },
        { text: 'Draft', value: 'draft' },
        { text: 'Archived', value: 'archived' },
        { text: 'Retired', value: 'retired' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Start Date',
      key: 'start_date',
      sorter: (a, b) => new Date(a.start_date) - new Date(b.start_date),
      render: (_, record) => record.start_date
        ? new Date(record.start_date).toISOString().split("T")[0]
        : 'N/A',
    },
    {
      title: 'End Date',
      key: 'end_date',
      sorter: (a, b) => new Date(a.end_date) - new Date(b.end_date),
      render: (_, record) => record.end_date
        ? new Date(record.end_date).toISOString().split("T")[0]
        : 'N/A',
    },
  ];

  return (
    <div className="bg-gray-50 h-full flex flex-col max-w-full">
      {/* Sticky Header */}
      <div
        ref={headerRef}
        className="sticky top-0 z-10 bg-white border-b border-gray-200"
      >
        <div className="flex flex-col md:flex-row px-6 py-4 bg-gray-200 justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-lg font-semibold text-gray-800">Product Offering Categories</h1>
          </div>

          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <Search
              placeholder="Search by name..."
              prefix={<i className="ri-search-line text-gray-400"></i>}
              allowClear
              enterButton={
                <Button type="primary">Search</Button>
              }
              size="large"
              className="w-full md:w-80"
              onChange={(e) => setSearchTerm(e.target.value)}
              onSearch={(value) => setSearchTerm(value)}
            />

            <Button
              type="primary"
              icon={<i className="ri-add-line"></i>}
              size="large"
              onClick={navigateToCreate}
              className="flex items-center"
            >
              New 
            </Button>
          </div>
        </div>

        {/* Bulk Actions Toolbar */}
        <div
          className="overflow-hidden transition-all duration-300 ease-in-out"
          style={{
            maxHeight: selectedRowKeys.length > 0 ? '100px' : '0',
            opacity: selectedRowKeys.length > 0 ? 1 : 0
          }}
        >
          <div className="bg-gray-50 shadow-sm border-y border-gray-300">
            <div className="flex flex-wrap items-center bg-gray-200 justify-between gap-3 p-3 mx-6">
              <div className="flex items-center">
                <Badge
                  count={selectedRowKeys.length}
                  className="text-white font-medium"
                />
                <span className="ml-2 text-gray-700 font-medium">
                  {selectedRowKeys.length} item{selectedRowKeys.length > 1 ? 's' : ''} selected
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                <Tooltip title="Delete selected">
                  <Popconfirm
                    title="Delete selected categories?"
                    description="This action cannot be undone. Are you sure?"
                    onConfirm={handleBulkDelete}
                    okText="Delete"
                    cancelText="Cancel"
                    okButtonProps={{ danger: true }}
                  >
                    <Button
                      danger
                      icon={<i className="ri-delete-bin-line"></i>}
                      className="flex items-center"
                    >
                      Delete
                    </Button>
                  </Popconfirm>
                </Tooltip>

                <Button
                  icon={<i className="ri-close-line"></i>}
                  className="flex items-center"
                  onClick={() => setSelectedRowKeys([])}
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Table Container */}
      <div className="flex-grow overflow-hidden">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 m-4 rounded">
            <div className="flex items-center">
              <i className="ri-error-warning-line text-red-500 text-xl mr-2"></i>
              <div>
                <p className="font-bold text-red-700">Error</p>
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spin
              size="large"
              tip="Loading categories..."
              indicator={<i className="ri-refresh-line animate-spin text-2xl"></i>}
            />
          </div>
        ) : (
          <Table
            rowSelection={Object.assign({ type: selectionType }, rowSelection)}
            columns={columns}
            dataSource={data.map(item => ({ ...item, key: item._id }))}
            pagination={false}
            scroll={{ x: 'max-content' }}
            sticky={{ offsetScroll: 0 }}
            className="service-now-table relative"
            rowClassName="hover:bg-gray-50"
            locale={{
              emptyText: (
                <div className="py-12 text-center">
                  <i className="ri-information-line mx-auto text-3xl text-gray-400 mb-3"></i>
                  <p className="text-gray-500">No categories found</p>
                  <Button
                    type="primary"
                    className="mt-4 flex items-center mx-auto bg-blue-600 hover:bg-blue-700 border-blue-600"
                    icon={<i className="ri-add-line"></i>}
                    onClick={navigateToCreate}
                  >
                    Create New Category
                  </Button>
                </div>
              )
            }}
          />
        )}
      </div>

      {/* Sticky Pagination */}
      <div className="sticky bottom-0 z-10 bg-white border-t border-gray-200 p-4">
        <div className="flex flex-col md:flex-row justify-center items-center gap-4">
          <Pagination
            current={current}
            total={totalItems}
            pageSize={pageSize}
            className="mt-2 md:mt-0"
          />
          <div className="text-gray-600 text-sm">
            to  {Math.min(current * pageSize, totalItems)} of {totalItems}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductOfferingCategory;