// src/components/layout/Topbar.jsx - MOBILE RESPONSIVE
import { useAuth } from '../../context/AuthContext';

export const Topbar = ({ title }) => {
  const { user } = useAuth();

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40 border-b border-gray-200">
      <div className="px-4 sm:px-6 py-4 flex items-center justify-between">
        {/* Title - Hidden hamburger space on mobile */}
        <div className="flex items-center space-x-4 ml-14 lg:ml-0">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h2>
            <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">{getCurrentDate()}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Search - Hidden on mobile */}
          <div className="hidden md:flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition">
            <span>🔍</span>
            <span className="text-sm text-gray-600">Search...</span>
          </div>

          {/* Notifications */}
          <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition">
            <span className="text-lg sm:text-xl">🔔</span>
            <span className="absolute top-1 right-1 w-2 h-2 bg-gray-900 rounded-full"></span>
          </button>

          {/* User Profile */}
          <div className="flex items-center space-x-2 sm:space-x-3 border-l border-gray-200 pl-2 sm:pl-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-900">
                {user?.username}
              </p>
              <p className="text-xs text-gray-500">
                {user?.roles?.[user.roles.length - 1]?.toUpperCase()}
              </p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center text-white font-bold cursor-pointer text-sm sm:text-base">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
