import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  RiShoppingCartLine, 
  RiHeartLine, 
  RiHeartFill, 
  RiStarFill,
  RiArrowLeftLine
} from 'react-icons/ri';

export default function ProductDetails() {
  const { sys_id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};

  // Color scheme
  const colors = {
    primary: '#B45309',
    primaryLight: '#FB923C',
    primaryDark: '#B45309',
    background: '#FFF7ED'
  };

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

  // Initialize wishlist from localStorage
  useEffect(() => {
    const storedWishlist = localStorage.getItem(`wishlist_${currentUser.sys_id}`);
    if (storedWishlist) {
      setWishlist(JSON.parse(storedWishlist));
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
        const response = await fetch(`https://proxy-servicenow.onrender.com/api/products`);
        if (!response.ok) {
          throw new Error('Failed to fetch product');
        }
        const data = await response.json();
        
        // Find the product with matching sys_id
        const foundProduct = data.data.find(p => p.sys_id === sys_id);
        
        if (!foundProduct) {
          throw new Error('Product not found');
        }
        
        setProduct(foundProduct);
        setError(null);
      } catch (err) {
        setError(err.message);
        setProduct(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [sys_id, currentUser.sys_id, navigate]);

  const toggleWishlist = (productId) => {
    if (!productId || !currentUser?.sys_id) return;

    const newWishlist = wishlist.includes(productId)
      ? wishlist.filter(id => id !== productId)
      : [...wishlist, productId];

    setWishlist(newWishlist);
    localStorage.setItem(`wishlist_${currentUser.sys_id}`, JSON.stringify(newWishlist));
  };

  const addToCart = async () => {
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
          price: formatPrice(product.mrc),
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

  const formatPrice = (price) => {
    if (!price) return '0.00';
    const priceStr = price.replace('$', '').trim();
    const priceNumber = Number(priceStr);
    return isNaN(priceNumber) ? '0.00' : priceNumber.toFixed(2);
  };

  const getProductStatus = () => {
    return product?.status === 'Archived' ? 'Out of Stock' : 'In Stock';
  };

  const getProductStatusClass = () => {
    return product?.status === 'Archived' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800';
  };

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
          <div className="text-red-500 mb-4 text-lg font-medium">Error loading product</div>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => navigate(-1)}
            className="px-6 py-2 rounded-lg hover:opacity-90 transition"
            style={{ backgroundColor: colors.primary, color: 'white' }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: colors.background }}>
        <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md">
          <div className="text-gray-700 mb-4 text-lg font-medium">Product not found</div>
          <button 
            onClick={() => navigate(-1)}
            className="px-6 py-2 rounded-lg hover:opacity-90 transition"
            style={{ backgroundColor: colors.primary, color: 'white' }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Process product data
  const processedProduct = {
    ...product,
    _id: product.sys_id,
    category: product.offering_type || 'uncategorized',
    status: product.status === 'Archived' ? 'inactive' : 'active',
    price: formatPrice(product.mrc),
    name: product.name || product.display_name || 'Unnamed Product',
    description: product.description || '',
    images: [productImages[Math.floor(Math.random() * productImages.length)]], // Random image
    specs: product.configuration_json ? JSON.parse(product.configuration_json) : null
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
      {/* Back button */}
      <div className="max-w-6xl mx-auto px-6 py-4">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-700 hover:text-orange-600 transition"
        >
          <RiArrowLeftLine className="mr-2" /> Back to Products
        </button>
      </div>

      {/* Product Details */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="md:flex">
            {/* Product Images */}
            <div className="md:w-1/2 p-6">
              <div className="relative h-96 mb-4 rounded-lg overflow-hidden">
                <img 
                  src={processedProduct.images[selectedImage]} 
                  alt={processedProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex gap-2">
                {processedProduct.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-16 h-16 rounded-md overflow-hidden border-2 transition ${
                      selectedImage === index 
                        ? 'border-orange-500' 
                        : 'border-transparent hover:border-gray-200'
                    }`}
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

            {/* Product Info */}
            <div className="md:w-1/2 p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {processedProduct.name}
                  </h1>
                  <div className="flex items-center mb-4">
                    <div className="flex mr-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <RiStarFill 
                          key={star} 
                          className={`text-xl ${
                            star <= 4 ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">(24 reviews)</span>
                  </div>
                </div>
                <button 
                  onClick={() => toggleWishlist(processedProduct.sys_id)}
                  className="p-2 rounded-full hover:bg-gray-100 transition"
                >
                  {wishlist.includes(processedProduct.sys_id) ? 
                    <RiHeartFill className="text-red-500 text-2xl" /> : 
                    <RiHeartLine className="text-gray-600 text-2xl hover:text-red-500" />
                  }
                </button>
              </div>

              <div className="mb-6">
                <span className={`text-xs px-2 py-1 rounded-full ${getProductStatusClass()}`}>
                  {getProductStatus()}
                </span>
              </div>

              <div className="mb-6">
                <span className="text-3xl font-bold" style={{ color: colors.primary }}>
                  ${processedProduct.price}
                </span>
                {product.nrc && product.nrc !== '$0.00' && (
                  <span className="ml-2 text-sm text-gray-500">
                    + ${formatPrice(product.nrc)} setup fee
                  </span>
                )}
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-gray-700">
                  {processedProduct.description || 'No description available.'}
                </p>
              </div>

              {/* Product Specifications */}
              {processedProduct.specs && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-3">Specifications</h3>
                  <div className="space-y-2">
                    <div className="flex">
                      <span className="w-1/3 text-gray-600">Category</span>
                      <span className="w-2/3 font-medium">{processedProduct.category}</span>
                    </div>
                    <div className="flex">
                      <span className="w-1/3 text-gray-600">Code</span>
                      <span className="w-2/3 font-medium">{product.code || 'N/A'}</span>
                    </div>
                    <div className="flex">
                      <span className="w-1/3 text-gray-600">Periodicity</span>
                      <span className="w-2/3 font-medium">{product.periodicity || 'N/A'}</span>
                    </div>
                    <div className="flex">
                      <span className="w-1/3 text-gray-600">Pricing Method</span>
                      <span className="w-2/3 font-medium">{product.pricing_method || 'N/A'}</span>
                    </div>
                    {processedProduct.specs.product?.characteristics?.map((char, index) => (
                      <div key={index} className="flex">
                        <span className="w-1/3 text-gray-600 capitalize">{char.attributes.characteristic}</span>
                        <span className="w-2/3 font-medium">
                          {char.characteristic_options?.map(opt => opt.option).join(', ') || 'N/A'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button 
                  onClick={addToCart}
                  disabled={processedProduct.status === 'inactive'}
                  className={`flex-1 py-3 rounded-lg flex items-center justify-center transition ${
                    processedProduct.status === 'inactive' 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'text-white hover:opacity-90'
                  }`}
                  style={{ backgroundColor: processedProduct.status !== 'inactive' ? colors.primary : undefined }}
                >
                  <RiShoppingCartLine className="mr-2" /> Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products (if available in the future) */}
        {/* <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 text-[#B45309]">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.map(product => (
              // Render related products here
            ))}
          </div>
        </div> */}
      </div>
    </div>
  );
}