import { useState, useEffect, useRef } from 'react';
import { RiSendPlaneLine, RiRobot2Line, RiCloseLine, RiAlertLine, RiEmotionLine, RiImageLine, RiUserLine, RiBuildingLine, RiMapPinLine, RiFileListLine, RiBriefcaseLine, RiCalendarLine, RiSmartphoneLine, RiMailLine, RiLockLine, RiHistoryLine } from 'react-icons/ri';

export default function VirtualAgent({ onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const [accountData, setAccountData] = useState(null);
  const [locationData, setLocationData] = useState(null);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [orderHistory, setOrderHistory] = useState(null);

  // Auto-scroll on message update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize conversation and fetch user data
  useEffect(() => {
    // Initialize with welcome message
    setMessages([{ 
      from: 'agent', 
      text: "👋 Welcome to our Client Support! How can we help you today?",
      options: [
        { text: '🛍️ Product Questions', value: 'products' },
        { text: '📦 Order Status', value: 'orders' },
        { text: '💳 Payment Issues', value: 'payment' },
        { text: '📝 Return Policy', value: 'returns' },
        { text: '🚚 Shipping Info', value: 'shipping' },
        { text: '👤 My Account Info', value: 'account_info' }
      ]
    }]);

    // Fetch current user data
    const fetchUserData = async () => {
      try {
        const userData = localStorage.getItem('currentUser');
        if (!userData) return;
        
        const parsedUser = JSON.parse(userData);
        setUserData(parsedUser);

        // Fetch account data if available
        if (parsedUser.accountId) {
          const accountRes = await fetch(`http://localhost:3000/api/account/${parsedUser.accountId}`);
          const accountData = await accountRes.json();
          setAccountData(accountData);
        }

        // Fetch location data if available
        if (parsedUser.location) {
          const locationRes = await fetch(`http://localhost:3000/api/location/${parsedUser.location}`);
          const locationData = await locationRes.json();
          setLocationData(locationData);
        }

        // Fetch order history if available
        if (parsedUser.userId) {
          const ordersRes = await fetch(`http://localhost:3000/api/orders?userId=${parsedUser.userId}`);
          const ordersData = await ordersRes.json();
          setOrderHistory(ordersData);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user information');
      }
    };

    fetchUserData();
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setAttachment({
          type: 'image',
          url: reader.result
        });
      };
      reader.readAsDataURL(file);
    } else {
      setError('Only image files are supported');
    }
  };

  const addEmoji = (emoji) => {
    setInput(prev => prev + emoji);
  };

  const generateResponse = (userInput) => {
    setIsLoading(true);
    setError(null);
    
    // Simulate processing delay
    setTimeout(() => {
      try {
        let response = {};
        
        switch (userInput.toLowerCase()) {
          case 'products':
            response = {
              from: 'agent',
              text: "We offer a wide range of products. Could you be more specific about what you're looking for?",
              options: [
                { text: '📱 Electronics', value: 'electronics' },
                { text: '👕 Clothing', value: 'clothing' },
                { text: '🏠 Home Goods', value: 'home' },
                { text: '🔙 Main Menu', value: 'menu' }
              ]
            };
            break;
            
          case 'orders':
            response = {
              from: 'agent',
              text: "For order status, please provide your order number. Here's your recent order history:",
              options: [
                { text: '📋 View Full Order History', value: 'history' },
                { text: '📞 Contact Support', value: 'support' },
                { text: '🔙 Main Menu', value: 'menu' }
              ]
            };
            break;
            
          case 'payment':
            response = {
              from: 'agent',
              text: "We accept all major credit cards, PayPal, and bank transfers. If you're having payment issues, please check your payment details or try another method.",
              options: [
                { text: '💳 Payment Methods', value: 'methods' },
                { text: '❓ Failed Payment', value: 'failed' },
                { text: '🔙 Main Menu', value: 'menu' }
              ]
            };
            break;
            
          case 'returns':
            response = {
              from: 'agent',
              text: "Our return policy allows returns within 30 days of purchase. Items must be unused with original packaging. Would you like to initiate a return?",
              options: [
                { text: '🔄 Start Return', value: 'start_return' },
                { text: '📦 Return Status', value: 'return_status' },
                { text: '🔙 Main Menu', value: 'menu' }
              ]
            };
            break;
            
          case 'shipping':
            response = {
              from: 'agent',
              text: "We offer standard (3-5 days), express (2 days), and next-day shipping options. Shipping costs vary based on weight and destination.",
              options: [
                { text: '📦 Track Package', value: 'track' },
                { text: '⏱️ Delivery Times', value: 'times' },
                { text: '🔙 Main Menu', value: 'menu' }
              ]
            };
            break;
            
          case 'account_info':
            setShowUserInfo(true);
            response = {
              from: 'agent',
              text: "Here's your detailed account information. What else can I help you with?",
              options: [
                { text: '🛍️ Products', value: 'products' },
                { text: '📦 Orders', value: 'orders' },
                { text: '💳 Payments', value: 'payment' },
                { text: '🔙 Main Menu', value: 'menu' }
              ]
            };
            break;
            
          case 'history':
            response = {
              from: 'agent',
              text: "Here's your complete order history. Would you like details on any specific order?",
              options: [
                { text: '🛍️ Products', value: 'products' },
                { text: '📦 Orders', value: 'orders' },
                { text: '💳 Payments', value: 'payment' },
                { text: '🔙 Main Menu', value: 'menu' }
              ]
            };
            break;
            
          case 'menu':
            response = {
              from: 'agent', 
              text: "What would you like help with today?",
              options: [
                { text: '🛍️ Product Questions', value: 'products' },
                { text: '📦 Order Status', value: 'orders' },
                { text: '💳 Payment Issues', value: 'payment' },
                { text: '📝 Return Policy', value: 'returns' },
                { text: '🚚 Shipping Info', value: 'shipping' },
                { text: '👤 My Account Info', value: 'account_info' }
              ]
            };
            break;
            
          default:
            if (userInput.trim().length > 0) {
              response = {
                from: 'agent',
                text: "Thank you for your question. Our support team will get back to you shortly. Is there anything else I can help with?",
                options: [
                  { text: '🛍️ Products', value: 'products' },
                  { text: '📦 Orders', value: 'orders' },
                  { text: '💳 Payments', value: 'payment' },
                  { text: '🔙 Main Menu', value: 'menu' }
                ]
              };
            }
        }
        
        if (Object.keys(response).length > 0) {
          setMessages(prev => [...prev, response]);
        }
      } catch (error) {
        console.error('Error generating response:', error);
        setError(error.message);
        setMessages(prev => [...prev, { 
          from: 'agent', 
          text: `⚠️ Error: ${error.message || 'Failed to process request'}` 
        }]);
      } finally {
        setIsLoading(false);
      }
    }, 1000); // Simulate 1 second response time
  };

  const sendMessage = () => {
    if (!input.trim() && !attachment) return;
    
    const userMessage = { 
      from: 'user', 
      text: input,
      ...(attachment && { attachment })
    };
    setMessages((prev) => [...prev, userMessage]);
    
    const currentInput = input; 
    setInput('');
    setAttachment(null);
    
    generateResponse(currentInput);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !isLoading) sendMessage();
  };

  const handleOptionSelect = (optionValue) => {
    setInput(optionValue);
    sendMessage();
  };

  const emojis = ['😀', '😊', '👍', '👋', '🎉', '🛍️', '📦', '💳', '❓', '✅'];

  // Format order history for display
  const formatOrderHistory = () => {
    if (!orderHistory || !orderHistory.data) return [];
    return orderHistory.data.map(order => ({
      id: order.id,
      date: order.date,
      status: order.status,
      total: order.total,
      items: order.items.map(item => `${item.name} (x${item.quantity})`).join(', ')
    }));
  };

  return (
    <div className="fixed bottom-15 right-4 w-96 h-[580px] rounded-xl overflow-hidden shadow-2xl z-50 flex flex-col font-sans border border-[#00c6fb] bg-[#005baa]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#005baa] to-[#00c6fb] text-white px-5 py-3 flex justify-between items-center border-b border-[#00c6fb]">
        <div className="flex items-center gap-2">
          <RiRobot2Line className="text-xl" />
          <h2 className="text-lg font-semibold">Client Support</h2>
        </div>
        <button
          onClick={onClose}
          className="text-xl hover:bg-white/10 p-1 rounded-full transition"
          disabled={isLoading}
        >
          <RiCloseLine />
        </button>
      </div>

      {/* Chat Body */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-[#f6f8fa]">
        {messages.map((msg, idx) => (
          <div key={idx}>
            <div
              className={`max-w-[80%] px-4 py-2 text-sm rounded-lg mb-2 ${
                msg.from === 'agent'
                  ? 'bg-[#00c6fb] border border-[#00c6fb] text-white self-start'
                  : 'bg-[#005baa] text-white self-end ml-auto'
              }`}
            >
              {msg.attachment?.type === 'image' ? (
                <div>
                  <img 
                    src={msg.attachment.url} 
                    alt="User attachment" 
                    className="max-w-full h-auto rounded mb-2 border border-[#0077cc]"
                  />
                  {msg.text && <div>{msg.text}</div>}
                </div>
              ) : (
                <div>{msg.text}</div>
              )}
            </div>
            
            {/* Display options if available */}
            {msg.options && (
              <div className="flex flex-wrap gap-2 mb-3">
                {msg.options.map((option, i) => (
                  <button
                    key={i}
                    onClick={() => handleOptionSelect(option.value)}
                    className="px-3 py-1 bg-[#00c6fb] hover:bg-[#0077cc] rounded-md text-sm border border-[#0077cc] text-white"
                    disabled={isLoading}
                  >
                    {option.text}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        
        {/* Show user info if requested */}
        {showUserInfo && (
          <div className="bg-white border border-[#00c6fb] rounded-lg p-3 text-sm text-[#333]">
            <h3 className="font-bold text-[#005baa] mb-2 flex items-center gap-1">
              <RiUserLine /> User Information
            </h3>
            {userData && (
              <div className="mb-2">
                <p className="flex items-center gap-1"><RiUserLine className="text-[#00c6fb]" /> <span className="font-semibold">Name:</span> {userData.firstName} {userData.lastName}</p>
                <p className="flex items-center gap-1"><RiMailLine className="text-[#00c6fb]" /> <span className="font-semibold">Email:</span> {userData.email}</p>
                <p className="flex items-center gap-1"><RiSmartphoneLine className="text-[#00c6fb]" /> <span className="font-semibold">Phone:</span> {userData.phone}</p>
                {userData.memberSince && (
                  <p className="flex items-center gap-1"><RiCalendarLine className="text-[#00c6fb]" /> <span className="font-semibold">Member Since:</span> {new Date(userData.memberSince).toLocaleDateString()}</p>
                )}
                {userData.lastLogin && (
                  <p className="flex items-center gap-1"><RiHistoryLine className="text-[#00c6fb]" /> <span className="font-semibold">Last Login:</span> {new Date(userData.lastLogin).toLocaleString()}</p>
                )}
              </div>
            )}
            
            {accountData && (
              <div className="mb-2">
                <h4 className="font-bold text-[#005baa] mt-2 flex items-center gap-1">
                  <RiBuildingLine /> Account Details
                </h4>
                <p><span className="font-semibold">Name:</span> {accountData.data?.name}</p>
                <p><span className="font-semibold">Status:</span> <span className={`${accountData.data?.status === 'Active' ? 'text-green-600' : 'text-red-600'}`}>{accountData.data?.status}</span></p>
                {accountData.data?.type && <p><span className="font-semibold">Type:</span> {accountData.data.type}</p>}
                {accountData.data?.industry && <p><span className="font-semibold">Industry:</span> {accountData.data.industry}</p>}
                {accountData.data?.annualRevenue && <p><span className="font-semibold">Annual Revenue:</span> ${accountData.data.annualRevenue.toLocaleString()}</p>}
                {accountData.data?.employeeCount && <p><span className="font-semibold">Employees:</span> {accountData.data.employeeCount}</p>}
              </div>
            )}
            
            {locationData && (
              <div className="mb-2">
                <h4 className="font-bold text-[#005baa] mt-2 flex items-center gap-1">
                  <RiMapPinLine /> Location Details
                </h4>
                <p><span className="font-semibold">Address:</span> {locationData.data?.street} {locationData.data?.city}, {locationData.data?.state} {locationData.data?.zip}</p>
                <p><span className="font-semibold">Country:</span> {locationData.data?.country}</p>
                {locationData.data?.phone && <p><span className="font-semibold">Location Phone:</span> {locationData.data.phone}</p>}
                {locationData.data?.hours && <p><span className="font-semibold">Business Hours:</span> {locationData.data.hours}</p>}
              </div>
            )}
            
            {orderHistory && orderHistory.data && orderHistory.data.length > 0 && (
              <div className="mb-2">
                <h4 className="font-bold text-[#005baa] mt-2 flex items-center gap-1">
                  <RiFileListLine /> Recent Orders ({orderHistory.data.length})
                </h4>
                <div className="max-h-40 overflow-y-auto">
                  {formatOrderHistory().slice(0, 3).map((order, idx) => (
                    <div key={idx} className="border-b border-gray-200 py-1">
                      <p><span className="font-semibold">Order #{order.id}:</span> {order.status}</p>
                      <p className="text-xs">Date: {order.date} | Total: ${order.total}</p>
                      <p className="text-xs">Items: {order.items}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <button
              onClick={() => setShowUserInfo(false)}
              className="mt-2 text-xs bg-[#00c6fb] text-white px-2 py-1 rounded"
            >
              Close
            </button>
          </div>
        )}
        
        {isLoading && (
          <div className="max-w-[80%] px-4 py-2 text-sm rounded-lg bg-[#00c6fb] border border-[#0077cc] text-white self-start">
            <div className="flex space-x-2">
              <div className="w-2 h-2 rounded-full bg-white animate-bounce"></div>
              <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
        
        {error && (
          <div className="flex items-center gap-2 text-red-300 text-xs p-2">
            <RiAlertLine /> {error}
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Attachment Preview */}
      {attachment && (
        <div className="px-4 py-2 border-t border-[#00c6fb] bg-[#00c6fb]">
          <div className="relative">
            <img 
              src={attachment.url} 
              alt="Preview" 
              className="max-h-32 w-auto rounded border border-[#0077cc]"
            />
            <button
              onClick={() => setAttachment(null)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 text-xs border border-red-400"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-3 bg-[#00c6fb] border-t border-[#0077cc]">
        <div className="flex items-center gap-2">
          {/* Emoji Picker Button */}
          <div className="relative">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="text-[#005baa] hover:text-white p-2 rounded-full hover:bg-[#0077cc] transition"
            >
              <RiEmotionLine />
            </button>
            
            {showEmojiPicker && (
              <div className="absolute bottom-12 left-0 bg-[#005baa] border border-[#00c6fb] rounded-lg shadow-lg p-2 z-10 w-48 grid grid-cols-5 gap-1">
                {emojis.map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      addEmoji(emoji);
                      setShowEmojiPicker(false);
                    }}
                    className="text-xl p-1 hover:bg-[#00c6fb] rounded"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Image Upload Button */}
          <button
            onClick={() => fileInputRef.current.click()}
            className="text-[#005baa] hover:text-white p-2 rounded-full hover:bg-[#0077cc] transition"
          >
            <RiImageLine />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
          
          {/* Text Input */}
          <input
            type="text"
            className="flex-1 border border-[#00c6fb] rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#b3e0fc] bg-white text-[#222] placeholder-[#005baa] transition"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          
          {/* Send Button */}
          <button
            onClick={sendMessage}
            disabled={isLoading || (!input.trim() && !attachment)}
            className={`bg-[#005baa] text-white p-2 rounded-lg transition transform ${
              isLoading || (!input.trim() && !attachment) ? 'opacity-50' : 'hover:bg-[#003e7d]'
            }`}
          >
            <RiSendPlaneLine />
          </button>
        </div>
      </div>
    </div>
  );
}