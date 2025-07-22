import { useState, useCallback } from 'react';
import { RiSearchLine, RiLoader4Line } from 'react-icons/ri';
import { IoCloseCircle } from 'react-icons/io5';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SearchButton = ({ placeholder = 'Search products...', darkMode = false }) => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const searchProducts = useCallback(async (query) => {
    try {
      const response = await axios.get('http://localhost:3000/api/products', {
        params: { q: query }
      });
      return response.data;
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  }, []);

  const handleProductSelect = (product) => {
    navigate(`/client/ProductDetails/${product.sys_id}`);
    setSearchText('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const fetchSuggestions = async (query) => {
    setIsSearching(true);
    try {
      const products = await searchProducts(query);
      // NLP-like search by filtering on name and description
      const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(query.toLowerCase()) || 
        product.description.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(filteredProducts.slice(0, 5));
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error:', error);
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Color variables based on darkMode prop
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
    <div className="relative w-full max-w-md">
      <div className={`relative flex items-center ${colors.background} border ${colors.border} rounded-full shadow-sm`}>
        <input
          type="text"
          className={`w-full pl-4 pr-10 py-2 rounded-full outline-none ${colors.text} ${colors.placeholder}`}
          placeholder={placeholder}
          value={searchText}
          onChange={(e) => {
            const value = e.target.value;
            setSearchText(value);
            if (value.length > 2) fetchSuggestions(value);
            else setSuggestions([]);
          }}
          onFocus={() => searchText.length > 2 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        />
        {searchText && (
          <IoCloseCircle
            onClick={() => setSearchText('')}
            className={`absolute right-10 ${colors.closeIcon} ${colors.closeIconHover} cursor-pointer`}
          />
        )}
        <button
          onClick={() => searchText && fetchSuggestions(searchText)}
          className={`absolute right-2 ${colors.buttonBg} ${colors.buttonHover} text-white p-2 rounded-full transition-colors`}
        >
          {isSearching ? <RiLoader4Line className="animate-spin" /> : <RiSearchLine />}
        </button>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className={`absolute z-10 mt-1 w-full ${colors.suggestionBg} rounded-md shadow-lg border ${colors.suggestionBorder}`}>
          {suggestions.map((product) => (
            <div
              key={product.sys_id}
              className={`p-2 ${colors.suggestionHover} cursor-pointer group`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleProductSelect(product)}
            >
              <div className={`font-medium ${colors.suggestionText} group-hover:text-[#00c6fb]`}>
                {product.name}
              </div>
              <div className={`text-sm ${colors.suggestionText}/70 truncate`}>
                {product.description}
              </div>
              <div className={`text-sm font-semibold ${colors.suggestionText}`}>
                ${product.price}
              </div>
              <div className={`absolute inset-0 border-b ${colors.suggestionBorder} last:border-0`} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchButton;