import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  RiShoppingCartLine, 
  RiHeartLine, 
  RiHeartFill, 
  RiSearchLine, 
  RiStarFill,
  RiShoppingBagLine,
  RiArrowRightLine,
  RiCheckboxCircleFill,
  RiShieldCheckLine,
  RiTruckLine,
  RiCustomerService2Line,
  RiSecurePaymentLine,
  RiFacebookFill,
  RiTwitterFill,
  RiInstagramFill,
  RiUser3Line
} from 'react-icons/ri';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Logo from '@assets/logo.png';

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

  // Color scheme from the first example
  const colors = {
    primary: '#005baa',
    primaryLight: '#00c6fb',
    primaryDark: '#003e7d',
    background: '#f6f8fa',
    textDark: '#222',
    textLight: '#444',
    accent: '#b3e0fc',
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
    autoplay: true,
    autoplaySpeed: 3000,
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
    description: product.description || 'Premium quality product with excellent features',
    image_url: productImages[index % productImages.length] // Cycle through our image array
  }));

  // Extract unique categories
  const categories = ['all', ...new Set(processedProducts.map(p => p.category))].map(cat => ({
    value: cat,
    label: cat.charAt(0).toUpperCase() + cat.slice(1)
  }));

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
      
      // Show success notification
      const notification = document.createElement('div');
      notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in';
      notification.innerHTML = `
        <RiCheckboxCircleFill class="text-xl" />
        <span>${product.name} added to cart!</span>
      `;
      document.body.appendChild(notification);
      setTimeout(() => {
        notification.classList.add('animate-fade-out');
        setTimeout(() => notification.remove(), 300);
      }, 3000);
      
    } catch (err) {
      console.error('Error creating order:', err);
      // Show error notification
      const notification = document.createElement('div');
      notification.className = 'fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in';
      notification.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        <span>Failed to add ${product.name} to cart</span>
      `;
      document.body.appendChild(notification);
      setTimeout(() => {
        notification.classList.add('animate-fade-out');
        setTimeout(() => notification.remove(), 300);
      }, 3000);
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
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4" style={{ borderColor: colors.primary }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: colors.background }}>
        <div className="text-center p-8 bg-white rounded-xl shadow-2xl max-w-lg mx-auto">
          <div className="text-red-600 mb-5 text-2xl font-bold">Oops! Something went wrong.</div>
          <p className="text-gray-700 mb-8 leading-relaxed">{error}. Please try refreshing the page or check your network connection.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 rounded-lg font-bold text-white shadow-lg hover:opacity-90 transition transform hover:scale-105"
            style={{ backgroundColor: colors.primary }}
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-['Segoe_UI','Roboto',Arial,sans-serif]">
 
   
      {/* Main Content */}
      <main className="flex-grow">
        {/* Hero Section with Gradient */}
        <section className="relative bg-gradient-to-r from-[#005baa] to-[#00c6fb] text-white py-20 px-6 overflow-hidden">
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="lg:w-1/2 space-y-8">
                <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                  Discover <span className="text-[#b3e0fc]">Premium</span> Products
                </h1>
                <p className="text-xl md:text-2xl text-[#b3e0fc] max-w-lg">
                  Curated collection of high-quality items designed 
                </p>
            
              </div>
            
            </div>
          </div>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/concrete-wall.png')]"></div>
          </div>
        </section>

        {/* Featured Categories */}
        <section className="py-16 px-6 ">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-4xl font-bold mb-4 text-[#005baa]">Shop by Category</h2>
              <p className="text-lg text-[#444] max-w-2xl mx-auto">
                Explore our carefully curated collections tailored to your needs
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {categories.slice(0, 4).map((category) => (
                <div 
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className="group relative overflow-hidden rounded-xl shadow-lg cursor-pointer h-64"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-[#005baa]/90 to-transparent z-10"></div>
                  <img 
                    src={productImages[categories.indexOf(category) % productImages.length]} 
                    alt={category.label}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute bottom-0 left-0 p-6 z-20">
                    <h3 className="text-2xl font-bold text-white">{category.label}</h3>
                    <p className="text-[#b3e0fc] flex items-center gap-1 mt-2">
                      Explore <RiArrowRightLine className="group-hover:translate-x-1 transition-transform" />
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products - Card Style */}
        {featuredProducts.length > 0 && (
          <section className="py-16 px-6 ">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4">
                <div>
                  <h2 className="text-4xl font-bold text-[#005baa]">Featured Products</h2>
                  <p className="text-[#444] mt-2">Handpicked items our customers love</p>
                </div>
                <Link 
                  to="/products" 
                  className="flex items-center gap-2 text-[#00c6fb] hover:text-[#005baa] font-semibold"
                >
                  View all products <RiArrowRightLine />
                </Link>
              </div>

              <Slider {...carouselSettings}>
                {featuredProducts.map(product => (
                  <div key={product._id} className="px-4">
                    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300">
                      <div className="relative group">
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                          onClick={() => navigate(`/client/ProductDetails/${product._id}`)}
                        />
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWishlist(product._id);
                          }}
                          className="absolute top-4 right-4 p-2 bg-white/80 rounded-full hover:bg-white transition"
                        >
                          {wishlist.includes(product._id) ? 
                            <RiHeartFill className="text-red-500 text-xl" /> : 
                            <RiHeartLine className="text-gray-600 text-xl hover:text-red-500" />
                          }
                        </button>
                        {product.status === 'inactive' && (
                          <div className="absolute top-0 left-0 bg-red-500 text-white px-3 py-1 text-xs font-bold rounded-br-lg">
                            Out of Stock
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                          <h3 className="text-white font-semibold text-lg">{product.name}</h3>
                          <div className="flex items-center">
                            <RiStarFill className="text-amber-400 mr-1" />
                            <span className="text-white text-sm">4.8 (120)</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-5">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-2xl font-bold" style={{ color: colors.primary }}>
                            ${product.price}
                          </span>
                          <button 
                            onClick={() => addToCart(product)}
                            disabled={product.status === 'inactive'}
                            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${
                              product.status === 'inactive' 
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                : 'text-white hover:opacity-90'
                            }`}
                            style={{ backgroundColor: product.status !== 'inactive' ? colors.primary : undefined }}
                          >
                            <RiShoppingCartLine /> Add
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </Slider>
            </div>
          </section>
        )}

        {/* All Products Section */}
        <section className="py-16 px-6 ">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center mb-12">
              <div>
                <h2 className="text-3xl font-bold mb-2" style={{ color: colors.primary }}>
                  {selectedCategory === 'all' ? 'All Products' : categories.find(c => c.value === selectedCategory)?.label}
                </h2>
                <p className="text-lg text-[#444]">
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'} found
                </p>
              </div>
              
              <div className="relative mt-4 md:mt-0 w-full md:w-64">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-4 pr-10 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                />
                <RiSearchLine className="absolute right-3 top-2.5 text-gray-500" />
              </div>
            </div>

            {currentProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {currentProducts.map(product => (
                    <div 
                      key={product._id} 
                      className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 border border-gray-100 group"
                    >
                      <div className="relative overflow-hidden">
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                          onClick={() => navigate(`/client/ProductDetails/${product._id}`)}
                        />
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWishlist(product._id);
                          }}
                          className="absolute top-4 right-4 p-2 bg-white/80 rounded-full hover:bg-white transition"
                        >
                          {wishlist.includes(product._id) ? 
                            <RiHeartFill className="text-red-500 text-xl" /> : 
                            <RiHeartLine className="text-gray-600 text-xl hover:text-red-500" />
                          }
                        </button>
                        {product.status === 'inactive' && (
                          <div className="absolute top-0 left-0 bg-red-500 text-white px-3 py-1 text-xs font-bold rounded-br-lg">
                            Out of Stock
                          </div>
                        )}
                      </div>
                      
                      <div className="p-5">
                        <h3 
                          className="text-xl font-semibold mb-2 cursor-pointer hover:text-blue-600 transition"
                          style={{ color: colors.textDark }}
                          onClick={() => navigate(`/client/ProductDetails/${product._id}`)}
                        >
                          {product.name}
                        </h3>
                        {product.category && (
                          <span className="inline-block bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full mb-3">
                            {categories.find(c => c.value === product.category)?.label}
                          </span>
                        )}
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {product.description}
                        </p>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-xl font-bold" style={{ color: colors.primary }}>
                            ${product.price}
                          </span>
                          <button 
                            onClick={() => addToCart(product)}
                            disabled={product.status === 'inactive'}
                            className={`px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm transition ${
                              product.status === 'inactive' 
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                : 'text-white hover:opacity-90'
                            }`}
                            style={{ backgroundColor: product.status !== 'inactive' ? colors.primary : undefined }}
                          >
                            <RiShoppingCartLine /> Add
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-16">
                    <nav className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-100 transition text-gray-700"
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
                            className={`w-10 h-10 rounded-full font-medium transition ${
                              currentPage === pageNum
                                ? 'text-white'
                                : 'border border-gray-300 hover:bg-gray-100 text-gray-700'
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
                        className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-100 transition text-gray-700"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                <div className="text-gray-500 text-xl mb-6">No products found matching your criteria</div>
                <button 
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                  }}
                  className="px-6 py-3 rounded-lg hover:opacity-90 transition text-white font-medium"
                  style={{ backgroundColor: colors.primary }}
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </section>

       
      </main>

     
    </div>
  );
}