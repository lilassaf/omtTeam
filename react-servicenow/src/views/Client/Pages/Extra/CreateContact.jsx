import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { FaEye, FaEyeSlash, FaSyncAlt, FaCheckCircle, FaExclamationCircle, FaSpinner } from 'react-icons/fa';

const generatePassword = (options = {}) => {
  const {
    length = 12,
    includeUppercase = true,
    includeLowercase = true,
    includeNumbers = true,
    includeSymbols = true,
  } = options;

  let characters = "";
  if (includeUppercase) characters += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (includeLowercase) characters += "abcdefghijklmnopqrstuvwxyz";
  if (includeNumbers) characters += "0123456789";
  if (includeSymbols) characters += "!@#$%^&*()_+[]{}|;:,.<>?";

  if (characters.length === 0) {
    return ""; // No character types selected
  }

  let result = "";
  // Ensure at least one character from each selected type is included
  if (includeUppercase) result += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)];
  if (includeLowercase) result += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)];
  if (includeNumbers) result += "0123456789"[Math.floor(Math.random() * 10)];
  if (includeSymbols) result += "!@#$%^&*()_+[]{}|;:,.<>?"[Math.floor(Math.random() * 27)];

  // Fill the rest of the password length
  for (let i = result.length; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  // Shuffle the result to randomize character positions
  return result.split('').sort(() => 0.5 - Math.random()).join('');
};

