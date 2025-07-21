export const validateField = (name, value, context, contactIndex = null) => {
  const errors = {};
  
  // Handle contact fields
  if (name.startsWith('contacts[')) {
    const match = name.match(/contacts\[(\d+)\]\.(.+)/);
    if (match) {
      contactIndex = parseInt(match[1]);
      name = match[2];
    }
  }

  const getFieldLabel = () => {
    if (contactIndex !== null) {
      return `${contactIndex === 0 ? 'Primary Contact' : `Contact ${contactIndex + 1}`} ${name.replace(/([A-Z])/g, ' $1').toLowerCase()}`;
    }
    return name.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').toLowerCase();
  };

  const fieldLabel = getFieldLabel();

  // Required field validation
  const isEmpty = value === null || 
                 value === undefined || 
                 (typeof value === 'string' && value.trim() === '') ||
                 (typeof value === 'object' && !value?.latitude && !value?.longitude);

  if (isEmpty) {
    errors[name] = `${fieldLabel} is required`;
    if (contactIndex !== null) {
      return { [`contacts[${contactIndex}].${name}`]: errors[name] };
    }
    return errors;
  }

  // Field-specific validations
  switch (name) {
    case 'name':
    case 'firstName':
    case 'lastName':
      if (value.trim().length < 2) {
        errors[name] = `${fieldLabel} must be at least 2 characters`;
      }
      break;

    case 'email':
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errors[name] = `Please enter a valid ${fieldLabel}`;
      }
      break;

    case 'mobile_phone':
    case 'phone': {
      const phoneDigits = value.replace(/[^\d]/g, '');
      if (!/^\+?[\d\s()-]{10,20}$/.test(value) || phoneDigits.length < 10 || phoneDigits.length > 20) {
        errors[name] = `Please enter a valid ${fieldLabel} (10-20 digits)`;
      }
      break;
    }

    case 'password':
      if (value.length < 6) {
        errors[name] = `${fieldLabel} must be at least 6 characters`;
      }
      break;

    case 'agreed':
      if (!value) {
        errors[name] = "You must agree to the terms and conditions";
      }
      break;

    case 'location':
      if (!value?.latitude || !value?.longitude) {
        errors[name] = `${fieldLabel} is required - please select a location`;
      }
      break;

    default:
      break;
  }

  if (contactIndex !== null && Object.keys(errors).length > 0) {
    return { [`contacts[${contactIndex}].${name}`]: errors[name] };
  }
  return errors;
};

export const validateAllFields = (context) => {
  const { formData, agreed, contacts } = context;
  let allErrors = {};

  // Validate main form fields
  ['name', 'email', 'mobile_phone'].forEach(field => {
    const fieldErrors = validateField(field, formData[field], context);
    Object.assign(allErrors, fieldErrors);
  });

  // Validate agreement
  const agreedError = validateField('agreed', agreed, context);
  Object.assign(allErrors, agreedError);

  // Validate contacts
  contacts.forEach((contact, index) => {
    ['firstName', 'lastName', 'email', 'phone', 'password', 'location'].forEach(field => {
      const fieldName = `contacts[${index}].${field}`;
      const fieldErrors = validateField(fieldName, contact[field], context, index);
      Object.assign(allErrors, fieldErrors);
    });
  });

  return allErrors;
};