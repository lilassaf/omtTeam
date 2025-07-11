import React from 'react';
import { Modal } from 'antd';
import { formatDateForInput } from '@/utils/formatDateForInput';

function QuoteInfoForm({ open, setOpen, initialData = {} }) {
  const handleCancel = () => setOpen(false);

  return (
    <Modal
      title="Quote Information"
      open={open}
      onCancel={handleCancel}
      footer={null}
      destroyOnClose
      style={{ top: 20 }}
      width={900}
    >
      <form className="grid grid-cols-2 gap-4">
        {/* Quote Number */}
        <div>
          <label className="block font-medium mb-1">Quote Number</label>
          <input
            value={initialData?.number || ''}
            disabled
            className="w-full border rounded px-3 py-2 bg-gray-100"
          />
        </div>

        {/* State */}
        <div>
          <label className="block font-medium mb-1">State</label>
          <input
            value={initialData?.state || 'N/A'}
            disabled
            className="w-full border rounded px-3 py-2 bg-gray-100"
          />
        </div>

        {/* Short Description */}
        <div className="col-span-2">
          <label className="block font-medium mb-1">Short Description</label>
          <textarea
            value={initialData?.short_description || 'N/A'}
            rows="3"
            disabled
            className="w-full border rounded px-3 py-2 bg-gray-100"
          />
        </div>

        {/* Total Amount */}
        <div>
          <label className="block font-medium mb-1">Total Amount</label>
          <input
            value={initialData?.total_amount ? `${initialData.currency || '$'}${initialData.total_amount.toLocaleString()}` : 'N/A'}
            disabled
            className="w-full border rounded px-3 py-2 bg-gray-100"
          />
        </div>

        {/* Version */}
        <div>
          <label className="block font-medium mb-1">Version</label>
          <input
            value={initialData?.version || 'N/A'}
            disabled
            className="w-full border rounded px-3 py-2 bg-gray-100"
          />
        </div>

        {/* Channel */}
        <div>
          <label className="block font-medium mb-1">Channel</label>
          <input
            value={initialData?.channel || 'N/A'}
            disabled
            className="w-full border rounded px-3 py-2 bg-gray-100"
          />
        </div>

        {/* Active Status */}
        <div>
          <label className="block font-medium mb-1">Active Status</label>
          <input
            value={initialData?.active === "true" ? "Active" : "Inactive"}
            disabled
            className="w-full border rounded px-3 py-2 bg-gray-100"
          />
        </div>

        {/* Subscription Start Date */}
        <div>
          <label className="block font-medium mb-1">Subscription Start Date</label>
          <input
            type="date"
            value={formatDateForInput(initialData?.subscription_start_date) || 'N/A'}
            disabled
            className="w-full border rounded px-3 py-2 bg-gray-100"
          />
        </div>

        {/* Subscription End Date */}
        <div>
          <label className="block font-medium mb-1">Subscription End Date</label>
          <input
            type="date"
            value={formatDateForInput(initialData?.subscription_end_date) || 'N/A'}
            disabled
            className="w-full border rounded px-3 py-2 bg-gray-100"
          />
        </div>

        {/* Assigned To */}
        <div>
          <label className="block font-medium mb-1">Assigned To</label>
          <input
            value={initialData?.assigned_to || 'N/A'}
            disabled
            className="w-full border rounded px-3 py-2 bg-gray-100"
          />
        </div>

        {/* Assignment Group */}
        <div>
          <label className="block font-medium mb-1">Assignment Group</label>
          <input
            value={initialData?.assignment_group || 'N/A'}
            disabled
            className="w-full border rounded px-3 py-2 bg-gray-100"
          />
        </div>

        {/* Account */}
        <div className="col-span-2">
          <label className="block font-medium mb-1">Account</label>
          <input
            value={initialData?.account?.name || 'N/A'}
            disabled
            className="w-full border rounded px-3 py-2 bg-gray-100"
          />
        </div>

        {/* Close Button */}
        <div className="col-span-2 flex justify-end space-x-2 pt-2">
           <button
            type="button"
            onClick={handleCancel}
            className="overflow-hidden relative w-28 h-10 bg-gray-200 text-red-400 border-none rounded-md text-lg font-bold cursor-pointer z-10 group disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            Cancel

            {/* Red bubble hover effect */}
            <span className="absolute w-32 h-28 -top-7 -left-2 bg-red-200 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform group-hover:duration-500 duration-1000 origin-bottom"></span>
            <span className="absolute w-32 h-28 -top-7 -left-2 bg-red-400 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform group-hover:duration-700 duration-700 origin-bottom"></span>
            <span className="absolute w-32 h-28 -top-7 -left-2 bg-red-600 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform group-hover:duration-1000 duration-500 origin-bottom"></span>
            <span className="group-hover:opacity-100 text-white group-hover:duration-1000 duration-100 opacity-0 absolute top-1.25 left-7.25 z-10">
              Cancel
            </span>
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default QuoteInfoForm;