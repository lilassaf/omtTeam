import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getOrder } from './orderSlice';
import { Pagination, Spin } from 'antd';
import { debounce } from 'lodash';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../../layout/Admin/dashbord/headerTable';
import Table from '../../../components/dashboard/ProductOfferingCategory/Table';

const OrderList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Safely destructure with default values
  const orderState = useSelector(state => state.order) || {};
  const {
    data = [],
    currentPage = 1,
    totalItems = 0,
    loading = false,
    error = null
  } = orderState;
  console.log(orderState);
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [current, setCurrent] = useState(1);

  const fetchData = useCallback(debounce((page, size, query) => {
    dispatch(getOrder({
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

  const handleRowClick = (id) => navigate(`/client/order/view/${id}`);

    const columns = [
        {
            title: 'Order Number',
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
            title: <span className="font-semibold">Status</span>,
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const statusColors = {
                    new: { dot: 'bg-blue-500', text: 'text-blue-700' },
                    in_progress: { dot: 'bg-orange-500', text: 'text-orange-700' },
                    completed: { dot: 'bg-green-500', text: 'text-green-700' },
                    cancelled: { dot: 'bg-red-500', text: 'text-red-700' }
                };

                const colors = statusColors[status] || statusColors.new;
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
            },
            filters: [
                { text: 'New', value: 'new' },
                { text: 'In Progress', value: 'in_progress' },
                { text: 'Completed', value: 'completed' },
                { text: 'Cancelled', value: 'cancelled' },
            ],
            onFilter: (value, record) => record.status === value,
        },
        {
            title: 'Order Date',
            key: 'order_date',
            sorter: (a, b) => new Date(a.order_date) - new Date(b.order_date),
            render: (_, record) => record.order_date
                ? new Date(record.order_date).toISOString().split("T")[0]
                : 'N/A',
        },
        {
            title: 'Total Price',
            key: 'total_price',
            render: (_, record) => `${record.currency || 'USD'} ${record.total_price || 0}`
        }
    ];

    const emptyState = (
        <div className="py-12 text-center">
            <i className="ri-information-line mx-auto text-3xl text-gray-400 mb-3"></i>
            <p className="text-gray-500">No orders found</p>
        </div>
    );

    return (
        <div className="bg-gray-50 h-full flex flex-col max-w-full">
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
                <PageHeader
                    title="Orders"
                    searchPlaceholder="Search by order number..."
                    createButtonText=''
                    onSearchChange={(e) => setSearchTerm(e.target.value)}
                    onSearch={(value) => setSearchTerm(value)}
                />
            </div>

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
                            tip="Loading orders..."
                            indicator={<i className="ri-refresh-line animate-spin text-2xl"></i>}
                        />
                    </div>
                ) : (
                    <Table
                        data={data}
                        columns={columns}
                        rowSelection={null}
                        emptyText={emptyState}
                        onRowClick={handleRowClick}
                        bulkActionsProps={null}
                    />
                )}
            </div>

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

export default OrderList;