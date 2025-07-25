import React, { useState } from 'react';
import { useSelector } from 'react-redux';

const ShopIcon = () => {
  const [isOpen, setIsOpen] = useState(false);
  const cartItems = useSelector(state => state.cart?.items || []);
  const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-[#047857] text-white hover:text-emerald-300 transition-colors relative"
      >
        <i className="ri-shopping-cart-2-line text-xl"></i>
        {cartItems.length > 0 && (
          <span className="absolute top-0 right-0 h-5 w-5 bg-emerald-300 text-[#065F46] text-xs font-bold rounded-full flex items-center justify-center transform translate-x-1 -translate-y-1">
            {cartItems.length > 9 ? '9+' : cartItems.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-[#065F46] rounded-lg shadow-xl border border-[#047857] z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-[#047857] bg-[#047857]">
            <h3 className="font-medium text-white">Your Cart ({cartItems.length})</h3>
          </div>
          
          <div className="max-h-96 overflow-y-auto custom-scrollbar">
            {cartItems.length > 0 ? (
              <>
                {cartItems.map(item => (
                  <div key={item.id} className="px-4 py-3 border-b border-[#047857] hover:bg-[#047857] transition-colors">
                    <div className="flex items-start">
                      <div className="w-12 h-12 bg-white rounded-md mr-3 flex items-center justify-center">
                        <i className="ri-shopping-bag-line text-[#065F46]"></i>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-white">{item.name}</h4>
                        <p className="text-sm text-emerald-200">{item.quantity} × ${item.price.toFixed(2)}</p>
                        <p className="text-xs text-emerald-300 mt-1">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="px-4 py-3 bg-[#047857] border-t border-[#047857]">
                  <div className="flex justify-between items-center">
                    <span className="text-emerald-200">Subtotal:</span>
                    <span className="font-medium text-white">${cartTotal.toFixed(2)}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="px-4 py-6 text-center">
                <i className="ri-shopping-cart-line text-3xl text-emerald-300 mb-2"></i>
                <p className="text-emerald-200">Your cart is empty</p>
              </div>
            )}
          </div>

          <div className="px-4 py-2 border-t border-[#047857] bg-[#047857] text-center">
            <a 
              href="/client/cart" 
              className="block w-full py-2 bg-emerald-300 text-[#065F46] font-medium rounded hover:bg-emerald-200 transition-colors"
            >
              {cartItems.length > 0 ? 'Proceed to Checkout' : 'Continue Shopping'}
            </a>
          </div>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #047857;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #065F46;
        }
      `}</style>
    </div>
  );
};

export default ShopIcon;