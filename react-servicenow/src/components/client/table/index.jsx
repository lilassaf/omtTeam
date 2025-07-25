import React, { useState, useEffect, useRef } from 'react';
import { Table as AntTable } from 'antd';

// StatusCell Component
const StatusCell = ({ status }) => {
  const statusColors = {
    active: { dot: 'bg-green-500', text: 'text-green-700' },
    draft: { dot: 'bg-blue-500', text: 'text-blue-700' },
    inactive: { dot: 'bg-gray-400', text: 'text-gray-600' },
    archived: { dot: 'bg-red-500', text: 'text-red-700' }
  };

  const colors = statusColors[status] || statusColors.inactive;
  const displayText = status ? 
    status.charAt(0).toUpperCase() + status.slice(1) : '';

  return (
    <div className="flex items-center">
      <span className={`h-2 w-2 rounded-full mr-2 ${colors.dot}`}></span>
      <span className={`text-xs ${colors.text}`}>
        {displayText}
      </span>
    </div>
  );
};

// Main Table Component
const Table = ({ 
  data, 
  columns, 
  loading, 
  emptyText,
  onRowClick
}) => {
  const [scrollConfig, setScrollConfig] = useState({ x: 'max-content', y: undefined });
  const containerRef = useRef(null);
  const ROW_HEIGHT = 55;
  const MIN_HEIGHT = 200;
  const PAGINATION_HEIGHT = 73; // Approx height of pagination component

  useEffect(() => {
    const calculateTableHeight = () => {
      if (!containerRef.current) return;

      const containerHeight = containerRef.current.clientHeight;
      const availableHeight = containerHeight - PAGINATION_HEIGHT;
      const contentHeight = data.length * ROW_HEIGHT;

      const tableHeight = Math.max(
        MIN_HEIGHT,
        Math.min(contentHeight, availableHeight)
      );

      setScrollConfig({
        x: 'max-content',
        y: contentHeight > availableHeight ? tableHeight : undefined,
      });
    };

    calculateTableHeight();
    
    const resizeObserver = new ResizeObserver(calculateTableHeight);
    resizeObserver.observe(containerRef.current);
    
    window.addEventListener('resize', calculateTableHeight);
    return () => {
      window.removeEventListener('resize', calculateTableHeight);
      resizeObserver.disconnect();
    };
  }, [data.length]);

  const handleRow = (record) => ({
    onClick: () => onRowClick(record._id),
  });

  return (
    <div 
      className="flex flex-col h-full" 
      ref={containerRef}
      style={{ height: '100%' }}
    >
      <div className="flex-grow overflow-hidden">
        <AntTable
          columns={columns}
          dataSource={data.map(item => ({ ...item, key: item._id }))}
          pagination={false}
          scroll={scrollConfig}
          className="service-now-table"
          rowClassName="hover:bg-gray-50 cursor-pointer"
          loading={loading}
          locale={{ emptyText }}
          onRow={handleRow}
        />
      </div>
    </div>
  );
};

// Attach sub-components
Table.StatusCell = StatusCell;

export default Table;