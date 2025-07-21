import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import LoginForm from "../../components/auth/loginform";
import Logo from '@assets/logo.png';

function Login() {
  const [activeTab, setActiveTab] = useState('client'); // 'client' or 'admin'
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-amber-50 via-amber-50 to-cyan-50 flex items-center justify-center p-4">
      {/* Main Card */}
      <div className="relative w-full max-w-md">
        {/* Floating card with subtle shadow */}
        <div 
          className={`relative bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-500 ${isHovered ? 'shadow-2xl' : 'shadow-lg'}`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Dynamic gradient bar based on active tab */}
          <div className={`h-2 ${activeTab === 'client' ? 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400' : 'bg-gradient-to-r from-cyan-600 via-cyan-500 to-cyan-400'}`}></div>
          
          {/* Tab selector */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('client')}
              className={`flex-1 py-3 font-medium text-sm transition-colors ${activeTab === 'client' ? 'text-amber-700 bg-amber-50' : 'text-gray-500 hover:text-amber-600'}`}
            >
              <i className="ri-user-line mr-2"></i> Client Portal
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex-1 py-3 font-medium text-sm transition-colors ${activeTab === 'admin' ? 'text-cyan-700 bg-cyan-50' : 'text-gray-500 hover:text-cyan-600'}`}
            >
              <i className="ri-admin-line mr-2"></i> Admin Portal
            </button>
          </div>
          
          {/* Content container */}
          <div className="px-8 py-10">
            {/* Logo and header */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative mb-4">
                <img 
                  src={Logo} 
                  className="w-20 h-20 object-contain transition-transform duration-300 hover:scale-110"
                  alt="Company Logo" 
                />
                <div className={`absolute inset-0 rounded-full border-2 border-transparent opacity-0 hover:opacity-100 transition-all duration-300 pointer-events-none ${
                  activeTab === 'client' ? 'hover:border-amber-300' : 'hover:border-cyan-300'
                }`}></div>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-1">
                {activeTab === 'client' ? 'Welcome' : 'Admin Console'}
              </h1>
              <p className="text-sm text-gray-500 text-center max-w-xs">
                {activeTab === 'client' 
                  ? 'Sign in to access your dashboard' 
                  : 'System administrator access only'}
              </p>
            </div>

            {/* Login Form */}
            <LoginForm activeTab={activeTab} />

            {/* Footer links */}
            <div className="mt-6 text-center">
             
              {/* <div className="text-xs text-gray-400">
                <Link 
                  to="/forgot-password" 
                  className={`hover:underline transition-colors ${
                    activeTab === 'client' ? 'text-amber-500' : 'text-cyan-500'
                  }`}
                >
                  Forgot password?
                </Link>
              </div> */}
            </div>
          </div>

          {/* Animated background elements */}
          <div className={`absolute -top-10 -left-10 w-20 h-20 rounded-full opacity-20 mix-blend-multiply filter blur-xl animate-blob ${
            activeTab === 'client' ? 'bg-amber-100' : 'bg-cyan-100'
          }`}></div>
          <div className={`absolute -bottom-20 -right-10 w-24 h-24 rounded-full opacity-20 mix-blend-multiply filter blur-xl animate-blob animation-delay-2000 ${
            activeTab === 'client' ? 'bg-amber-200' : 'bg-cyan-200'
          }`}></div>
          <div className={`absolute top-1/2 right-20 w-16 h-16 rounded-full opacity-20 mix-blend-multiply filter blur-xl animate-blob animation-delay-4000 ${
            activeTab === 'client' ? 'bg-amber-100' : 'bg-cyan-100'
          }`}></div>
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