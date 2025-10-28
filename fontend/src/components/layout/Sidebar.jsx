// src/components/layout/Sidebar.jsx - MOBILE RESPONSIVE
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState, useEffect } from "react";

export const Sidebar = () => {
  const { user, logout, isStaff, isManager, isAdmin, isSuperAdmin } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        isMobileMenuOpen &&
        !e.target.closest("#mobile-sidebar") &&
        !e.target.closest("#mobile-menu-button")
      ) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileMenuOpen]);

  const menuItems = {
    all: [{ path: "/dashboard", name: "Dashboard", icon: "🏠" }],
    staff: [
      { path: "/pos", name: "Point of Sale", icon: "💰" },
      { path: "/sales", name: "Sales", icon: "🧾" },
      { path: "/returns", name: "Returns", icon: "↩️" },
    ],
    manager: [{ path: "/inventory", name: "Inventory", icon: "📊" }],
    admin: [{ path: "/shops", name: "Shops", icon: "🏪" }],
    superadmin: [{ path: "/users", name: "Users", icon: "👥" }],
  };

  const getAvailableMenus = () => {
    const menus = [...menuItems.all];
    if (isStaff()) menus.push(...menuItems.staff);
    if (isManager()) menus.push(...menuItems.manager);
    if (isAdmin()) menus.push(...menuItems.admin);
    if (isSuperAdmin()) menus.push(...menuItems.superadmin);
    return menus;
  };

  const availableMenus = getAvailableMenus();

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        id="mobile-menu-button"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-gray-900 text-white p-3 rounded-lg shadow-lg"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isMobileMenuOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" />
      )}

      {/* Sidebar */}
      <aside
        id="mobile-sidebar"
        className={`fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-gray-900 to-black text-white shadow-2xl flex flex-col z-50 transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
              <span className="text-xl">⚡</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">ElectroShop</h1>
              <p className="text-xs text-gray-400">Management System</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {availableMenus.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`menu-item ${isActive(item.path) ? "active" : ""}`}
              >
                <span className="text-xl mr-3">{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}
          </div>
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-gray-800 bg-black">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
              {user?.fullName?.charAt(0) || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{user?.fullName}</p>
              <p className="text-xs text-gray-400 truncate">
                {user?.roles?.[user.roles.length - 1]?.toUpperCase()}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg transition duration-200 flex items-center justify-center space-x-2 font-medium"
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};
