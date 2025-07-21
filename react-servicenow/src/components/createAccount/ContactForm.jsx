import React from "react";
import { Button, Input, Typography } from "@material-tailwind/react";
import LocationForm from "./LocationForm";

const ContactForm = ({
  contacts,
  setContacts,
  validationErrors,
  touchedFields,
  getCurrentLocation,
  locationLoading,
  setLocationLoading,
  handleContactChange,
  handleBlur,
}) => {
  const showError = (field) => touchedFields[field] && validationErrors[field];

  const addContact = () => {
    setContacts([...contacts, {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      phone: "",
      location: null
    }]);
  };

  const removeContact = (index) => {
    if (contacts.length <= 1) return;
    setContacts(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {contacts.map((contact, index) => (
        <div 
          key={index} 
          className={`border p-6 rounded-lg relative ${index === 0 ? 'bg-blue-50 border-blue-200' : 'bg-white'}`}
        >
          {index === 0 && (
            <div className="absolute -mt-6 -ml-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-md">
              Primary Contact
            </div>
          )}
          
          <div className="flex justify-between items-center mb-4">
            <Typography variant="h6" className={index === 0 ? 'text-blue-700' : 'text-gray-800'}>
              {index === 0 ? 'Primary Contact' : `Contact ${index + 1}`}
            </Typography>
            {contacts.length > 1 && (
              <Button
                variant="text"
                color="red"
                size="sm"
                onClick={() => removeContact(index)}
              >
                Remove
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <div className="mb-1">
                <Typography variant="small" className="font-medium text-gray-700">
                  First Name <span className="text-red-500">*</span>
                </Typography>
              </div>
              <Input
                name="firstName"
                value={contact.firstName}
                onChange={(e) => handleContactChange(index, e)}
                onBlur={handleBlur}
                error={showError(`contacts[${index}].firstName`)}
                placeholder="First name"
              />
              {showError(`contacts[${index}].firstName`) && (
                <Typography variant="small" color="red" className="mt-1">
                  {validationErrors[`contacts[${index}].firstName`]}
                </Typography>
              )}
            </div>

            <div>
              <div className="mb-1">
                <Typography variant="small" className="font-medium text-gray-700">
                  Last Name <span className="text-red-500">*</span>
                </Typography>
              </div>
              <Input
                name="lastName"
                value={contact.lastName}
                onChange={(e) => handleContactChange(index, e)}
                onBlur={handleBlur}
                error={showError(`contacts[${index}].lastName`)}
                placeholder="Last name"
              />
              {showError(`contacts[${index}].lastName`) && (
                <Typography variant="small" color="red" className="mt-1">
                  {validationErrors[`contacts[${index}].lastName`]}
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
                type="email"
                name="email"
                value={contact.email}
                onChange={(e) => handleContactChange(index, e)}
                onBlur={handleBlur}
                error={showError(`contacts[${index}].email`)}
                placeholder="Email address"
              />
              {showError(`contacts[${index}].email`) && (
                <Typography variant="small" color="red" className="mt-1">
                  {validationErrors[`contacts[${index}].email`]}
                </Typography>
              )}
            </div>

            <div>
              <div className="mb-1">
                <Typography variant="small" className="font-medium text-gray-700">
                  Password <span className="text-red-500">*</span>
                </Typography>
              </div>
              <Input
                type="password"
                name="password"
                value={contact.password}
                onChange={(e) => handleContactChange(index, e)}
                onBlur={handleBlur}
                error={showError(`contacts[${index}].password`)}
                placeholder="Password"
              />
              {showError(`contacts[${index}].password`) && (
                <Typography variant="small" color="red" className="mt-1">
                  {validationErrors[`contacts[${index}].password`]}
                </Typography>
              )}
            </div>

            <div>
              <div className="mb-1">
                <Typography variant="small" className="font-medium text-gray-700">
                  Phone <span className="text-red-500">*</span>
                </Typography>
              </div>
              <Input
                type="tel"
                name="phone"
                value={contact.phone}
                onChange={(e) => handleContactChange(index, e)}
                onBlur={handleBlur}
                error={showError(`contacts[${index}].phone`)}
                placeholder="Phone number"
              />
              {showError(`contacts[${index}].phone`) && (
                <Typography variant="small" color="red" className="mt-1">
                  {validationErrors[`contacts[${index}].phone`]}
                </Typography>
              )}
            </div>
          </div>

          <div className="mt-4">
            <Typography variant="h6" className="mb-2">
              Contact Location <span className="text-red-500">*</span>
            </Typography>
            <LocationForm
              location={contact.location}
              setLocation={(loc) => {
                const newContacts = [...contacts];
                newContacts[index] = { ...newContacts[index], location: loc };
                setContacts(newContacts);
                handleContactChange(index, { 
                  target: { 
                    name: 'location', 
                    value: loc 
                  } 
                });
              }}
              locationLoading={locationLoading}
              getCurrentLocation={() => getCurrentLocation(index)}
              setLocationLoading={setLocationLoading}
            />
            {showError(`contacts[${index}].location`) && (
              <Typography variant="small" color="red" className="mt-1">
                {validationErrors[`contacts[${index}].location`]}
              </Typography>
            )}
          </div>
        </div>
      ))}

      <Button
        variant="outlined"
        color="blue"
        onClick={addContact}
        className="mt-4"
      >
        Add Another Contact
      </Button>
    </div>
  );
};

export default ContactForm;