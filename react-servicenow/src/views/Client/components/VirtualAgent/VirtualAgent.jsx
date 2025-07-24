import { useState, useEffect, useRef } from 'react';
import { RiSendPlaneLine, RiRobot2Line, RiCloseLine, RiAlertLine, RiEmotionLine, RiImageLine } from 'react-icons/ri';
import { FaBrain } from 'react-icons/fa';

export default function VirtualAgent({ onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeModel, setActiveModel] = useState('gemini');
  const [error, setError] = useState(null);
  const [conversationState, setConversationState] = useState({
    stage: 'initial',
    selectedCategory: null,
    selectedItem: null
  });

  // Auto-scroll on message update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize conversation based on model
  useEffect(() => {
    if (activeModel === 'gemini') {
      setMessages([{ 
        from: 'agent', 
        text: "👋 Hi! I'm your AI Assistant. How can I help you today?" 
      }]);
    } else {
      setMessages([{ 
        from: 'agent', 
        text: "👋 Welcome to Client Support! What would you like help with?",
        options: [
          { text: '🛍️ Browse Products', value: 'products' },
          { text: '📦 My Orders', value: 'orders' },
          { text: '💳 Payment Help', value: 'payment' },
          { text: '❓ General Questions', value: 'help' }
        ]
      }]);
    }
  }, [activeModel]);

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

  const handleClientAction = async (userInput) => {
    try {
      setIsLoading(true);
      
      switch (conversationState.stage) {
        case 'initial':
          if (userInput === 'products') {
            const response = await fetch('http://localhost:3000/product-offerings');
            const offerings = await response.json();
            
            setMessages(prev => [...prev, {
              from: 'agent',
              text: "Here are our available products:",
              items: offerings.map(offering => ({
                id: offering.sys_id,
                name: offering.u_name,
                description: `$${offering.u_price} | ${offering.u_category}`
              }))
            }]);
            setConversationState({
              stage: 'browsing_products',
              selectedCategory: 'products'
            });
          }
          else if (userInput === 'orders') {
            // Mock order data for client
            setMessages(prev => [...prev, {
              from: 'agent',
              text: "Here are your recent orders:",
              items: [
                { id: 1, name: "Order #1001", description: "Status: Delivered | Total: $129.99" },
                { id: 2, name: "Order #1002", description: "Status: Shipped | Total: $89.99" }
              ]
            }]);
          }
          else if (userInput === 'payment') {
            setMessages(prev => [...prev, {
              from: 'agent',
              text: "What payment assistance do you need?",
              options: [
                { text: '💳 Update Payment Method', value: 'update_payment' },
                { text: '🧾 Invoice Question', value: 'invoice' },
                { text: '🔄 Refund Request', value: 'refund' }
              ]
            }]);
          }
          else {
            setMessages(prev => [...prev, {
              from: 'agent',
              text: "I can help you browse products, check orders, or answer questions. What would you like?",
              options: [
                { text: '🛍️ Browse Products', value: 'products' },
                { text: '📦 My Orders', value: 'orders' },
                { text: '❓ General Help', value: 'help' }
              ]
            }]);
          }
          break;

        case 'browsing_products':
          const response = await fetch(`http://localhost:3000/product-offerings/${userInput}`);
          const product = await response.json();
          
          let details = `🛍️ Product Details:\n`;
          details += `• Name: ${product.u_name}\n`;
          details += `• Price: $${product.u_price}\n`;
          details += `• Category: ${product.u_category}\n`;
          details += `• Status: ${product.u_status}\n`;
          
          setMessages(prev => [...prev, {
            from: 'agent',
            text: details,
            options: [
              { text: '🛒 Add to Cart', value: `cart_${userInput}` },
              { text: '🔙 Back to Products', value: 'back_products' }
            ]
          }]);
          break;

        default:
          setMessages(prev => [...prev, {
            from: 'agent',
            text: "How else can I assist you today?",
            options: [
              { text: '🛍️ Browse Products', value: 'products' },
              { text: '📦 My Orders', value: 'orders' },
              { text: '❓ Help', value: 'help' }
            ]
          }]);
      }
    } catch (error) {
      console.error('Client action error:', error);
      setError(error.message);
      setMessages(prev => [...prev, { 
        from: 'agent', 
        text: `⚠️ Error: ${error.message || 'Failed to process request'}` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
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
    setIsLoading(true);
    setError(null);

    try {
      if (activeModel === 'servicenow') {
        await handleClientAction(currentInput);
      } else {
        // Keep your existing Gemini AI integration exactly as it was
        const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;
        const modelName = 'gemini-2.0-flash';
        
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: currentInput }] }]
            })
          }
        );

        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || 'AI response error');
        const botReply = data.candidates?.[0]?.content?.parts?.[0]?.text || 
                        "I'm having trouble generating a response.";
        
        setMessages(prev => [...prev, { 
          from: 'agent', 
          text: botReply
        }]);
      }
    } catch (error) {
      console.error('Message error:', error);
      setError(error.message);
      setMessages(prev => [...prev, { 
        from: 'agent', 
        text: `⚠️ Error: ${error.message || 'Failed to get response'}` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !isLoading) sendMessage();
  };

  const toggleModel = () => {
    setActiveModel(prev => prev === 'gemini' ? 'servicenow' : 'gemini');
  };

  const handleOptionSelect = (optionValue) => {
    setInput(optionValue);
    sendMessage();
  };

  const emojis = ['😀', '😊', '👍', '👋', '🎉', '🛍️', '📦', '💳', '❓', '✅'];

  return (
    <div className="fixed bottom-15 right-4 w-96 h-[580px] rounded-xl overflow-hidden shadow-2xl z-50 flex flex-col font-sans border border-[#00c6fb] bg-[#005baa]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#005baa] to-[#00c6fb] text-white px-5 py-3 flex justify-between items-center border-b border-[#00c6fb]">
        <div className="flex items-center gap-2">
          <RiRobot2Line className="text-xl" />
          <h2 className="text-lg font-semibold">Client Support</h2>
          <button 
            onClick={toggleModel}
            className="text-xs bg-white/10 p-1.5 rounded-md flex items-center gap-1 hover:bg-white/20 transition ml-2"
            title={`Switch to ${activeModel === 'gemini' ? 'AI Chat' : 'Guided Help'}`}
            disabled={isLoading}
          >
            {activeModel === 'gemini' ? <FaBrain size={12} /> : <RiRobot2Line size={12} />}
            {activeModel === 'gemini' ? 'AI Mode' : 'Guided'}
          </button>
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
            
            {/* Display items list if available */}
            {msg.items && (
              <div className="space-y-2 mb-3">
                {msg.items.map((item, i) => (
                  <div 
                    key={i}
                    onClick={() => handleOptionSelect(item.id)}
                    className="p-3 bg-[#00c6fb] border border-[#0077cc] rounded-lg cursor-pointer hover:bg-[#0077cc] text-white"
                  >
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-[#b3e0fc]">{item.description}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        
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