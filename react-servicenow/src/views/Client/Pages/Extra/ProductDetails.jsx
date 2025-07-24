import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  RiShoppingCartLine,
  RiHeartLine,
  RiHeartFill,
  RiStarFill,
  RiArrowLeftLine,
  RiCheckboxCircleFill,
  RiInformationLine,
  RiTimeLine,
  RiCalendarLine,
  RiPriceTag3Line,
  RiCodeSSlashLine
} from 'react-icons/ri';

export default function ProductDetails() {
  const { sys_id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState('details');
  const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};

  // Color scheme matching the header
  const colors = {
    primary: '#005baa',
    primaryLight: '#00c6fb',
    primaryDark: '#003d7a',
    background: '#f8fafc',
    text: '#333',
    lightText: '#555'
  };

  // Product images (using the same ones you had)
  const productImages = [
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    'https://images.unsplash.com/photo-1546868871-7041f2a55e12?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
  ];

  // Initialize wishlist from localStorage
  useEffect(() => {
    if (currentUser?.sys_id) {
      const storedWishlist = localStorage.getItem(`wishlist_${currentUser.sys_id}`);
      if (storedWishlist) {
        setWishlist(JSON.parse(storedWishlist));
      }
    }
  }, [currentUser.sys_id]);

  // Fetch product details
  useEffect(() => {
    if (!currentUser?.sys_id) {
      navigate('/login');
      return;
    }

    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`http://localhost:3000/api/products`);
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        const foundProduct = data.data.find(p => p.sys_id === sys_id);
        
        if (!foundProduct) throw new Error('Product not found');
        
        setProduct(foundProduct);
        setError(null);
      } catch (err) {
        console.error("Error fetching product details:", err);
        setError(err.message);
        setProduct(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [sys_id, currentUser.sys_id, navigate]);

  // Toggle wishlist
  const toggleWishlist = useCallback((productId) => {
    if (!productId || !currentUser?.sys_id) {
      alert("Please log in to manage your wishlist.");
      return;
    }

    const newWishlist = wishlist.includes(productId)
      ? wishlist.filter(id => id !== productId)
      : [...wishlist, productId];

    setWishlist(newWishlist);
    localStorage.setItem(`wishlist_${currentUser.sys_id}`, JSON.stringify(newWishlist));
  }, [wishlist, currentUser.sys_id]);

  // Format price
  const formatPrice = (price) => {
    if (!price) return '0.00';
    const priceStr = price.replace('$', '').trim();
    const priceNumber = Number(priceStr);
    return isNaN(priceNumber) ? '0.00' : priceNumber.toFixed(2);
  };

  // Process product data
  const processedProduct = product ? {
    ...product,
    _id: product.sys_id,
    category: product.offering_type || 'Uncategorized',
    status: product.status === 'Archived' ? 'inactive' : 'active',
    price: product.mrc && product.mrc !== '$0.00' ? formatPrice(product.mrc) : formatPrice(product.nrc),
    name: product.name || product.display_name || 'Unnamed Product',
    description: product.description || 'No detailed description available.',
    images: [productImages[Math.floor(Math.random() * productImages.length)]],
    specs: product.configuration_json ? (() => {
      try {
        return JSON.parse(product.configuration_json);
      } catch (e) {
        console.error("Error parsing configuration_json:", e);
        return null;
      }
    })() : null
  } : null;

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: colors.background }}>
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4" style={{ borderColor: colors.primary }}></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: colors.background }}>
        <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
          <div className="text-red-600 mb-4 text-xl font-semibold">Error Loading Product</div>
          <p className="text-gray-700 mb-6 text-base">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-8 py-3 rounded-lg font-medium text-lg hover:opacity-90 transition-all duration-300"
            style={{ backgroundColor: colors.primary, color: 'white' }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Product not found
  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: colors.background }}>
        <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
          <div className="text-gray-800 mb-4 text-xl font-semibold">Product Not Found</div>
          <p className="text-gray-600 mb-6 text-base">The product you are looking for does not exist.</p>
          <button
            onClick={() => navigate(-1)}
            className="px-8 py-3 rounded-lg font-medium text-lg hover:opacity-90 transition-all duration-300"
            style={{ backgroundColor: colors.primary, color: 'white' }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Render product details
  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: colors.background }}>
      {/* Back button */}
      <div className="max-w-7xl mx-auto px-6 py-4 pt-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-[#005baa] hover:text-[#00c6fb] transition-colors duration-200 text-lg font-medium"
          aria-label="Back to Products"
        >
          <RiArrowLeftLine className="mr-2 text-2xl" /> Back to Products
        </button>
      </div>

      {/* Product Details Section */}
      <div className="max-w-7xl mx-auto px-6 py-8 pb-12">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <div className="md:flex">
            {/* Product Images */}
            <div className="md:w-1/2 p-8 flex flex-col items-center justify-center">
              <div className="relative w-full max-w-lg h-96 mb-6 rounded-lg overflow-hidden shadow-md border border-gray-200">
                <img
                  src={processedProduct.images[selectedImage]}
                  alt={processedProduct.name}
                  className="w-full h-full object-contain transition-transform duration-300 hover:scale-105"
                />
              </div>
              
              {/* Image thumbnails */}
              <div className="flex flex-wrap justify-center gap-3">
                {processedProduct.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-20 rounded-md overflow-hidden border-2 transition-all duration-200 focus:outline-none ${
                      selectedImage === index
                        ? 'border-[#00c6fb] ring-2 ring-[#00c6fb]'
                        : 'border-transparent hover:border-gray-200'
                    }`}
                    aria-label={`Select image ${index + 1}`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Information */}
            <div className="md:w-1/2 p-8">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-[#005baa] mb-2 leading-tight">
                    {processedProduct.name}
                  </h1>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      product.status === 'Archived' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {product.status === 'Archived' ? 'Out of Stock' : 'In Stock'}
                    </span>
                    <span className="flex items-center text-[#555]">
                      <div className="flex text-yellow-400 mr-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <RiStarFill
                            key={star}
                            className={`text-lg ${star <= 4 ? 'text-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      (24 reviews)
                    </span>
                  </div>
                </div>
                
                {/* Wishlist Button */}
                <button
                  onClick={() => toggleWishlist(processedProduct.sys_id)}
                  className="p-2 rounded-full hover:bg-[#f0f7ff] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#00c6fb]"
                  aria-label={wishlist.includes(processedProduct.sys_id) ? "Remove from wishlist" : "Add to wishlist"}
                >
                  {wishlist.includes(processedProduct.sys_id) ?
                    <RiHeartFill className="text-[#00c6fb] text-2xl" /> :
                    <RiHeartLine className="text-[#005baa] text-2xl hover:text-[#00c6fb]" />
                  }
                </button>
              </div>

              {/* Price Information */}
              <div className="mb-6 p-4 bg-[#f0f7ff] rounded-lg">
                <div className="flex items-end">
                  <span className="text-3xl font-bold text-[#005baa]">
                    ${processedProduct.price}
                  </span>
                  {product.periodicity && (
                    <span className="ml-2 text-lg font-semibold text-[#555]"> / {product.periodicity}</span>
                  )}
                </div>
                {product.nrc && product.nrc !== '$0.00' && (
                  <div className="mt-2 text-sm text-[#555]">
                    <RiPriceTag3Line className="inline mr-1 text-[#00c6fb]" />
                    One-time setup fee: ${formatPrice(product.nrc)}
                  </div>
                )}
              </div>

              {/* Key Features */}
              <div className="mb-6 grid grid-cols-2 gap-3">
                <div className="flex items-center text-sm text-[#555]">
                  <RiCheckboxCircleFill className="text-[#00c6fb] mr-2" />
                  <span>Contract: {product.contract_term || 'Not specified'}</span>
                </div>
                <div className="flex items-center text-sm text-[#555]">
                  <RiTimeLine className="text-[#00c6fb] mr-2" />
                  <span>Start date: {product.start_date || 'Not specified'}</span>
                </div>
                {product.end_date && (
                  <div className="flex items-center text-sm text-[#555]">
                    <RiCalendarLine className="text-[#00c6fb] mr-2" />
                    <span>End date: {product.end_date}</span>
                  </div>
                )}
                <div className="flex items-center text-sm text-[#555]">
                  <RiCodeSSlashLine className="text-[#00c6fb] mr-2" />
                  <span>Product code: {product.code || 'N/A'}</span>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-[#005baa] mb-3">Description</h3>
                <p className="text-[#555] leading-relaxed text-base">
                  {processedProduct.description}
                </p>
              </div>

              {/* Tabs */}
              <div className="mb-6 border-b border-gray-200">
                <div className="flex space-x-8">
                  <button
                    onClick={() => setActiveTab('details')}
                    className={`py-2 px-1 font-medium text-sm border-b-2 transition-colors duration-200 ${
                      activeTab === 'details'
                        ? 'border-[#00c6fb] text-[#005baa]'
                        : 'border-transparent text-[#555] hover:text-[#00c6fb]'
                    }`}
                  >
                    Product Details
                  </button>
                  {processedProduct.specs && (
                    <button
                      onClick={() => setActiveTab('specs')}
                      className={`py-2 px-1 font-medium text-sm border-b-2 transition-colors duration-200 ${
                        activeTab === 'specs'
                          ? 'border-[#00c6fb] text-[#005baa]'
                          : 'border-transparent text-[#555] hover:text-[#00c6fb]'
                      }`}
                    >
                      Specifications
                    </button>
                  )}
                </div>
              </div>

              {/* Tab Content */}
              <div className="mb-8">
                {activeTab === 'details' && (
                  <div className="space-y-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-[#555]">Offering Type</span>
                      <span className="text-[#005baa] font-semibold">{product.offering_type || 'N/A'}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-[#555]">Distribution Channel</span>
                      <span className="text-[#005baa] font-semibold">{product.distribution_channel || 'N/A'}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-[#555]">Pricing Method</span>
                      <span className="text-[#005baa] font-semibold">{product.pricing_method || 'N/A'}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-[#555]">Status</span>
                      <span className="text-[#005baa] font-semibold">{product.status || 'N/A'}</span>
                    </div>
                  </div>
                )}

                {activeTab === 'specs' && processedProduct.specs?.product?.characteristics?.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {processedProduct.specs.product.characteristics.map((char, index) => (
                      <div key={index} className="bg-[#f8fafc] p-3 rounded-lg">
                        <h4 className="text-sm font-medium text-[#005baa] mb-1 capitalize">
                          {char.attributes.characteristic}
                        </h4>
                        <ul className="text-sm text-[#555]">
                          {char.characteristic_options?.map((opt, optIndex) => (
                            <li key={optIndex} className="flex items-center">
                              <RiCheckboxCircleFill className="text-[#00c6fb] mr-2 text-xs" />
                              {opt.option}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'specs' && (!processedProduct.specs?.product?.characteristics?.length) && (
                  <div className="bg-[#f8fafc] p-4 rounded-lg">
                    <div className="flex items-center text-[#555]">
                      <RiInformationLine className="text-[#00c6fb] mr-2" />
                      <span>No detailed specifications available for this product.</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-6">
                <button
                  className={`flex-1 py-3 rounded-lg flex items-center justify-center text-lg font-bold transition-all duration-300 ${
                    processedProduct.status === 'inactive'
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-[#005baa] text-white hover:bg-[#00c6fb]'
                  }`}
                  disabled={processedProduct.status === 'inactive'}
                  aria-label="Add to cart"
                >
                  <RiShoppingCartLine className="mr-3 text-xl" /> Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}