function CreateUserForm() {
  const initialState = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    isPrimaryContact: false,
    active: true,
    archived: false,
    account: "",
    location: "",
  };

  const [formData, setFormData] = useState(initialState);
  const [locations, setLocations] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [statusMessage, setStatusMessage] = useState({ type: null, message: null });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [passwordOptions, setPasswordOptions] = useState({
    length: 12,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
  });

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [locationsRes, accountsRes] = await Promise.all([
          axios.get("http://localhost:3000/api/location"),
          axios.get("http://localhost:3000/api/account"),
        ]);
        setLocations(locationsRes.data.result || []);
        setAccounts(accountsRes.data.result || []);
      } catch (err) {
        console.error("Error fetching dropdown data:", err);
        setStatusMessage({ type: "error", message: "Failed to load necessary data (locations, accounts). Please refresh." });
      }
    };
    fetchDropdownData();
  }, []);

  const handleChange = useCallback(e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }, []);

  const handlePasswordOptionChange = useCallback(e => {
    const { name, value, type, checked } = e.target;
    setPasswordOptions(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : parseInt(value),
    }));
  }, []);

  const handleGeneratePassword = useCallback(() => {
    const newPassword = generatePassword(passwordOptions);
    setFormData(prev => ({ ...prev, password: newPassword }));
  }, [passwordOptions]);

  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage({ type: null, message: null });

    try {
      await axios.post("http://localhost:3000/api/contact", formData);
      setStatusMessage({ type: "success", message: "User created successfully! The form has been reset." });
      setFormData(initialState);
    } catch (err) {
      console.error("Error creating user:", err);
      const errorMessage = err.response?.data?.message || "Failed to create user. Please check your input and try again.";
      setStatusMessage({ type: "error", message: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = useMemo(() => {
    const password = formData.password;
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) strength += 1;

    if (strength < 3) return { label: "Weak", color: "text-red-500", barColor: "bg-red-500", width: "w-1/3" };
    if (strength < 5) return { label: "Moderate", color: "text-yellow-600", barColor: "bg-yellow-500", width: "w-2/3" };
    return { label: "Strong", color: "text-green-600", barColor: "bg-green-500", width: "w-full" };
  }, [formData.password]);

  return (
    <div className="w-full px-4 mx-auto mt-8 p-6 bg-white rounded-lg shadow-md space-y-6 font-sans">
      <h2 className="text-2xl font-bold text-[#005baa] text-center mb-4">Create New User Account</h2>
      <p className="text-center text-gray-600 mb-6">
        Fill in the details below to create a new user profile and assign them to an account and location.
      </p>

      {statusMessage.message && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          statusMessage.type === "success" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"
        }`}>
          {statusMessage.type === "success" ? <FaCheckCircle className="text-xl" /> : <FaExclamationCircle className="text-xl" />}
          <p className="font-medium">{statusMessage.message}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* User Personal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-1">First Name</label>
            <input
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="e.g., John"
              required
              className="border border-gray-300 p-2 rounded-md w-full focus:ring-2 focus:ring-[#005baa] focus:border-transparent transition duration-200 shadow-sm"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-1">Last Name</label>
            <input
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="e.g., Doe"
              required
              className="border border-gray-300 p-2 rounded-md w-full focus:ring-2 focus:ring-[#005baa] focus:border-transparent transition duration-200 shadow-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
            <input
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g., john.doe@example.com"
              type="email"
              required
              className="border border-gray-300 p-2 rounded-md w-full focus:ring-2 focus:ring-[#005baa] focus:border-transparent transition duration-200 shadow-sm"
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
            <input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="e.g., +1234567890"
              required
              className="border border-gray-300 p-2 rounded-md w-full focus:ring-2 focus:ring-[#005baa] focus:border-transparent transition duration-200 shadow-sm"
            />
          </div>
        </div>

        {/* Password Section */}
        <div className="space-y-3 p-4 border border-gray-200 rounded-md bg-gray-50">
          <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
          <div className="relative flex items-center">
            <input
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter or generate password"
              type={showPassword ? "text" : "password"}
              required
              className="border border-gray-300 p-2 rounded-md w-full pr-28 focus:ring-2 focus:ring-[#005baa] focus:border-transparent transition duration-200 shadow-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-14 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 focus:outline-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FaEyeSlash className="text-lg" /> : <FaEye className="text-lg" />}
            </button>
            <button
              type="button"
              onClick={handleGeneratePassword}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-[#005baa] text-white rounded-md text-sm hover:bg-[#004080] transition duration-200 focus:outline-none focus:ring-2 focus:ring-[#005baa]"
              aria-label="Generate password"
            >
              <FaSyncAlt />
            </button>
          </div>

          {/* Password Strength Indicator */}
          {formData.password && (
            <div className="mt-2">
              <div className="flex justify-between items-center text-xs">
                <span>Strength: <span className={`font-semibold ${passwordStrength.color}`}>{passwordStrength.label}</span></span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                <div className={`${passwordStrength.barColor} h-1.5 rounded-full ${passwordStrength.width} transition-all duration-300 ease-in-out`}></div>
              </div>
            </div>
          )}

          {/* Password Generation Options */}
          <div className="mt-3 pt-3 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Password Generation Options</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label htmlFor="passwordLength" className="block text-sm font-medium text-gray-700 mb-1">Length</label>
                <input
                  id="passwordLength"
                  type="number"
                  name="length"
                  value={passwordOptions.length}
                  onChange={handlePasswordOptionChange}
                  min="8"
                  max="32"
                  className="border border-gray-300 p-1.5 rounded-md w-full text-sm shadow-sm"
                />
              </div>
              <div className="flex flex-col gap-2 pt-1 md:pt-0">
                <label className="flex items-center cursor-pointer text-sm text-gray-700">
                  <input
                    type="checkbox"
                    name="includeUppercase"
                    checked={passwordOptions.includeUppercase}
                    onChange={handlePasswordOptionChange}
                    className="form-checkbox h-4 w-4 text-[#005baa] rounded focus:ring-[#005baa]"
                  />
                  <span className="ml-2">Include Uppercase (A-Z)</span>
                </label>
                <label className="flex items-center cursor-pointer text-sm text-gray-700">
                  <input
                    type="checkbox"
                    name="includeLowercase"
                    checked={passwordOptions.includeLowercase}
                    onChange={handlePasswordOptionChange}
                    className="form-checkbox h-4 w-4 text-[#005baa] rounded focus:ring-[#005baa]"
                  />
                  <span className="ml-2">Include Lowercase (a-z)</span>
                </label>
                <label className="flex items-center cursor-pointer text-sm text-gray-700">
                  <input
                    type="checkbox"
                    name="includeNumbers"
                    checked={passwordOptions.includeNumbers}
                    onChange={handlePasswordOptionChange}
                    className="form-checkbox h-4 w-4 text-[#005baa] rounded focus:ring-[#005baa]"
                  />
                  <span className="ml-2">Include Numbers (0-9)</span>
                </label>
                <label className="flex items-center cursor-pointer text-sm text-gray-700">
                  <input
                    type="checkbox"
                    name="includeSymbols"
                    checked={passwordOptions.includeSymbols}
                    onChange={handlePasswordOptionChange}
                    className="form-checkbox h-4 w-4 text-[#005baa] rounded focus:ring-[#005baa]"
                  />
                  <span className="ml-2">Include Symbols (!@#$)</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* User Status Flags */}
        <div className="flex flex-wrap gap-x-6 gap-y-3 p-4 border border-gray-200 rounded-md bg-gray-50">
          <label className="flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              name="isPrimaryContact"
              checked={formData.isPrimaryContact}
              onChange={handleChange}
              className="form-checkbox h-4 w-4 text-[#005baa] rounded focus:ring-[#005baa] focus:ring-offset-1"
            />
            <span className="ml-2 text-gray-700 font-medium">Primary Contact</span>
          </label>
          <label className="flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              name="active"
              checked={formData.active}
              onChange={handleChange}
              className="form-checkbox h-4 w-4 text-[#005baa] rounded focus:ring-[#005baa] focus:ring-offset-1"
            />
            <span className="ml-2 text-gray-700 font-medium">Active User</span>
          </label>
          <label className="flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              name="archived"
              checked={formData.archived}
              onChange={handleChange}
              className="form-checkbox h-4 w-4 text-[#005baa] rounded focus:ring-[#005baa] focus:ring-offset-1"
            />
            <span className="ml-2 text-gray-700 font-medium">Archived User</span>
          </label>
        </div>

        {/* Account and Location Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="location-select" className="block text-sm font-semibold text-gray-700 mb-1">Assign Location</label>
            <select
              id="location-select"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-[#005baa] focus:border-transparent transition duration-200 bg-white shadow-sm appearance-none pr-8"
            >
              <option value="">-- Select a Location --</option>
              {locations.length > 0 ? (
                locations.map(loc => (
                  <option key={loc._id} value={loc._id}>
                    {loc.name}
                  </option>
                ))
              ) : (
                <option disabled>No locations available</option>
              )}
            </select>
          </div>
          <div>
            <label htmlFor="account-select" className="block text-sm font-semibold text-gray-700 mb-1">Assign Account</label>
            <select
              id="account-select"
              name="account"
              value={formData.account}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-[#005baa] focus:border-transparent transition duration-200 bg-white shadow-sm appearance-none pr-8"
            >
              <option value="">-- Select an Account --</option>
              {accounts.length > 0 ? (
                accounts.map(acc => (
                  <option key={acc._id} value={acc._id}>
                    {acc.name}
                  </option>
                ))
              ) : (
                <option disabled>No accounts available</option>
              )}
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full px-4 py-2 bg-[#005baa] text-white font-bold rounded-md hover:bg-[#004080] transition duration-300 ease-in-out flex items-center justify-center space-x-2 shadow disabled:opacity-60 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <FaSpinner className="animate-spin" />
              <span>Creating User...</span>
            </>
          ) : (
            <>
              <span>Create User</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default CreateUserForm;