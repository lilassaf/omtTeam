import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import LoginForm from "../../components/auth/loginform";
import Logo from '@assets/logo.png';

function Login() {
  const [activeTab, setActiveTab] = useState('client'); // 'client' or 'admin'
  const [isHovered, setIsHovered] = useState(false);

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

  return (
    <div className="min-h-screen w-full bg-[#f6f8fa] flex items-center justify-center p-4 font-['Segoe_UI','Roboto',Arial,sans-serif]">
      {/* Main Card */}
      <div className="relative w-full max-w-md">
        {/* Floating card with subtle shadow */}
        <div 
          className={`relative bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-500 ${isHovered ? 'shadow-xl' : 'shadow-md'}`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{ border: '1px solid rgba(0, 91, 170, 0.1)' }}
        >
          {/* Dynamic gradient bar based on active tab */}
          <div className={`h-2 ${activeTab === 'client' ? 'bg-gradient-to-r from-[#005baa] to-[#00c6fb]' : 'bg-gradient-to-r from-[#003e7d] to-[#005baa]'}`}></div>
          
          {/* Tab selector */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('client')}
              className={`flex-1 py-4 font-medium text-sm transition-colors ${activeTab === 'client' ? 'text-[#005baa] bg-[#f0f7ff]' : 'text-gray-500 hover:text-[#00c6fb]'}`}
            >
              <i className="ri-user-line mr-2"></i> Client Portal
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex-1 py-4 font-medium text-sm transition-colors ${activeTab === 'admin' ? 'text-[#005baa] bg-[#f0f7ff]' : 'text-gray-500 hover:text-[#00c6fb]'}`}
            >
              <i className="ri-admin-line mr-2"></i> Admin Portal
            </button>
          </div>
          
          {/* Content container */}
          <div className="px-8 py-8">
            {/* Logo and header */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative mb-4">
                <img 
                  src={Logo} 
                  className="w-16 h-16 object-contain transition-transform duration-300 hover:scale-110"
                  alt="Company Logo" 
                />
                <div className={`absolute inset-0 rounded-full border-2 border-transparent opacity-0 hover:opacity-100 transition-all duration-300 pointer-events-none ${
                  activeTab === 'client' ? 'hover:border-[#b3e0fc]' : 'hover:border-[#00c6fb]'
                }`}></div>
              </div>
              <h1 className="text-2xl font-bold text-[#222] mb-2">
                {activeTab === 'client' ? 'Client Portal' : 'Admin Console'}
              </h1>
              <p className="text-sm text-[#444] text-center max-w-xs">
                {activeTab === 'client' 
                  ? 'Sign in to access your shopping dashboard' 
                  : 'System administrator access only'}
              </p>
            </div>

            {/* Login Form */}
            <LoginForm activeTab={activeTab} />

            {/* Footer links */}
            
          </div>

          {/* Animated background elements */}
          <div className={`absolute -top-10 -left-10 w-20 h-20 rounded-full opacity-10 mix-blend-multiply filter blur-xl animate-blob ${
            activeTab === 'client' ? 'bg-[#b3e0fc]' : 'bg-[#00c6fb]'
          }`}></div>
          <div className={`absolute -bottom-20 -right-10 w-24 h-24 rounded-full opacity-10 mix-blend-multiply filter blur-xl animate-blob animation-delay-2000 ${
            activeTab === 'client' ? 'bg-[#00c6fb]' : 'bg-[#005baa]'
          }`}></div>
          <div className={`absolute top-1/2 right-20 w-16 h-16 rounded-full opacity-10 mix-blend-multiply filter blur-xl animate-blob animation-delay-4000 ${
            activeTab === 'client' ? 'bg-[#b3e0fc]' : 'bg-[#00c6fb]'
          }`}></div>
        </div>

        {/* Subtle footer */}
        <div className="mt-6 text-center text-xs text-[#444]">
          © {new Date().getFullYear()} OMT. All rights reserved.
        </div>
      </div>

      {/* Add these styles to your global CSS */}
      <style jsx global>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}

export default Login;