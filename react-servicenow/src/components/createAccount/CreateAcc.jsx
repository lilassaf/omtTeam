import React, { useState, useCallback, useMemo, useRef } from "react";
import { useDispatch } from "react-redux";
import { useSearchParams } from 'react-router-dom';
import { createAccount } from "../../features/auth/authActions";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Checkbox,
  Alert,
  Tooltip
} from "@material-tailwind/react";
import AccountForm from "./AccountForm";
import ContactForm from "./ContactForm";
import { validateField, validateAllFields } from "./validation";

const API_URL = import.meta.env.VITE_BACKEND_URL;

const CreateAcc = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const formRef = useRef();

  const [activeTab, setActiveTab] = useState("account");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile_phone: "",
  });

  const [contacts, setContacts] = useState([{
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    location: null,
  }]);

  const dispatch = useDispatch();

  const markFieldAsTouched = useCallback((fieldName) => {
    setTouchedFields(prev => ({ ...prev, [fieldName]: true }));
  }, []);

  const validateCurrentField = useCallback((name, value, contactIndex = null) => {
    const context = { formData, agreed, contacts };
    const fieldErrors = validateField(name, value, context, contactIndex);
    
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      if (Object.keys(fieldErrors).length === 0) {
        delete newErrors[name];
      } else {
        newErrors[name] = fieldErrors[name];
      }
      return newErrors;
    });
    
    return fieldErrors;
  }, [formData, agreed, contacts]);

  const validateAllFormFields = useCallback(() => {
    const context = { formData, agreed, contacts };
    const errors = validateAllFields(context);
    setValidationErrors(errors);

    const allTouched = {};
    Object.keys(formData).forEach(field => allTouched[field] = true);
    contacts.forEach((_, index) => {
      ['firstName', 'lastName', 'email', 'phone', 'password', 'location'].forEach(field => {
        allTouched[`contacts[${index}].${field}`] = true;
      });
    });
    allTouched.agreed = true;
    setTouchedFields(allTouched);

    return Object.keys(errors).length === 0;
  }, [formData, agreed, contacts]);

  const getMissingRequirements = useMemo(() => {
    const missing = [];
    
    if (!formData.name.trim()) missing.push("Full Name");
    if (!formData.email.trim()) missing.push("Email");
    if (!formData.mobile_phone.trim()) missing.push("Mobile Phone");
    if (!agreed) missing.push("Agreement to Terms");
    
    contacts.forEach((contact, index) => {
      const contactPrefix = index === 0 ? "Primary Contact" : `Contact ${index + 1}`;
      if (!contact.firstName.trim()) missing.push(`${contactPrefix} First Name`);
      if (!contact.lastName.trim()) missing.push(`${contactPrefix} Last Name`);
      if (!contact.email.trim()) missing.push(`${contactPrefix} Email`);
      if (!contact.phone.trim()) missing.push(`${contactPrefix} Phone`);
      if (!contact.password.trim()) missing.push(`${contactPrefix} Password`);
      if (!contact.location) missing.push(`${contactPrefix} Location`);
    });

    return missing;
  }, [formData, agreed, contacts]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    markFieldAsTouched(name);
    validateCurrentField(name, value);
  }, [markFieldAsTouched, validateCurrentField]);

  const handleContactChange = useCallback((index, e) => {
    const { name, value } = e.target;
    setContacts(prev => {
      const newContacts = [...prev];
      newContacts[index] = { ...newContacts[index], [name]: value };
      return newContacts;
    });
    markFieldAsTouched(`contacts[${index}].${name}`);
    validateCurrentField(`contacts[${index}].${name}`, value, index);
  }, [markFieldAsTouched, validateCurrentField]);

  const handleBlur = useCallback((e) => {
    const { name, value } = e.target;
    markFieldAsTouched(name);
    validateCurrentField(name, value);
  }, [markFieldAsTouched, validateCurrentField]);

  const handleAgreedChange = useCallback((e) => {
    const checked = e.target.checked;
    setAgreed(checked);
    markFieldAsTouched('agreed');
    validateCurrentField('agreed', checked);
  }, [markFieldAsTouched, validateCurrentField]);

  const getCurrentLocation = useCallback(async (contactIndex = 0) => {
    setError("");
    setLocationLoading(true);
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[`contacts[${contactIndex}].location`];
      return newErrors;
    });

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch location data');
      }
      
      const data = await response.json();

      const newLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        road: data.address?.road || '',
        city: data.address?.city || data.address?.town || data.address?.village || '',
        state: data.address?.state || '',
        country: data.address?.country || '',
        postcode: data.address?.postcode || '',
      };

      setContacts(prev => {
        const updated = [...prev];
        updated[contactIndex] = { 
          ...updated[contactIndex], 
          location: newLocation 
        };
        return updated;
      });

      handleContactChange(contactIndex, { 
        target: { 
          name: 'location', 
          value: newLocation 
        } 
      });

    } catch (error) {
      console.error("Location error:", error);
      const errorMessage = "Could not get your location. Please select manually.";
      setValidationErrors(prev => ({
        ...prev,
        [`contacts[${contactIndex}].location`]: errorMessage,
      }));
    } finally {
      setLocationLoading(false);
    }
  }, [handleContactChange]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!validateAllFormFields()) {
      setLoading(false);
      return;
    }

    const payload = {
      ...formData,
      contacts: contacts.map(contact => ({
        ...contact,
        location: contact.location ? {
          latitude: contact.location.latitude,
          longitude: contact.location.longitude,
          address: contact.location.road,
          city: contact.location.city,
          state: contact.location.state,
          country: contact.location.country,
          postalCode: contact.location.postcode,
        } : null
      })),
      token: token || null
    };

    try {
      await dispatch(createAccount(payload)).unwrap();
      setSuccess("Please check your email to confirm the creation of your account");
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [formData, contacts, validateAllFormFields, dispatch, token]);

  const isFormValid = useMemo(() => {
    return Object.keys(validationErrors).length === 0 &&
      formData.name.trim() &&
      formData.email.trim() &&
      formData.mobile_phone.trim() &&
      agreed &&
      contacts.every(contact =>
        contact.firstName.trim() &&
        contact.lastName.trim() &&
        contact.email.trim() &&
        contact.phone.trim() &&
        contact.password.trim() &&
        contact.location
      );
  }, [formData, agreed, contacts, validationErrors]);

  // Separate account errors from contact errors
  const accountErrors = {
    name: validationErrors.name,
    email: validationErrors.email,
    mobile_phone: validationErrors.mobile_phone
  };

  const contactErrors = Object.fromEntries(
    Object.entries(validationErrors)
      .filter(([key]) => key.startsWith('contacts['))
  );

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
      <Card className="w-full max-w-3xl shadow-lg rounded-xl overflow-hidden">
        <CardHeader floated={false} shadow={false} className="text-center p-8 bg-gradient-to-r from-blue-600 to-blue-400">
          <Typography variant="h3" color="white" className="mb-2 font-bold">
            Create Your Account
          </Typography>
          <Typography color="white" className="font-normal text-blue-100">
            Join our platform in just a few simple steps
          </Typography>
        </CardHeader>

        <form onSubmit={handleSubmit} ref={formRef}>
          <CardBody className="flex flex-col gap-6 p-8">
            {error && <Alert color="red" className="mb-4">{error}</Alert>}

            <div className="mb-6 grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setActiveTab("account")}
                className={`p-4 rounded-lg transition-all ${
                  activeTab === "account" 
                    ? "bg-blue-500 text-white shadow-md" 
                    : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                }`}
              >
                <Typography variant="h6" className="font-medium">
                  Account Info
                </Typography>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("contacts")}
                className={`p-4 rounded-lg transition-all ${
                  activeTab === "contacts" 
                    ? "bg-blue-500 text-white shadow-md" 
                    : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                }`}
              >
                <Typography variant="h6" className="font-medium">
                  Contacts
                </Typography>
              </button>
            </div>

            {activeTab === "account" && (
              <AccountForm
                formData={formData}
                handleChange={handleChange}
                handleBlur={handleBlur}
                validationErrors={accountErrors}
                touchedFields={touchedFields}
              />
            )}

            {activeTab === "contacts" && (
              <ContactForm
                contacts={contacts}
                setContacts={setContacts}
                validationErrors={contactErrors}
                touchedFields={touchedFields}
                getCurrentLocation={getCurrentLocation}
                locationLoading={locationLoading}
                setLocationLoading={setLocationLoading}
                handleContactChange={handleContactChange}
                handleBlur={handleBlur}
              />
            )}

            {/* Show account errors when on account tab */}
            {activeTab === "account" && Object.values(accountErrors).some(Boolean) && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <Typography variant="h6" color="red" className="font-medium mb-2">
                  Please fix the following errors:
                </Typography>
                <ul className="list-disc pl-5 space-y-1">
                  {Object.entries(accountErrors).map(([field, error]) => (
                    error && (
                      <li key={field}>
                        <Typography variant="small" color="red">
                          {error}
                        </Typography>
                      </li>
                    )
                  ))}
                </ul>
              </div>
            )}

            {/* Show contact errors when on contacts tab */}
            {activeTab === "contacts" && Object.values(contactErrors).some(Boolean) && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <Typography variant="h6" color="red" className="font-medium mb-2">
                  Please fix the following errors:
                </Typography>
                <ul className="list-disc pl-5 space-y-1">
                  {Object.entries(contactErrors).map(([field, error]) => (
                    error && (
                      <li key={field}>
                        <Typography variant="small" color="red">
                          {error}
                        </Typography>
                      </li>
                    )
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-col gap-1 mt-4">
              <div className="flex items-start gap-2">
                <Checkbox
                  checked={agreed}
                  onChange={handleAgreedChange}
                  ripple={false}
                  containerProps={{ className: "mt-1" }}
                  className={validationErrors.agreed ? 'border-red-500' : ''}
                  label={
                    <Typography variant="small" className="font-normal">
                      I agree to the terms and conditions
                    </Typography>
                  }
                />
              </div>
              {validationErrors.agreed && (
                <Typography variant="small" color="red" className="ml-8 mt-1">
                  {validationErrors.agreed}
                </Typography>
              )}
            </div>

            <div className="mt-4">
              <Tooltip
                content={
                  <div className="p-2">
                    <Typography variant="small" color="white" className="font-medium">
                      Missing Requirements:
                    </Typography>
                    <ul className="list-disc pl-5 mt-1">
                      {getMissingRequirements.map((req, index) => (
                        <li key={index}>
                          <Typography variant="small" color="white">
                            {req}
                          </Typography>
                        </li>
                      ))}
                    </ul>
                  </div>
                }
                placement="top"
                open={!isFormValid ? undefined : false}
              >
                <div className="w-full">
                  <Button
                    type="submit"
                    color="blue"
                    disabled={!isFormValid || loading}
                    fullWidth
                  >
                    {loading ? "Registering..." : "Register"}
                  </Button>
                </div>
              </Tooltip>

              {/* Success message with green styling */}
              {success && (
                <div className="mt-4 p-4 rounded-lg bg-green-50 border-l-4 border-green-500">
                  <Typography variant="small" className="font-medium text-green-800">
                    {success}
                  </Typography>
                </div>
              )}
            </div>
          </CardBody>
        </form>
      </Card>
    </div>
  );
};

export default CreateAcc;