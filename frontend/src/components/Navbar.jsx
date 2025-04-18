import { useState, useEffect, useRef } from 'react';
import { HiBars3 } from "react-icons/hi2";
import { FaXmark } from "react-icons/fa6";
import { CgProfile } from "react-icons/cg";
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const profileRef = useRef(null);
  const { logout } = useAuth();
  const location = useLocation(); // Get current route path

  const token = localStorage.getItem('token'); // Check if token exists in local storage

  const navItems = token
    ? [
      { name: 'Security Quests', href: '/quests' },
      { name: 'Security Scanner', href: '/security-scanner' },
      { name: 'Deep Analyser', href: '/ai-playground' },
      { name: 'LeaderBoard', href: '/leaderboard' },
    ]
    : [];

  // Close modal on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileModal(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const LogOut = async () => {
    await logout();
  }

  return (
    <header className="w-11/12 max-w-maxContent bg-indigoDark-900 backdrop-blur-md bg-opacity-80 fixed -mt-8 z-50">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <a href="/" className="-m-1.5 p-1.5">
            <span className="sr-only">CodeShield</span>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-neonPurple-500 to-neonBlue-500 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
                  <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 00-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08zm3.094 8.016a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="ml-2 text-white font-bold text-xl">CodeShield</span>
            </div>
          </a>
        </div>

        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-400"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <HiBars3 className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        <div className="hidden lg:flex lg:gap-x-12">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <a
                key={item.name}
                href={item.href}
                className={`text-sm font-semibold leading-6 transition-colors duration-200 ${isActive ? 'text-white border-b-2 border-neonBlue-500 pb-1' : 'text-gray-300 hover:text-white'
                  }`}
              >
                {item.name}
              </a>
            );
          })}
        </div>


        {!token ? (
          <div className="hidden lg:flex lg:flex-1 lg:justify-end">
            <a
              href="/auth"
              className="rounded-md bg-gradient-to-r from-neonPurple-500 to-neonBlue-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity duration-200"
            >
              Get Started
            </a>
          </div>
        ) : (
          <div className="relative pl-6" ref={profileRef}>
            <button
              onClick={() => setShowProfileModal(!showProfileModal)}
              className="text-white text-opacity-90 text-2xl"
            >
              <CgProfile />
            </button>

            {showProfileModal && (
              <div className="absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-indigoDark-600 ring-1 ring-black ring-opacity-5 z-50">
                <div className="py-1">
                  <a
                    href="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Profile
                  </a>
                  <button
                    onClick={() => LogOut()}
                    className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Mobile menu */}
      <div className={`lg:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`} role="dialog" aria-modal="true">
        <div className="fixed inset-0 z-50" />
        <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-indigoDark-900 px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <a href="/" className="-m-1.5 p-1.5">
              <span className="sr-only">CodeShield</span>
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-neonPurple-500 to-neonBlue-500 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
                    <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 00-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08zm3.094 8.016a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="ml-2 text-white font-bold text-xl">CodeShield</span>
              </div>
            </a>
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5 text-gray-400"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sr-only">Close menu</span>
              <FaXmark className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="space-y-2 py-6">
                {navItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-300 hover:bg-indigoDark-800"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </a>
                ))}
              </div>
              {!token && (
                <div className="py-6">
                  <a
                    href="/auth"
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-white bg-gradient-to-r from-neonPurple-500 to-neonBlue-500"
                  >
                    Get Started
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
