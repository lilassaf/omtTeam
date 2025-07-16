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

        // Fetch all products
        const productsResponse = await fetch('http://localhost:3000/product-offerings');
        if (!productsResponse.ok) {
          const text = await productsResponse.text();
          throw new Error(text.startsWith('<!DOCTYPE') ? 'Server error' : text);
        }
        const productsData = await productsResponse.json();

        // Filter products that are in wishlist
        const filteredProducts = productsData
          .filter(product => wishlist.includes(product.sys_id))
          .map(product => ({
            ...product,
            u_price: formatPrice(product.u_price),
            u_name: product.u_name || 'Unnamed Product',
            u_description: product.u_description || ''
          }));

        setWishlistProducts(filteredProducts);
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlistProducts();
  }, [currentUser.sys_id, navigate]);

  const formatPrice = (price) => {
    const priceNumber = Number(price);
    return isNaN(priceNumber) ? '0.00' : priceNumber.toFixed(2);
  };

  const toggleWishlist = (productId) => {
    if (!productId || !currentUser?.sys_id) return;

    const newWishlist = wishlistProducts
      .filter(product => product.sys_id !== productId)
      .map(product => product.sys_id);

    setWishlistProducts(wishlistProducts.filter(product => product.sys_id !== productId));
    localStorage.setItem(`wishlist_${currentUser.sys_id}`, JSON.stringify(newWishlist));
  };

  const addToCart = async (product) => {
    if (!product?.u_name || !currentUser?.sys_id) return;

    try {
      const response = await fetch('http://localhost:3000/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          u_user: currentUser.sys_id,
          u_product_offerings: product.sys_id,
          u_quantity: 1,
          u_price: product.u_price,
          u_choice: 'pending',
          u_status: 'active',
          u_order_date: new Date().toISOString(),
          u_delivery_address: currentUser.u_address || ''
        })
      });

      if (!response.ok) throw new Error('Failed to create order');
      alert(`${product.u_name} added to cart successfully!`);
      
    } catch (err) {
      console.error('Error creating order:', err);
      alert(`Failed to add ${product.u_name} to cart. Please try again.`);
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
                    src={product.u_image_url || 'https://via.placeholder.com/400'} 
                    alt={product.u_name}
                    className="w-full h-48 object-cover cursor-pointer"
                    onClick={() => navigate(`/client/ProductDetails/${product.sys_id}`)}
                  />
                  <button 
                    onClick={() => toggleWishlist(product.sys_id)}
                    className="absolute top-3 right-3 p-2 bg-white/80 rounded-full hover:bg-white transition"
                  >
                    <RiHeartFill className="text-red-500 text-xl" />
                  </button>
                  {product.u_status === 'inactive' && (
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
                    {product.u_name}
                  </h2>
                  {product.u_category && (
                    <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded mb-2">
                      {product.u_category}
                    </span>
                  )}
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {product.u_description}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold" style={{ color: colors.primary }}>
                      ${product.u_price}
                    </span>
                    <button 
                      onClick={() => addToCart(product)}
                      disabled={product.u_status === 'inactive'}
                      className={`flex items-center px-3 py-1 rounded-lg transition ${
                        product.u_status === 'inactive' 
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                          : 'text-white hover:opacity-90'
                      }`}
                      style={{ backgroundColor: product.u_status !== 'inactive' ? colors.primary : undefined }}
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