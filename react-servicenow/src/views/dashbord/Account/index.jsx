import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAccount, deleteAccount } from '../../../features/servicenow/account/accountSlice';
import { Table, Button, Popconfirm, Pagination, Badge, message } from 'antd';
import { debounce } from 'lodash';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../../layout/dashbord/headerTable';

const AccountImport = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    data,
    currentPage,
    totalItems,
    loading,
    error,
    deleteLoading,
    deleteSuccess
  } = useSelector(state => state.account);

  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize] = useState(10);
  const [current, setCurrent] = useState(1);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [localData, setLocalData] = useState([]);

  // Fetch data with debounced search
  const fetchData = useCallback(debounce((page, size, query) => {
    dispatch(getAccount({
      page,
      limit: size,
      q: query
    }));
  }, 500), []);

  // Initial data fetch and update local data
  useEffect(() => {
    fetchData(current, pageSize, searchTerm);
    return () => fetchData.cancel();
  }, [current, pageSize, searchTerm, fetchData]);

  // Update local data when Redux data changes
  useEffect(() => {
    if (data.length > 0) {
      setLocalData(data);
    }
  }, [data]);

  // Sync current page with Redux state
  useEffect(() => {
    if (currentPage) setCurrent(currentPage);
  }, [currentPage]);

  // Handle delete success - clears selection automatically
  useEffect(() => {
    if (deleteSuccess) {
      message.success('Account(s) deleted successfully');
      fetchData(current, pageSize, searchTerm);
      setSelectedRowKeys([]); // Automatically clear selection
    }
  }, [deleteSuccess, current, pageSize, searchTerm, fetchData]);

  // Handle row click
  const handleRowClick = (record) => ({
    onClick: () => navigate(`/dashboard/account/view/${record._id}`),
  });

  // Handle bulk delete
  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedRowKeys.map(id => dispatch(deleteAccount(id))));
      // Selection will be cleared automatically by the deleteSuccess effect
    } catch (error) {
      message.error('Failed to delete accounts');
      console.error("Delete error:", error);
    }
  };

  // Table columns configuration
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
      sorter: (a, b) => (a.name || '').localeCompare(b.name || ''),
      render: (text, record) => (
        <span
          className="text-cyan-600 font-medium hover:underline cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/dashboard/account/view/${record._id}`);
          }}
        >
          {text}
        </span>
      )
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email) => email || 'N/A'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const isActive = status === 'active';
        return (
          <div className="flex items-center">
            <span className={`h-2 w-2 rounded-full mr-2 ${isActive ? 'bg-green-500' : 'bg-gray-400'}`}></span>
            <span className={`text-xs ${isActive ? 'text-green-700' : 'text-gray-600'}`}>
              {isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        );
      },
      filters: [
        { text: 'Active', value: 'active' },
        { text: 'Inactive', value: 'inactive' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Updated Date',
      key: 'updatedAt',
      sorter: (a, b) => new Date(a.updatedAt) - new Date(b.updatedAt),
      render: (_, record) => record.updatedAt
        ? new Date(record.updatedAt).toLocaleString()
        : 'N/A',
    },
  ];

  return (
    <div className="bg-gray-50 h-full flex flex-col max-w-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <PageHeader
          title="Accounts"
          searchPlaceholder="Search by name..."
          onSearchChange={(e) => setSearchTerm(e.target.value)}
          onSearch={(value) => setSearchTerm(value)}
        />
        
        {/* Bulk Actions */}
        {selectedRowKeys.length > 0 && (
          <div className="bg-gray-50 shadow-sm border-y border-gray-300">
            <div className="flex flex-wrap items-center bg-gray-200 justify-between gap-3 p-3 mx-6">
              <div className="flex items-center">
                <Badge count={selectedRowKeys.length} className="text-white font-medium" />
                <span className="ml-2 text-gray-700 font-medium">
                  {selectedRowKeys.length} item{selectedRowKeys.length !== 1 ? 's' : ''} selected
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                <Popconfirm
                  title="Delete selected accounts?"
                  description="This action cannot be undone. Are you sure?"
                  onConfirm={handleBulkDelete}
                  okText="Delete"
                  cancelText="Cancel"
                  okButtonProps={{ danger: true, loading: deleteLoading }}
                >
                  <Button danger icon={<i className="ri-delete-bin-line"></i>} loading={deleteLoading}>
                    Delete
                  </Button>
                </Popconfirm>
                <Button icon={<i className="ri-close-line"></i>} onClick={() => setSelectedRowKeys([])}>
                  Clear Selection
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table Container */}
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

        <Table
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
            getCheckboxProps: () => ({ disabled: false }),
          }}
          columns={columns}
          dataSource={localData.map(item => ({ ...item, key: item._id }))}
          pagination={false}
          scroll={{ x: 'max-content' }}
          sticky
          className="service-now-table"
          rowClassName="cursor-pointer hover:bg-gray-50"
          onRow={handleRowClick}
          loading={loading}
          locale={{
            emptyText: (
              <div className="py-12 text-center">
                <i className="ri-information-line mx-auto text-3xl text-gray-400 mb-3"></i>
                <p className="text-gray-500">No account items found</p>
              </div>
            )
          }}
        />
      </div>

      {/* Pagination */}
      <div className="sticky bottom-0 z-10 bg-white border-t border-gray-200 p-4">
        <div className="flex flex-col md:flex-row justify-center items-center gap-4">
          <Pagination
            current={current}
            total={totalItems}
            pageSize={pageSize}
            onChange={setCurrent}
            className="mt-2 md:mt-0"
          />
          <div className="text-gray-600 text-sm">
            Showing {Math.min((current - 1) * pageSize + 1, totalItems)} to {Math.min(current * pageSize, totalItems)} of {totalItems}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountImport;