import React, { useState } from 'react';
import { RiRobot2Line, RiCloseLine } from 'react-icons/ri';
import VirtualAgent from './VirtualAgentUser';

export default function VirtualAgentButton() {
  const [isVirtualAgentVisible, setVirtualAgentVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const toggleVirtualAgent = () => {
    setVirtualAgentVisible(!isVirtualAgentVisible);
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-16 right-6 z-50">
        {!isVirtualAgentVisible ? (
          <button
            onClick={toggleVirtualAgent}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`relative w-14 h-14 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center group
              bg-gradient-to-br from-[#005baa] to-[#00c6fb] hover:from-[#0077cc] hover:to-[#00c6fb]
              ${isHovered ? 'scale-110 shadow-xl' : 'scale-100'} border border-[#b3e0fc]/30`}
            title="Client Support"
            aria-label="Open Client Support"
          >
            <RiRobot2Line className="text-2xl text-white group-hover:animate-pulse" />
            
            {/* Animated speech bubble on hover */}
            {isHovered && (
              <div className="absolute -top-12 -right-2 bg-[#005baa] text-[#b3e0fc] text-xs font-medium px-3 py-1.5 rounded-md shadow-md whitespace-nowrap
                animate-fade-in border border-[#00c6fb]">
                Client Support
                <div className="absolute -bottom-1 right-4 w-3 h-3 bg-[#005baa] transform rotate-45 border-r border-b border-[#00c6fb]"></div>
              </div>
            )}
          </button>
        ) : (
          <button
            onClick={toggleVirtualAgent}
            className="w-14 h-14 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center
              bg-gradient-to-br from-[#005baa] to-[#00c6fb] hover:from-[#0077cc] hover:to-[#00c6fb]
              hover:scale-110 hover:shadow-xl border border-[#b3e0fc]/30"
            title="Close Client Support"
            aria-label="Close Client Support"
          >
            <RiCloseLine className="text-2xl text-white" />
          </button>
        )}
      </div>

      {/* Virtual Agent Component */}
      {isVirtualAgentVisible && (
        <VirtualAgent onClose={toggleVirtualAgent} />
      )}
    </>
  );
}