import { useState, useCallback } from 'react';
import { RiSearchLine, RiLoader4Line } from 'react-icons/ri';
import { IoCloseCircle } from 'react-icons/io5';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SearchButton = ({ placeholder = 'Search products...' }) => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const searchProducts = useCallback(async (query) => {
    try {
      const response = await axios.get('http://localhost:3000/product-offerings', {
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
        product.u_name.toLowerCase().includes(query.toLowerCase()) || 
        product.u_description.toLowerCase().includes(query.toLowerCase())
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

  return (
    <div className="relative w-full max-w-md">
      <div className="relative flex items-center bg-white border border-amber-200 rounded-full shadow-sm">
        <input
          type="text"
          className="w-full pl-4 pr-10 py-2 rounded-full outline-none text-amber-900 placeholder-amber-400"
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
            className="absolute right-10 text-amber-400 hover:text-amber-600 cursor-pointer"
          />
        )}
        <button
          onClick={() => searchText && fetchSuggestions(searchText)}
          className="absolute right-2 bg-amber-600 hover:bg-amber-700 text-white p-2 rounded-full transition-colors"
        >
          {isSearching ? <RiLoader4Line className="animate-spin" /> : <RiSearchLine />}
        </button>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg border border-amber-200">
          {suggestions.map((product) => (
            <div
              key={product.sys_id}
              className="p-2 hover:bg-amber-50 cursor-pointer group"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleProductSelect(product)}
            >
              <div className="font-medium text-amber-900 group-hover:text-amber-600">
                {product.u_name}
              </div>
              <div className="text-sm text-amber-600 truncate">
                {product.u_description}
              </div>
              <div className="text-sm font-semibold text-amber-800">
                ${product.u_price}
              </div>
              <div className="absolute inset-0 border-b border-amber-100 last:border-0" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchButton;