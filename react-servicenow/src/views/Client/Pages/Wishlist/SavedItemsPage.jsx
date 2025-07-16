import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  RiShoppingCartLine,
  RiHeartFill,
  RiArrowLeftLine,
  RiShoppingBagLine
} from 'react-icons/ri';

export default function WishlistPage() {
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};

  // Color scheme
  const colors = {
    primary: '#B45309',
    primaryLight: '#FB923C',
    primaryDark: '#B45309',
    background: '#FFF7ED'
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
          // Improved error handling for non-JSON responses
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
            _id: product.sys_id, // Ensure consistent ID
            category: product.offering_type || 'uncategorized', // Match OverviewPage
            status: product.status === 'Archived' ? 'inactive' : 'active', // Match OverviewPage
            price: formatPrice(product.mrc), // Match OverviewPage
            name: product.name || product.display_name || 'Unnamed Product', // Match OverviewPage
            description: product.description || '', // Match OverviewPage
            image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' // You might want to store the actual image URL in the product data or generate similarly to OverviewPage
          }));

        setWishlistProducts(filteredProducts);

      } catch (err) {
        console.error("Error fetching wishlist products:", err); // Log the actual error
        setError(err.message);
        setWishlistProducts([]); // Clear products on error
      } finally {
        setLoading(false);
      }
    };

    fetchWishlistProducts();
  }, [currentUser.sys_id, navigate]); // Added navigate to dependency array

  const formatPrice = (price) => {
    // Ensure the price is always treated as a number
    const priceStr = String(price).replace('$', '').trim();
    const priceNumber = Number(priceStr);
    return isNaN(priceNumber) ? '0.00' : priceNumber.toFixed(2);
  };

  const toggleWishlist = (productId) => {
    if (!productId || !currentUser?.sys_id) return;

    // Remove the product from the current wishlistProducts state
    const updatedWishlistProducts = wishlistProducts.filter(product => product.sys_id !== productId);
    setWishlistProducts(updatedWishlistProducts);

    // Update localStorage with the new wishlist (only IDs)
    const newWishlistIds = updatedWishlistProducts.map(product => product.sys_id);
    localStorage.setItem(`wishlist_${currentUser.sys_id}`, JSON.stringify(newWishlistIds));
  };

  const addToCart = async (product) => {
    // Ensure consistent product property access
    if (!product?.name || !currentUser?.sys_id) return;

    try {
      const response = await fetch('http://localhost:3000/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user: currentUser.sys_id, // Use 'user' for consistency with OverviewPage
          product_offerings: product.sys_id,
          quantity: 1,
          price: product.price, // Use 'price'
          status: 'active', // Use 'status'
          order_date: new Date().toISOString(),
          delivery_address: currentUser.address || '' // Use 'address'
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to create order');
      }
      alert(`${product.name} added to cart successfully!`); // Use 'name'

    } catch (err) {
      console.error('Error creating order:', err);
      alert(`Failed to add ${product.name} to cart. Please try again.`); // Use 'name'
    }
  };

  if (loading) {
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
          <div className="text-red-500 mb-4 text-lg font-medium">Error loading wishlist</div>
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
      {/* Header */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-700 hover:text-orange-600 transition"
          >
            <RiArrowLeftLine className="mr-2" /> Back
          </button>

          <Link
            to="/client/orders"
            className="flex items-center font-medium transition hover:opacity-80"
            style={{ color: colors.primary }}
          >
            <RiShoppingBagLine className="mr-2" />
            My Orders
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-2" style={{ color: colors.primary }}>Your Wishlist</h1>
        <p className="text-gray-600 mb-8">
          {wishlistProducts.length} {wishlistProducts.length === 1 ? 'item' : 'items'} saved
        </p>

        {wishlistProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlistProducts.map(product => (
              <div key={product.sys_id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition border border-gray-100">
                <div className="relative">
                  <img
                    src={product.image_url || 'https://via.placeholder.com/400'}
                    alt={product.name}
                    className="w-full h-48 object-cover cursor-pointer"
                    onClick={() => navigate(`/client/ProductDetails/${product.sys_id}`)}
                  />
                  <button
                    onClick={() => toggleWishlist(product.sys_id)}
                    className="absolute top-3 right-3 p-2 bg-white/80 rounded-full hover:bg-white transition"
                  >
                    <RiHeartFill className="text-red-500 text-xl" />
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
        ) : (
          <div className="text-center py-20 bg-white rounded-lg shadow-sm">
            <RiHeartFill className="mx-auto text-5xl text-red-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-700 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              You haven't saved any items to your wishlist yet. Start shopping and add your favorite items!
            </p>
            <button
              onClick={() => navigate('/client/overview')}
              className="px-6 py-2 rounded-lg hover:opacity-90 transition text-white"
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