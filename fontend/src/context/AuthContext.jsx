// src/context/AuthContext.jsx - WITH JWT DECODING

import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { apiService } from "../services/api.service";

const AuthContext = createContext(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Helper: Decode JWT and extract user info
  const getUserFromToken = (token) => {
    try {
      const decoded = jwtDecode(token);

      return {
        id: decoded.sub,
        username: decoded.username,
        roles: decoded.roles || [],
        // Add any other fields from your JWT
      };
    } catch (error) {
      console.error("❌ Error decoding token:", error);
      return null;
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);

        // If we only have tokens, decode them to get user info
        if (parsed.access_token && !parsed.username) {
          const userInfo = getUserFromToken(parsed.access_token);
          if (userInfo) {
            const fullUser = { ...parsed, ...userInfo };
            setUser(fullUser);
            localStorage.setItem("user", JSON.stringify(fullUser));
          }
        } else {
          setUser(parsed);
        }
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await apiService.login(username, password);

      if (response.success && response.data) {
        const tokenData = response.data;

        // ✅ Decode JWT to get user info
        const userInfo = getUserFromToken(tokenData.access_token);

        if (!userInfo) {
          return { success: false, error: "Invalid token" };
        }

        // ✅ Combine token data with decoded user info
        const userData = {
          ...tokenData,
          ...userInfo,
        };

        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        return { success: true };
      }
      return { success: false, error: "Invalid response format" };
    } catch (error) {
      console.error("❌ Login error:", error);
      return { success: false, error: error.message || "Login failed" };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  // Role checking
  const hasRole = (role) => {
    if (!user || !user.roles) return false;
    return user.roles.includes(role);
  };

  const isStaff = () => hasRole("staff");
  const isManager = () => hasRole("manager");
  const isAdmin = () => hasRole("admin");
  const isSuperAdmin = () => hasRole("superadmin");

  const value = {
    user,
    loading,
    login,
    logout,
    hasRole,
    isStaff,
    isManager,
    isAdmin,
    isSuperAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
