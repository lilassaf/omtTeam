import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { RiShoppingCartLine, RiHeartLine, RiHeartFill, RiArrowLeftLine } from 'react-icons/ri';
import { IoTimeOutline, IoCheckmarkCircleOutline } from 'react-icons/io5';

const ProductDetails = () => {
  const { sys_id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  
  // Get current user from localStorage (enhanced version)
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('currentUser'));
    if (userData) {
      setCurrentUser(userData);
    }
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/products/${sys_id}`);
        setProduct(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProduct();
  }, [sys_id]);

  const handleAddToCart = async () => {
    if (!currentUser?.sys_id) {
      navigate('/login');
      return;
    }

    if (!product) return;

    setAddingToCart(true);
    try {
      const currentDate = new Date().toISOString();
      
      // Create order in the same format as the overview page
      const response = await axios.post('http://localhost:3000/orders', {
        u_user: currentUser.sys_id,
        u_product_offerings: product.sys_id,
        u_quantity: 1,
        price: product.u_price,
        u_choice: 'pending',
        u_order_date: currentDate,
        u_delivery_address: currentUser.u_address || '' // Added address like overview page
      });

      if (response.data) {
        // Show success message like overview page
        alert(`${product.u_name} added to cart successfully!`);
      }
    } catch (err) {
      console.error('Failed to add to cart:', err);
      alert(`Failed to add ${product.u_name} to cart. Please try again.`);
    } finally {
      setAddingToCart(false);
    }
  };

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    // You might want to add API call to update wishlist here
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
    </div>
  );

  if (error) return (
    <div className="text-center py-8 text-red-500">
      Error: {error}
    </div>
  );

  if (!product) return (
    <div className="text-center py-8">
      Product not found
    </div>
  );

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="bg-amber-50 min-h-screen py-8">
      <div className="container mx-auto px-4">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-amber-700 hover:text-amber-900 mb-6 transition-colors"
        >
          <RiArrowLeftLine className="mr-2" />
          Back to products
        </button>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="md:flex">
            {/* Product Image */}
            <div className="md:w-1/2 p-6 flex justify-center bg-gray-50">
              <img
                src={product.u_image_url || 'https://via.placeholder.com/500'}
                alt={product.u_name}
                className="max-h-96 object-contain rounded-lg"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/500';
                }}
              />
            </div>

            {/* Product Info */}
            <div className="md:w-1/2 p-8">
              <div className="flex justify-between items-start">
                <div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(product.u_status)}`}>
                    {product.u_status}
                  </span>
                  <h1 className="text-3xl font-bold text-amber-900 mt-2">{product.u_name}</h1>
                  <p className="text-amber-600 mt-1">{product.u_category}</p>
                </div>
                <button
                  onClick={toggleWishlist}
                  className="text-2xl text-amber-600 hover:text-amber-800 transition-colors"
                  aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                  {isWishlisted ? <RiHeartFill className="text-red-500" /> : <RiHeartLine />}
                </button>
              </div>

              <div className="mt-6">
                <span className="text-4xl font-bold text-amber-800">${product.u_price}</span>
                {product.u_unit_of_measure && (
                  <span className="text-sm text-amber-600 ml-2">per {product.u_unit_of_measure}</span>
                )}
              </div>

              <div className="mt-6">
                <h2 className="text-xl font-semibold text-amber-900">Description</h2>
                <p className="text-amber-800 mt-2">{product.u_description}</p>
              </div>

              {/* Product Meta */}
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-amber-600">Market Segment</h3>
                  <p className="text-amber-900">{product.u_market_segment || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-amber-600">Available Channels</h3>
                  <p className="text-amber-900">{product.u_channel || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-amber-600">Valid From</h3>
                  <p className="text-amber-900 flex items-center">
                    <IoTimeOutline className="mr-1" />
                    {formatDate(product.u_valid_from)}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-amber-600">Valid To</h3>
                  <p className="text-amber-900 flex items-center">
                    <IoTimeOutline className="mr-1" />
                    {formatDate(product.u_valid_to)}
                  </p>
                </div>
              </div>

              {/* Add to Cart Section */}
              <div className="mt-8 pt-6 border-t border-amber-100">
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart || product.u_status !== 'active'}
                  className={`w-full flex items-center justify-center bg-amber-600 hover:bg-amber-700 text-white py-3 px-6 rounded-lg transition-colors ${
                    addingToCart || product.u_status !== 'active' ? 'opacity-75' : ''
                  }`}
                >
                  {addingToCart ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Adding...
                    </>
                  ) : (
                    <>
                      <RiShoppingCartLine className="mr-2" />
                      {product.u_status === 'active' ? 'Add to Cart' : 'Not Available'}
                    </>
                  )}
                </button>
                {product.u_status === 'active' ? (
                  <p className="flex items-center text-green-600 mt-3">
                    <IoCheckmarkCircleOutline className="mr-1" />
                    Available and ready to ship
                  </p>
                ) : (
                  <p className="text-amber-600 mt-3">This product is currently not available for purchase</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;