import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SecurityNavbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="w-full bg-indigoDark-900 shadow-md px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-neonPurple-500 to-neonBlue-500 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
                <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 00-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08zm3.094 8.016a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="ml-2 text-white font-satoshi font-bold text-xl">CodeShield</span>
          </Link>

          <div className="hidden md:flex ml-8 space-x-6">
            <Link to="/security-scanner" className="text-white font-medium hover:text-neonBlue-400">
              Security Scanner
            </Link>
            <Link to="/quests" className="text-white font-medium hover:text-neonBlue-400">
              Security Quests
            </Link>
            <Link to="/dashboard" className="text-white font-medium hover:text-neonBlue-400">
              Dashboard
            </Link>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-gray-300">
                Hello, <span className="text-white font-medium">{user.name}</span>
              </div>
              <button 
                onClick={logout}
                className="px-4 py-2 bg-indigoDark-700 hover:bg-indigoDark-600 rounded-md text-white"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link 
              to="/auth" 
              className="px-4 py-2 bg-gradient-to-r from-neonPurple-500 to-neonBlue-500 rounded-md text-white font-medium"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default SecurityNavbar; 