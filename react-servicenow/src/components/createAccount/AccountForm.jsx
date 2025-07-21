import React from "react";
import { Input, Typography } from "@material-tailwind/react";

const AccountForm = ({
  formData,
  handleChange,
  handleBlur,
  validationErrors,
  touchedFields,
}) => {
  const showError = (field) => touchedFields[field] && validationErrors[field];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="col-span-2">
        <div className="mb-1">
          <Typography variant="small" className="font-medium text-gray-700">
            Full Name <span className="text-red-500">*</span>
          </Typography>
        </div>
        <Input
          name="name"
          value={formData.name}
          onChange={handleChange}
          onBlur={handleBlur}
          error={showError('name')}
          placeholder="Enter your full name"
        />
        {showError('name') && (
          <Typography variant="small" color="red" className="mt-1">
            {validationErrors.name}
          </Typography>
        )}
      </div>

      <div>
        <div className="mb-1">
          <Typography variant="small" className="font-medium text-gray-700">
            Email <span className="text-red-500">*</span>
          </Typography>
        </div>
        <Input
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          onBlur={handleBlur}
          error={showError('email')}
          placeholder="Enter your email"
        />
        {showError('email') && (
          <Typography variant="small" color="red" className="mt-1">
            {validationErrors.email}
          </Typography>
        )}
      </div>

      <div>
        <div className="mb-1">
          <Typography variant="small" className="font-medium text-gray-700">
            Mobile Phone <span className="text-red-500">*</span>
          </Typography>
        </div>
        <Input
          name="mobile_phone"
          type="tel"
          value={formData.mobile_phone}
          onChange={handleChange}
          onBlur={handleBlur}
          error={showError('mobile_phone')}
          placeholder="Enter your phone number"
        />
        {showError('mobile_phone') && (
          <Typography variant="small" color="red" className="mt-1">
            {validationErrors.mobile_phone}
          </Typography>
        )}
      </div>
    </div>
  );
};

export default AccountForm;