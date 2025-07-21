import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  RiShoppingCartLine, 
  RiHeartLine, 
  RiHeartFill, 
  RiSearchLine, 
  RiStarFill,
  RiShoppingBagLine 
} from 'react-icons/ri';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

export default function OverviewPage() {
  const [wishlist, setWishlist] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const productsPerPage = 12;
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};

  // Standard product images from the internet
  const productImages = [
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', // Watch
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', // Headphones
    'https://images.unsplash.com/photo-1546868871-7041f2a55e12?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', // Smartwatch
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', // Shoes
    'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', // Perfume
    'https://images.unsplash.com/photo-1560343090-f0409e92791a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', // Shirt
    'https://images.unsplash.com/photo-1525904097878-94fb15835963?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', // Sunglasses
    'https://images.unsplash.com/photo-1572635196237-14b3f281503f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', // Eyeglasses
    'https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', // Book
    'https://images.unsplash.com/photo-1586495777744-4413f21062fa?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', // Backpack
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', // Necklace
    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'  // Mug
  ];

  // Color scheme
  const colors = {
    primary: '#B45309',
    primaryLight: '#FB923C',
    primaryDark: '#B45309',
    background: '#FFF7ED'
  };

  // Initialize wishlist from localStorage
  useEffect(() => {
    const storedWishlist = localStorage.getItem(`wishlist_${currentUser.sys_id}`);
    if (storedWishlist) {
      setWishlist(JSON.parse(storedWishlist));
    }
  }, [currentUser.sys_id]);

  // Fetch products from API
  useEffect(() => {
    if (!currentUser?.sys_id) {
      navigate('/login');
      return;
    }
    
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('http://localhost:3000/api/products');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        setProducts(data.data || []);
        setError(null);
      } catch (err) {
        setError(err.message);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [currentUser.sys_id, navigate]);

  // Carousel settings
  const carouselSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
        }
      }
    ]
  };

  const formatPrice = (price) => {
    if (!price) return '0.00';
    const priceStr = price.replace('$', '').trim();
    const priceNumber = Number(priceStr);
    return isNaN(priceNumber) ? '0.00' : priceNumber.toFixed(2);
  };

  // Process products data with real images
  const processedProducts = products.map((product, index) => ({
    ...product,
    _id: product.sys_id,
    category: product.offering_type || 'uncategorized',
    status: product.status === 'Archived' ? 'inactive' : 'active',
    price: formatPrice(product.mrc),
    name: product.name || product.display_name || 'Unnamed Product',
    description: product.description || '',
    image_url: productImages[index % productImages.length] // Cycle through our image array
  }));

  // Extract unique categories
  const categories = ['all', ...new Set(processedProducts.map(p => p.category))];

  // Get featured products (first 6 active products)
  const featuredProducts = processedProducts
    .filter(p => p.status === 'active')
    .slice(0, 6);

  const toggleWishlist = (productId) => {
    if (!productId || !currentUser?.sys_id) return;

    const newWishlist = wishlist.includes(productId)
      ? wishlist.filter(id => id !== productId)
      : [...wishlist, productId];

    setWishlist(newWishlist);
    localStorage.setItem(`wishlist_${currentUser.sys_id}`, JSON.stringify(newWishlist));
  };

  const addToCart = async (product) => {
    if (!product?.name || !currentUser?.sys_id) return;

    try {
      const response = await fetch('http://localhost:3000/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user: currentUser.sys_id,
          product_offerings: product.sys_id,
          quantity: 1,
          price: product.price,
          status: 'active',
          order_date: new Date().toISOString(),
          delivery_address: currentUser.address || ''
        })
      });

      if (!response.ok) throw new Error('Failed to create order');
      alert(`${product.name} added to cart successfully!`);
      
    } catch (err) {
      console.error('Error creating order:', err);
      alert(`Failed to add ${product.name} to cart. Please try again.`);
    }
  };

  const filteredProducts = processedProducts.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: colors.background }}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: colors.primary }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: colors.background }}>
        <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md">
          <div className="text-red-500 mb-4 text-lg font-medium">Error loading products</div>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 rounded-lg hover:opacity-90 transition"
            style={{ backgroundColor: colors.primary, color: 'white' }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
      {/* Hero Section */}
      <div className="py-16 px-6 bg-[#B45309] text-[#FEEBC8]">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Discover Amazing Products</h1>
          <p className="text-xl mb-8">Find exactly what you're looking for from our extensive collection</p>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold mb-6 text-[#B45309]">Shop by Category</h2>
        <div className="flex flex-wrap gap-3 mb-8">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => {
                setSelectedCategory(category);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-full capitalize transition-colors ${
                selectedCategory === category
                  ? 'text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
              style={{ 
                backgroundColor: selectedCategory === category ? colors.primary : undefined,
                borderColor: selectedCategory === category ? colors.primary : undefined
              }}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search products..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
          <RiSearchLine className="absolute right-3 top-3 text-gray-400" />
        </div>
      </div>

      {/* All Products */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#B45309]">
            {selectedCategory === 'all' ? 'All Products' : selectedCategory}
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({filteredProducts.length} products)
            </span>
          </h2>
          <div className="flex items-center gap-4">
            <Link 
              to="/client/orders" 
              className="flex items-center font-medium transition hover:opacity-80"
              style={{ color: colors.primary }}
            >
              <RiShoppingBagLine className="mr-2" /> 
              My Orders
            </Link>
            <Link 
              to="/client/wishlist" 
              className="flex items-center font-medium transition hover:opacity-80"
              style={{ color: colors.primary }}
            >
              <RiHeartFill className="mr-2 text-red-500" /> 
              Wishlist ({wishlist.length})
            </Link>
          </div>
        </div>
        
        {currentProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {currentProducts.map(product => (
                <div key={product.sys_id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition border border-gray-100">
                  <div className="relative">
                    <img 
                      src={product.image_url} 
                      alt={product.name}
                      className="w-full h-48 object-cover cursor-pointer"
                      onClick={() => navigate(`/client/ProductDetails/${product.sys_id}`)}
                    />
                    <button 
                      onClick={() => toggleWishlist(product.sys_id)}
                      className="absolute top-3 right-3 p-2 bg-white/80 rounded-full hover:bg-white transition"
                    >
                      {wishlist.includes(product.sys_id) ? 
                        <RiHeartFill className="text-red-500 text-xl" /> : 
                        <RiHeartLine className="text-gray-600 text-xl hover:text-red-500" />
                      }
                    </button>
                    {product.status === 'inactive' && (
                      <div className="absolute top-0 left-0 bg-red-500 text-white px-3 py-1 text-xs font-bold">
                        Out of Stock
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h2 
                      className="text-lg font-semibold text-gray-900 mb-1 cursor-pointer hover:opacity-80 transition"
                      style={{ color: colors.primary }}
                      onClick={() => navigate(`/client/ProductDetails/${product.sys_id}`)}
                    >
                      {product.name}
                    </h2>
                    {product.category && (
                      <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded mb-2">
                        {product.category}
                      </span>
                    )}
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {product.description}
                    </p>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold" style={{ color: colors.primary }}>
                        ${product.price}
                      </span>
                      <button 
                        onClick={() => addToCart(product)}
                        disabled={product.status === 'inactive'}
                        className={`flex items-center px-3 py-1 rounded-lg transition ${
                          product.status === 'inactive' 
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                            : 'text-white hover:opacity-90'
                        }`}
                        style={{ backgroundColor: product.status !== 'inactive' ? colors.primary : undefined }}
                      >
                        <RiShoppingCartLine className="mr-1" /> Add
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-10">
                <nav className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 hover:bg-gray-100 transition"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-full transition ${
                          currentPage === pageNum
                            ? 'text-white'
                            : 'border border-gray-300 hover:bg-gray-100'
                        }`}
                        style={{ backgroundColor: currentPage === pageNum ? colors.primary : undefined }}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 hover:bg-gray-100 transition"
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <div className="text-gray-500 text-lg mb-4">No products found</div>
            <button 
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-lg hover:opacity-90 transition text-white"
              style={{ backgroundColor: colors.primary }}
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Featured Products Carousel */}
      {featuredProducts.length > 0 && (
        <div className="max-w-6xl mx-auto px-6 py-8 bg-white rounded-xl shadow-sm mb-8">
          <h2 className="text-2xl font-bold mb-6 text-[#B45309]">Featured Products</h2>
          <Slider {...carouselSettings}>
            {featuredProducts.map(product => (
              <div key={product.sys_id} className="px-2">
                <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition">
                  <div className="relative">
                    <img 
                      src={product.image_url} 
                      alt={product.name}
                      className="w-full h-48 object-cover cursor-pointer"
                      onClick={() => navigate(`/client/ProductDetails/${product.sys_id}`)}
                    />
                    <button 
                      onClick={() => toggleWishlist(product.sys_id)}
                      className="absolute top-3 right-3 p-2 bg-white/80 rounded-full hover:bg-white transition"
                    >
                      {wishlist.includes(product.sys_id) ? 
                        <RiHeartFill className="text-red-500 text-xl" /> : 
                        <RiHeartLine className="text-gray-600 text-xl hover:text-red-500" />
                      }
                    </button>
                    {product.status === 'inactive' && (
                      <div className="absolute top-0 left-0 bg-red-500 text-white px-3 py-1 text-xs font-bold">
                        Out of Stock
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h2 className="text-lg font-semibold text-gray-900 mb-1">
                      {product.name}
                    </h2>
                    <div className="flex items-center mb-2">
                      <RiStarFill className="text-yellow-400 mr-1" />
                      <span className="text-sm text-gray-600">4.8 (120)</span>
                    </div>
                    <div className="text-lg font-bold mb-3" style={{ color: colors.primary }}>
                      ${product.price}
                    </div>
                    <button 
                      onClick={() => addToCart(product)}
                      disabled={product.status === 'inactive'}
                      className={`w-full py-2 rounded-lg flex items-center justify-center transition ${
                        product.status === 'inactive' 
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                          : 'text-white hover:opacity-90'
                      }`}
                      style={{ backgroundColor: product.status !== 'inactive' ? colors.primary : undefined }}
                    >
                      <RiShoppingCartLine className="mr-2" /> Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      )}
    </div>
  );
}