// src/LandingPage.jsx
import React, { useState } from 'react';
import { User, Menu, X } from 'lucide-react';
// import { Link } from 'react-router-dom';
import { Link, useLocation } from "react-router-dom";

// const location = useLocation();


const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = React.useRef(null);

  const location = useLocation(); 
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const closeAllMenus = () => {
    setIsMenuOpen(false);
    setIsProfileOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex flex-col md:flex-col justify-between gap-y-[850px]">
        <nav className="bg-white shadow-lg">
          <div className="mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-indigo-600">MyApp</h1>
              </div>

              {/* Desktop */}
              <div className="hidden md:flex items-center space-x-8">
                <a
                  href="#home"
                  className="text-gray-700 hover:text-indigo-600 font-medium transition"
                >
                  Home
                </a>
                <a
                  href="#features"
                  className="text-gray-700 hover:text-indigo-600 font-medium transition"
                >
                  Features
                </a>
                <a
                  href="#about"
                  className="text-gray-700 hover:text-indigo-600 font-medium transition"
                >
                  About
                </a>
                <a
                  href="#contact"
                  className="text-gray-700 hover:text-indigo-600 font-medium transition"
                >
                  Contact
                </a>

                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-700 transition"
                  >
                    <User className="w-6 h-6 text-white" />
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-50">
                      {/* Update these to Link */}
                      <Link
                        to="/signin"
                        onClick={closeAllMenus}
                        className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition"
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/signup"
                        onClick={closeAllMenus}
                        className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition"
                      >
                        Sign Up
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="text-gray-700 hover:text-indigo-600"
                >
                  {isMenuOpen ? (
                    <X className="w-6 h-6" />
                  ) : (
                    <Menu className="w-6 h-6" />
                  )}
                </button>
              </div>
            </div>

            {/* Mobile Navigation */}
            {isMenuOpen && (
              <div className="md:hidden py-4 space-y-2">
                <a
                  href="#home"
                  className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 rounded"
                >
                  Home
                </a>
                <a
                  href="#features"
                  className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 rounded"
                >
                  Features
                </a>
                <a
                  href="#about"
                  className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 rounded"
                >
                  About
                </a>
                <a
                  href="#contact"
                  className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 rounded"
                >
                  Contact
                </a>
                <div className="border-t pt-2">
                  <Link
                    to="/signin"
                    onClick={closeAllMenus}
                    className="block px-4 py-2 text-indigo-600 font-medium hover:bg-indigo-50 rounded"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    state={{ backgroundLocation: location }}
                    className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition"
                  >
                    Sign Up
                  </Link>
                </div>
              </div>
            )}
          </div>
        </nav>

        <footer className="bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <p className="text-center text-gray-600">
              © 2025 MyApp. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;