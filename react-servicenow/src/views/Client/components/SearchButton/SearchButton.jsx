import React, { useState, useCallback } from 'react';
import { RiSearchLine, RiLoader4Line } from 'react-icons/ri';
import { IoCloseCircle } from 'react-icons/io5';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Ensure react-router-dom is installed

const SearchButton = ({ placeholder = 'Search products...', darkMode = false }) => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Function to fetch products from the API
  const searchProducts = useCallback(async (query) => {
    try {
      const response = await axios.get('http://localhost:3000/api/products', {
        params: { q: query } // Pass query as a URL parameter
      });
      // IMPORTANT: Access the 'data' array from the nested 'data' property
      return response.data.data || [];
    } catch (error) {
      console.error('Search API error:', error);
      // Return an empty array on error to prevent breaking the UI
      return [];
    }
  }, []);

  // Handler for when a product suggestion is selected
  const handleProductSelect = useCallback((product) => {
    // Navigate to the product details page using sys_id
    navigate(`/client/ProductDetails/${product.sys_id}`);
    // Reset search state
    setSearchText('');
    setSuggestions([]);
    setShowSuggestions(false);
  }, [navigate]);

  // Function to fetch and filter suggestions based on search query
  const fetchSuggestions = useCallback(async (query) => {
    setIsSearching(true);
    try {
      const products = await searchProducts(query);
      // Filter products by name or description (case-insensitive)
      const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase())
      );
      // Limit suggestions to the top 5
      setSuggestions(filteredProducts.slice(0, 5));
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]); // Clear suggestions on error
    } finally {
      setIsSearching(false); // Always stop loading animation
    }
  }, [searchProducts]);

  // Color variables based on darkMode prop for consistent theming
  const colors = {
    background: darkMode ? 'bg-[#005baa]' : 'bg-white',
    border: darkMode ? 'border-[#00c6fb]' : 'border-[#b3e0fc]',
    text: darkMode ? 'text-white' : 'text-[#005baa]',
    placeholder: darkMode ? 'placeholder-[#b3e0fc]' : 'placeholder-[#005baa]/70',
    hover: darkMode ? 'hover:bg-[#0077cc]' : 'hover:bg-[#00c6fb]',
    suggestionBg: darkMode ? 'bg-[#003e7d]' : 'bg-white',
    suggestionBorder: darkMode ? 'border-[#00c6fb]' : 'border-[#b3e0fc]',
    suggestionHover: darkMode ? 'hover:bg-[#005baa]' : 'hover:bg-[#f6f8fa]',
    suggestionText: darkMode ? 'text-[#b3e0fc]' : 'text-[#005baa]',
    buttonBg: darkMode ? 'bg-[#00c6fb]' : 'bg-[#005baa]',
    buttonHover: darkMode ? 'hover:bg-[#0077cc]' : 'hover:bg-[#003e7d]',
    closeIcon: darkMode ? 'text-[#b3e0fc]' : 'text-[#005baa]/70',
    closeIconHover: darkMode ? 'hover:text-white' : 'hover:text-[#005baa]'
  };

  return (
    <div className="relative w-full max-w-md mx-auto font-sans"> {/* Added mx-auto for centering */}
      {/* Search Input Container */}
      <div className={`relative flex items-center ${colors.background} border ${colors.border} rounded-full shadow-lg transition-all duration-300 ease-in-out hover:shadow-xl`}>
        <input
          type="text"
          className={`w-full pl-5 pr-12 py-2.5 rounded-full outline-none text-lg ${colors.text} ${colors.placeholder} bg-transparent`}
          placeholder={placeholder}
          value={searchText}
          onChange={(e) => {
            const value = e.target.value;
            setSearchText(value);
            // Fetch suggestions if query is long enough, otherwise clear them
            if (value.length > 2) {
              fetchSuggestions(value);
            } else {
              setSuggestions([]);
              setShowSuggestions(false);
            }
          }}
          // Show suggestions on focus if there's enough text
          onFocus={() => searchText.length > 2 && setSuggestions.length > 0 && setShowSuggestions(true)}
          // Hide suggestions after a short delay to allow click on suggestion
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          aria-label={placeholder}
        />
        {/* Clear Search Text Button */}
        {searchText && (
          <IoCloseCircle
            onClick={() => {
              setSearchText('');
              setSuggestions([]);
              setShowSuggestions(false);
            }}
            className={`absolute right-14 text-2xl ${colors.closeIcon} ${colors.closeIconHover} cursor-pointer transition-colors duration-200`}
            aria-label="Clear search text"
          />
        )}
        {/* Search Button */}
        <button
          onClick={() => searchText && fetchSuggestions(searchText)}
          className={`absolute right-2.5 ${colors.buttonBg} ${colors.buttonHover} text-white p-2.5 rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00c6fb]`}
          disabled={isSearching} // Disable button while searching
          aria-label="Perform search"
        >
          {isSearching ? <RiLoader4Line className="animate-spin text-xl" /> : <RiSearchLine className="text-xl" />}
        </button>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className={`absolute z-20 mt-2 w-full ${colors.suggestionBg} rounded-lg shadow-xl border ${colors.suggestionBorder} overflow-hidden`}>
          {suggestions.map((product) => (
            <div
              key={product.sys_id}
              className={`p-3 ${colors.suggestionHover} cursor-pointer group relative transition-colors duration-200`}
              // Use onMouseDown to prevent onBlur from firing before onClick
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleProductSelect(product)}
              role="option"
              aria-selected="false"
            >
              <div className={`font-semibold ${colors.suggestionText} group-hover:text-[#00c6fb] text-lg`}>
                {product.name}
              </div>
              <div className={`text-sm ${colors.suggestionText}/80 truncate mt-1`}>
                {product.description}
              </div>
              <div className={`text-sm font-bold ${colors.suggestionText} mt-1`}>
                {/* Display MRC if available, otherwise NRC, or "N/A" */}
                {product.mrc && product.mrc !== "$0.00" ? `Monthly: ${product.mrc}` : (product.nrc && product.nrc !== "$0.00" ? `One-time: ${product.nrc}` : 'Price: N/A')}
              </div>
              {/* Visual separator for suggestions */}
              <div className={`absolute bottom-0 left-0 w-full h-px ${colors.suggestionBorder} last:hidden`} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchButton;