import React from 'react';

const Footer = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-[#9C4221] border-t border-[#B45309] py-1 px-6 shadow-sm z-20 ml-64">
      <div className="flex items-center justify-between h-8">
        {/* Left side - Copyright and links */}
        <div className="flex items-center space-x-2">
          <span className="text-[0.7rem] text-amber-100 font-medium tracking-tight">
            © {new Date().getFullYear()} LuxeCart • Premium Client Portal
          </span>
          <span className="text-amber-300 opacity-30 text-xs">|</span>
          <a href="#" className="text-[0.7rem] text-amber-200 hover:text-amber-300 hover:underline transition-colors duration-150">
            Privacy
          </a>
          <a href="#" className="text-[0.7rem] text-amber-200 hover:text-amber-300 hover:underline transition-colors duration-150">
            Terms
          </a>
          <a href="#" className="text-[0.7rem] text-amber-200 hover:text-amber-300 hover:underline transition-colors duration-150">
            Support
          </a>
        </div>
        
        {/* Right side - Status and version */}
        <div className="flex items-center space-x-3">
          {/* System status indicator */}
          <div className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-amber-300 animate-pulse"></span>
            <span className="text-[0.7rem] text-amber-100">System Operational</span>
          </div>
          
          {/* Version badge */}
          <div className="flex items-center space-x-1">
            <span className="px-1.5 py-0.5 rounded text-[0.6rem] bg-[#B45309] text-amber-50 border border-amber-300/20 font-mono">
              v1.2.0
            </span>
          </div>
          
          {/* Settings button */}
          <button className="text-amber-100 hover:text-amber-300 transition-colors p-0.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;