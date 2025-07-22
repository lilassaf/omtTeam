import React from 'react';
import logo from '../../../assets/logo.png';
import { RiFacebookFill, RiTwitterFill, RiInstagramFill, RiArrowRightLine } from 'react-icons/ri';

const Footer = ({ categories = [], setSelectedCategory = () => {} }) => {
  return (
    <footer className="bg-[#005baa] text-white pt-16 pb-8 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div>
            <div className="flex items-center gap-3 mb-6">
              {/* Corrected: Use 'logo' (lowercase) as imported */}
              <img src={logo} alt="Logo" className="h-8" />
              <span className="text-2xl font-bold text-white">OMT</span>
            </div>
            <p className="text-[#b3e0fc] mb-6">
              Your trusted destination for premium products and exceptional service.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-[#b3e0fc] hover:text-white transition-colors" aria-label="Facebook">
                <RiFacebookFill className="text-xl" />
              </a>
              <a href="#" className="text-[#b3e0fc] hover:text-white transition-colors" aria-label="Twitter">
                <RiTwitterFill className="text-xl" />
              </a>
              <a href="#" className="text-[#b3e0fc] hover:text-white transition-colors" aria-label="Instagram">
                <RiInstagramFill className="text-xl" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-6 text-white">Shop</h3>
            <ul className="space-y-3">
              {/* Ensure categories is defined and passed as a prop */}
              {categories.slice(0, 5).map((category) => (
                <li key={category.value}>
                  <a
                    href="#"
                    className="text-[#b3e0fc] hover:text-white transition-colors flex items-center gap-2"
                    onClick={(e) => {
                      e.preventDefault();
                      // Ensure setSelectedCategory is defined and passed as a prop
                      setSelectedCategory(category.value);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    <RiArrowRightLine className="text-xs" /> {category.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-6 text-white">Company</h3>
            <ul className="space-y-3">
              {['About Us', 'Careers', 'Blog', 'Press', 'Sustainability'].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-[#b3e0fc] hover:text-white transition-colors flex items-center gap-2"
                  >
                    <RiArrowRightLine className="text-xs" /> {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-6 text-white">Contact</h3>
            <address className="not-italic text-[#b3e0fc] space-y-3">
              <p>123 Commerce Street</p>
              <p>San Francisco, CA 94103</p>
              <p>Email: info@omt.com</p>
              <p>Phone: (555) 123-4567</p>
            </address>
          </div>
        </div>

        <div className="border-t border-[#003e7d] pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[#b3e0fc] text-sm">
              &copy; {new Date().getFullYear()} OMT Platform. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-[#b3e0fc] hover:text-white text-sm transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-[#b3e0fc] hover:text-white text-sm transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-[#b3e0fc] hover:text-white text-sm transition-colors">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;