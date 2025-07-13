// ProductSpecCharacteristics.jsx
import React from 'react';
import { Table, Select, Switch } from 'antd';
import './characteristics.css';

const ProductSpecCharacteristics = ({ characteristics, onChange, onToggle }) => {
  const columns = [
    {
      title: 'Include',
      key: 'include',
      render: (_, record) => (
        <Switch
          defaultChecked
          onChange={(checked) => onToggle(record.name, checked)}
        />
      ),
      width: 80,
    },
    {
      title: 'Characteristic',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: 'Value',
      key: 'value',
      render: (_, record) => (
        <Select
          style={{ width: '100%' }}
          placeholder="Select value"
          onChange={(value) => onChange(record.name, value)}
          options={record.productSpecCharacteristicValue?.map((val) => ({
            value: val.value,
            label: val.value,
          }))}
        />
      ),
    },
  ];

  return (
    <div className="mt-6 mb-10">
      {/* <h3 className="text-lg font-medium mb-4">Product Characteristics</h3> */}
      <Table
        columns={columns}
        dataSource={characteristics}
        rowKey="name"
        pagination={false}
        bordered
      />
    </div>
  );
};

export default ProductSpecCharacteristics;