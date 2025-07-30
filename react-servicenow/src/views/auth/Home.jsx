import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  RiSearchLine,
  RiStarFill,
  RiShoppingBagLine,
  RiShieldCheckLine,
  RiTruckLine,
  RiCustomerService2Line,
  RiSecurePaymentLine,
  RiFacebookFill,
  RiTwitterFill,
  RiInstagramFill,
  RiUser3Line,
  RiArrowRightLine,
  RiCheckboxCircleFill
} from 'react-icons/ri';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import VirtualAgentButton from "../Client/components/VirtualAgent/VirtualAgentButton";
import SearchButton from '../Client/components/SearchButton/SearchButton';
import Logo from '@assets/logo.png';

export default function OverviewPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const productsPerPage = 12;

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
    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' // Mug
  ];

  const colors = {
    primary: '#005baa',
    primaryLight: '#00c6fb',
    primaryDark: '#003e7d',
    background: '#f6f8fa',
    textDark: '#222',
    textLight: '#444',
    accent: '#b3e0fc',
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('https://proxy-servicenow.onrender.com/api/products');
        if (!response.ok) {
          throw new Error(`Failed to fetch products: ${response.statusText}`);
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
  }, []);

  const carouselSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
        }
      }
    ]
  };

  const formatPrice = (price) => {
    if (price === undefined || price === null) return '0.00';
    const priceStr = String(price).replace('$', '').trim();
    const priceNumber = Number(priceStr);
    return isNaN(priceNumber) ? '0.00' : priceNumber.toFixed(2);
  };

  const processedProducts = products.map((product, index) => ({
    ...product,
    _id: product.sys_id || `product-${index}-${Math.random().toString(36).substr(2, 9)}`,
    category: product.offering_type ? product.offering_type.toLowerCase() : 'uncategorized',
    status: product.status === 'Archived' ? 'inactive' : 'active',
    price: formatPrice(product.mrc),
    name: product.name || product.display_name || `Product ${index + 1}`,
    description: product.description || 'Discover this high-quality product, designed for durability and performance.',
    image_url: productImages[index % productImages.length]
  }));

  const categories = ['all', ...new Set(processedProducts.map(p => p.category))].map(cat => ({
    value: cat,
    label: cat.charAt(0).toUpperCase() + cat.slice(1)
  }));

  const featuredProducts = processedProducts
    .filter(p => p.status === 'active')
    .slice(0, 6);

  const filteredProducts = processedProducts.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = searchQuery === '' ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
    <div className="min-h-screen flex flex-col font-['Segoe_UI','Roboto',Arial,sans-serif] bg-[#f6f8fa] text-[#222]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] backdrop-blur-sm bg-[rgba(255,255,255,0.98)] shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
        {/* Top Bar */}
        <div className="bg-[#005baa] text-[#b3e0fc] px-4 py-1.5 text-sm flex justify-between items-center">
          <div className="flex space-x-4 items-center">
            <span className="font-medium">Welcome</span>
            <span className="w-px h-4 bg-[#00c6fb] bg-opacity-30"></span>
            <span className="flex items-center">
              <span className="inline-block w-2 h-2 rounded-full bg-[#00c6fb] mr-1.5"></span>
              <span>Online</span>
            </span>
          </div>
          <div className="flex space-x-4 items-center">
            <span>Today: {new Date().toLocaleDateString()}</span>
          </div>
        </div>

        {/* Main Header */}
        <div className="px-6 py-3 flex items-center justify-between bg-white">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-bold text-[#005baa] flex items-center">
              <img src={Logo} alt="Logo" className="h-8 mr-2" />
              OMT
            </Link>
            
            <nav className="hidden md:flex space-x-6">
              <Link 
                to="/" 
                className="text-[#005baa] hover:text-[#00c6fb] font-medium transition-colors duration-200 relative group"
              >
                Home
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#00c6fb] transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link 
                to="/contact" 
                className="text-[#005baa] hover:text-[#00c6fb] font-medium transition-colors duration-200 relative group"
              >
                Contact
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#00c6fb] transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </nav>
          </div>

          {/* User Controls */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="hidden md:block w-64">
              <SearchButton 
                placeholder="Search products..." 
                darkMode={false}
              />
            </div>

            {/* User Icon */}
            <Link 
              to="/login" 
              className="p-2 rounded-full hover:bg-[#f0f7ff] text-[#005baa] hover:text-[#00c6fb] transition-colors relative"
            >
              <RiUser3Line className="text-xl" />
            </Link>
          </div>
        </div>
      </header>
   
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
                  Curated collection of high-quality items designed to elevate your lifestyle
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link 
                    to="/products" 
                    className="bg-white text-[#005baa] hover:bg-[#f0f7ff] px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    Shop Now <RiArrowRightLine className="text-xl" />
                  </Link>
                  <Link 
                    to="/register" 
                    className="border-2 border-white text-white hover:bg-white hover:text-[#005baa] px-8 py-4 rounded-full font-bold text-lg transition-all duration-300"
                  >
                    Join Free
                  </Link>
                </div>
              </div>
              <div className="lg:w-1/2 hidden lg:block">
                <div className="grid grid-cols-2 gap-4">
                  {productImages.slice(0, 4).map((img, index) => (
                    <div 
                      key={index} 
                      className={`rounded-2xl overflow-hidden shadow-xl ${index === 0 ? 'rotate-3' : index === 1 ? '-rotate-3' : index === 2 ? '-rotate-2' : 'rotate-2'}`}
                    >
                      <img 
                        src={img} 
                        alt={`Product ${index + 1}`} 
                        className="w-full h-64 object-cover hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/concrete-wall.png')]"></div>
          </div>
        </section>

        {/* Featured Categories */}
        <section className="py-16 px-6 bg-white">
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
        <section className="py-16 px-6 bg-[#f6f8fa]">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4">
              <div>
                <h2 className="text-4xl font-bold text-[#005baa]">Featured Products</h2>
                <p className="text-[#444] mt-2">Handpicked items our customers love</p>
              </div>
              <Link 
                to="/login" 
                className="flex items-center gap-2 text-[#00c6fb] hover:text-[#005baa] font-semibold"
              >
                View all products <RiArrowRightLine />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {featuredProducts.map((product) => (
                <div 
                  key={product._id} 
                  className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-100"
                >
                  <div className="relative overflow-hidden h-60">
                    <img 
                      src={product.image_url} 
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg">
                      <RiStarFill className="text-amber-400 text-xl" />
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-[#222]">{product.name}</h3>
                      <span className="bg-[#f0f7ff] text-[#005baa] text-sm px-3 py-1 rounded-full">
                        {categories.find(c => c.value === product.category)?.label}
                      </span>
                    </div>
                    <p className="text-[#444] text-sm mb-4 line-clamp-2">{product.description}</p>
                    <span className="text-2xl font-bold text-[#005baa]">${product.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Value Proposition */}
        <section className="py-16 px-6 bg-[#005baa] text-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Why Choose Us</h2>
              <p className="text-[#b3e0fc] max-w-2xl mx-auto">
                We're committed to providing an exceptional shopping experience
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: <RiShieldCheckLine className="text-4xl mb-4" />,
                  title: "Quality Assurance",
                  description: "Every product undergoes rigorous quality checks"
                },
                {
                  icon: <RiTruckLine className="text-4xl mb-4" />,
                  title: "Fast Delivery",
                  description: "Get your items within 2-3 business days"
                },
                {
                  icon: <RiCustomerService2Line className="text-4xl mb-4" />,
                  title: "24/7 Support",
                  description: "Our team is always ready to assist you"
                },
                {
                  icon: <RiSecurePaymentLine className="text-4xl mb-4" />,
                  title: "Secure Payments",
                  description: "Your transactions are always protected"
                }
              ].map((item, index) => (
                <div 
                  key={index} 
                  className="bg-white/10 backdrop-blur-sm p-8 rounded-xl border border-white/20 hover:border-[#00c6fb]/30 transition-all duration-300"
                >
                  <div className="text-[#b3e0fc]">{item.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-[#b3e0fc]">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 text-[#005baa]">What Our Customers Say</h2>
              <p className="text-[#444] max-w-2xl mx-auto">
                Don't just take our word for it - hear from our satisfied customers
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  quote: "The quality exceeded my expectations. Will definitely shop here again!",
                  author: "Sarah Johnson",
                  rating: 5
                },
                {
                  quote: "Fast shipping and excellent customer service. Highly recommended!",
                  author: "Michael Chen",
                  rating: 5
                },
                {
                  quote: "Found exactly what I was looking for at a great price. Very happy!",
                  author: "Emma Rodriguez",
                  rating: 4
                }
              ].map((testimonial, index) => (
                <div 
                  key={index} 
                  className="bg-[#f6f8fa] p-8 rounded-xl border border-[#b3e0fc] hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <RiStarFill 
                        key={i} 
                        className={i < testimonial.rating ? "text-amber-400" : "text-gray-300"} 
                      />
                    ))}
                  </div>
                  <p className="text-[#444] italic mb-6">"{testimonial.quote}"</p>
                  <p className="font-semibold text-[#005baa]">{testimonial.author}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6 bg-gradient-to-r from-[#005baa] to-[#00c6fb] text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">Ready to Experience the Difference?</h2>
            <p className="text-xl text-[#b3e0fc] mb-10 max-w-2xl mx-auto">
              Join thousands of satisfied customers who trust us for quality products and exceptional service.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                to="/register" 
                className="bg-white text-[#005baa] hover:bg-[#f0f7ff] px-8 py-4 rounded-full font-bold text-lg transition-all duration-300"
              >
                Create Free Account
              </Link>
              <Link 
                to="/contact" 
                className="border-2 border-white text-white hover:bg-white hover:text-[#005baa] px-8 py-4 rounded-full font-bold text-lg transition-all duration-300"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#005baa] text-white pt-16 pb-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <img src={Logo} alt="Logo" className="h-8" />
                <span className="text-2xl font-bold text-white">OMT</span>
              </div>
              <p className="text-[#b3e0fc] mb-6">
                Your trusted destination for premium products and exceptional service.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-[#b3e0fc] hover:text-white transition-colors">
                  <RiFacebookFill className="text-xl" />
                </a>
                <a href="#" className="text-[#b3e0fc] hover:text-white transition-colors">
                  <RiTwitterFill className="text-xl" />
                </a>
                <a href="#" className="text-[#b3e0fc] hover:text-white transition-colors">
                  <RiInstagramFill className="text-xl" />
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-6 text-white">Shop</h3>
              <ul className="space-y-3">
                {categories.slice(0, 5).map((category) => (
                  <li key={category.value}>
                    <a 
                      href="#" 
                      className="text-[#b3e0fc] hover:text-white transition-colors flex items-center gap-2"
                    >
                      <RiArrowRightLine className="text-xs" /> {category.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-6 text-white">Company</h3>
              <ul className="space-y-3">
                {['About Us', 'Careers', 'Blog', 'Press', 'Sustainability'].map((item) => (
                  <li key={item}>
                    <a 
                      href="#" 
                      className="text-[#b3e0fc] hover:text-white transition-colors flex items-center gap-2"
                    >
                      <RiArrowRightLine className="text-xs" /> {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-6 text-white">Contact</h3>
              <address className="not-italic text-[#b3e0fc] space-y-3">
                <p>123 Commerce Street</p>
                <p>San Francisco, CA 94103</p>
                <p>Email: info@omt.com</p>
                <p>Phone: (555) 123-4567</p>
              </address>
            </div>
          </div>

          <div className="border-t border-[#003e7d] pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-[#b3e0fc] text-sm">
                &copy; {new Date().getFullYear()} OMT Platform. All rights reserved.
              </p>
              <div className="flex gap-6">
                <a href="#" className="text-[#b3e0fc] hover:text-white text-sm transition-colors">
                  Privacy Policy
                </a>
                <a href="#" className="text-[#b3e0fc] hover:text-white text-sm transition-colors">
                  Terms of Service
                </a>
                <a href="#" className="text-[#b3e0fc] hover:text-white text-sm transition-colors">
                  Cookies
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <VirtualAgentButton />
    </div>
  );
}