// src/features/servicenow/product-offering/Quote.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getQuotes,
  deleteQuote
} from '../../../features/servicenow/quote/quotaSlice';
import {
  Pagination,
  Spin,
  Button,
  message
} from 'antd';
import { debounce } from 'lodash';
import { useNavigate } from 'react-router-dom';

// Import components
import PageHeader from '../../../layout/Admin/dashbord/headerTable';
import Table from '../../../components/dashboard/ProductOfferingCategory/Table';

const Quote = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    data,
    currentPage,
    totalItems,
    loading,
    error
  } = useSelector(state => state.quote);

  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [current, setCurrent] = useState(1);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const handleBulkDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Please select items to delete');
      return;
    }

    try {
      await Promise.all(selectedRowKeys.map(id => dispatch(deleteQuote(id))))
      message.success('Selected quotes deleted successfully');
      setSelectedRowKeys([]);
      fetchData(current, pageSize, searchTerm);
    } catch (error) {
      message.error('Failed to delete quotes');
    }
  };

  const handleClearSelection = () => {
    setSelectedRowKeys([]);
  };

  const fetchData = useCallback(debounce((page, size, query) => {
    dispatch(getQuotes({
      page,
      limit: size,
      q: query
    }));
  }, 500), [dispatch]);

  useEffect(() => {
    fetchData(current, pageSize, searchTerm);
    return () => fetchData.cancel();
  }, [current, pageSize, searchTerm, fetchData]);

  useEffect(() => {
    if (currentPage) setCurrent(currentPage);
  }, [currentPage]);

  const handleRowClick = (id) => navigate(`/dashboard/quote/edit/${id}`);

  const columns = [
    {
      title: 'Number',
      dataIndex: 'number',
      key: 'number',
      fixed: 'left',
      sorter: (a, b) => a.number?.localeCompare(b.number),
      render: (text, record) => (
        <span
          className="text-cyan-600 font-medium hover:underline cursor-pointer"
          onClick={() => handleRowClick(record._id)}
        >
          {text}
        </span>
      )
    },
    {
      title: 'Account',
      dataIndex: 'account',
      key: 'account',
      render: (account) => account?.name || 'N/A'
    },
    {
      title: 'Opportunity',
      dataIndex: 'opportunity',
      key: 'opportunity',
      render: (opportunity) => opportunity?.name || 'N/A'
    },
    {
      title: 'Status',
      dataIndex: 'state',
      key: 'state',
      render: (state) => {
        const stateColors = {
          Approved: {
            dot: 'bg-green-500',
            text: 'text-green-700'
          },
          draft: {
            dot: 'bg-blue-500',
            text: 'text-blue-700'
          }
        };

        const colors = stateColors[state] || { dot: 'bg-gray-400', text: 'text-gray-600' };
        const displayText = state ?
          state.charAt(0).toUpperCase() + state.slice(1) :
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
        { text: 'Draft', value: 'draft' },
        { text: 'Approved', value: 'Approved' },
      ],
      onFilter: (value, record) => record.state === value,
    },
    {
      title: 'Expiration Date',
      key: 'expiration_date',
      sorter: (a, b) => new Date(a.expiration_date) - new Date(b.expiration_date),
      render: (_, record) => record.expiration_date
        ? new Date(record.expiration_date).toLocaleDateString()
        : 'N/A',
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
    getCheckboxProps: (record) => ({
      disabled: record.status === 'inactive',
    }),
  };

  const emptyState = (
    <div className="py-12 text-center">
      <i className="ri-information-line mx-auto text-3xl text-gray-400 mb-3"></i>
      <p className="text-gray-500">No quotes found</p>

    </div>
  );

  const bulkActionsProps = {
    selectedCount: selectedRowKeys.length,
    onDelete: handleBulkDelete,
    onClear: handleClearSelection
  };

  return (
    <div className="bg-gray-50 h-full flex flex-col max-w-full">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <PageHeader
          title="Quotes"
          searchPlaceholder="Search by name..."
          createButtonText=''
          onSearchChange={(e) => setSearchTerm(e.target.value)}
          onSearch={(value) => setSearchTerm(value)}
          onCreate={null}
        />
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
              tip="Loading quotes..."
              indicator={<i className="ri-refresh-line animate-spin text-2xl"></i>}
            />
          </div>
        ) : (
          <Table
            data={data}
            columns={columns}
            rowSelection={rowSelection}
            emptyText={emptyState}
            onRowClick={handleRowClick}
            bulkActionsProps={bulkActionsProps}
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
            onChange={(page) => {
              setCurrent(page);
            }}
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

export default Quote;