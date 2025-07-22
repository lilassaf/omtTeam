import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  RiShoppingCartLine,
  RiHeartFill,
  RiArrowLeftLine,
  RiShoppingBagLine,
  RiHeartLine,RiUser3Line 
} from 'react-icons/ri';
import Logo from '@assets/logo.png';

export default function WishlistPage() {
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};

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

  useEffect(() => {
    if (!currentUser?.sys_id) {
      navigate('/login');
      return;
    }

    const fetchWishlistProducts = async () => {
      try {
        setLoading(true);

        // Get wishlist from localStorage
        const storedWishlist = localStorage.getItem(`wishlist_${currentUser.sys_id}`);
        const wishlist = storedWishlist ? JSON.parse(storedWishlist) : [];

        if (wishlist.length === 0) {
          setWishlistProducts([]);
          setLoading(false);
          return;
        }

        // Fetch all products using the same API as OverviewPage
        const productsResponse = await fetch('http://localhost:3000/api/products');
        if (!productsResponse.ok) {
          const text = await productsResponse.text();
          try {
            const errorData = JSON.parse(text);
            throw new Error(errorData.message || 'Failed to fetch products');
          } catch {
            throw new Error('Server error: Could not parse response');
          }
        }
        const productsData = await productsResponse.json();

        // Filter products that are in wishlist and process them
        const filteredProducts = (productsData.data || [])
          .filter(product => wishlist.includes(product.sys_id))
          .map(product => ({
            ...product,
            _id: product.sys_id,
            category: product.offering_type || 'uncategorized',
            status: product.status === 'Archived' ? 'inactive' : 'active',
            price: formatPrice(product.mrc),
            name: product.name || product.display_name || 'Unnamed Product',
            description: product.description || '',
            image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
          }));

        setWishlistProducts(filteredProducts);

      } catch (err) {
        console.error("Error fetching wishlist products:", err);
        setError(err.message);
        setWishlistProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlistProducts();
  }, [currentUser.sys_id, navigate]);

  const formatPrice = (price) => {
    const priceStr = String(price).replace('$', '').trim();
    const priceNumber = Number(priceStr);
    return isNaN(priceNumber) ? '0.00' : priceNumber.toFixed(2);
  };

  const toggleWishlist = (productId) => {
    if (!productId || !currentUser?.sys_id) return;

    const updatedWishlistProducts = wishlistProducts.filter(product => product.sys_id !== productId);
    setWishlistProducts(updatedWishlistProducts);

    const newWishlistIds = updatedWishlistProducts.map(product => product.sys_id);
    localStorage.setItem(`wishlist_${currentUser.sys_id}`, JSON.stringify(newWishlistIds));
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

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to create order');
      }

      // Create success notification
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
      // Create error notification
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

  if (loading) {
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
    <div className="bg-gray-50 min-h-screen py-12" style={{ backgroundColor: colors.background }}>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="max-w-10xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-[#005baa] hover:text-[#00c6fb] transition"
          >
            <RiArrowLeftLine className="mr-2" /> Back
          </button>

          <Link
            to="/client/orders"
            className="flex items-center font-medium transition hover:opacity-80 text-[#005baa] hover:text-[#00c6fb]"
          >
            <RiShoppingBagLine className="mr-2" />
            My Orders
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-2 text-[#005baa]">Your Wishlist</h1>
        <p className="text-[#444] mb-8">
          {wishlistProducts.length} {wishlistProducts.length === 1 ? 'item' : 'items'} saved
        </p>

        {wishlistProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {wishlistProducts.map(product => (
              <div 
                key={product.sys_id} 
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 border border-gray-100 group"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={product.image_url || 'https://via.placeholder.com/400'}
                    alt={product.name}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                    onClick={() => navigate(`/client/ProductDetails/${product.sys_id}`)}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(product.sys_id);
                    }}
                    className="absolute top-4 right-4 p-2 bg-white/80 rounded-full hover:bg-white transition"
                  >
                    <RiHeartFill className="text-red-500 text-xl" />
                  </button>
                  {product.status === 'inactive' && (
                    <div className="absolute top-0 left-0 bg-red-500 text-white px-3 py-1 text-xs font-bold rounded-br-lg">
                      Out of Stock
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <h2
                    className="text-lg font-semibold mb-2 cursor-pointer hover:text-[#00c6fb] transition"
                    style={{ color: colors.textDark }}
                    onClick={() => navigate(`/client/ProductDetails/${product.sys_id}`)}
                  >
                    {product.name}
                  </h2>
                  {product.category && (
                    <span className="inline-block bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full mb-3">
                      {product.category}
                    </span>
                  )}
                  <p className="text-[#444] text-sm mb-4 line-clamp-2">
                    {product.description}
                  </p>

                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-[#005baa]">
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
        ) : (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm">
            <div className="mx-auto w-20 h-20 bg-[#f0f7ff] rounded-full flex items-center justify-center mb-6">
              <RiHeartLine className="text-3xl text-[#005baa]" />
            </div>
            <h2 className="text-2xl font-bold text-[#222] mb-2">Your wishlist is empty</h2>
            <p className="text-[#444] mb-6 max-w-md mx-auto">
              You haven't saved any items to your wishlist yet. Start shopping and add your favorite items!
            </p>
            <button
              onClick={() => navigate('/client/overview')}
              className="px-6 py-3 rounded-lg hover:opacity-90 transition text-white font-medium"
              style={{ backgroundColor: colors.primary }}
            >
              Browse Products
            </button>
          </div>
        )}
      </div>
    </div>
  );
}