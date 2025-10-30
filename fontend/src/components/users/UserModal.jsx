// src/components/users/UserModal.jsx - WITH PASSWORD TOGGLE
import { useState, useEffect } from "react";

export const UserModal = ({ isOpen, onClose, user, roles, onSave }) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role_names: [],
    is_active: true,
    is_staff: false,
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false); // ✅ Password visibility state

  // Initialize form when user or modal state changes
  useEffect(() => {
    if (user) {
      // Extract role names correctly from nested structure
      const roleNames =
        user.roles?.map((r) => {
          if (typeof r === "object" && r.role) {
            return r.role.name;
          }
          return typeof r === "object" ? r.name : r;
        }) || [];

      setFormData({
        username: user.username || "",
        email: user.email || "",
        password: "",
        role_names: roleNames,
        is_active: user.is_active ?? true,
        is_staff: user.is_staff ?? false,
      });
    } else {
      setFormData({
        username: "",
        email: "",
        password: "",
        role_names: [],
        is_active: true,
        is_staff: false,
      });
    }
    setErrors({});
    setShowPassword(false); // Reset password visibility
  }, [user, isOpen]);

  const handleRoleToggle = (roleName) => {
    setFormData((prev) => ({
      ...prev,
      role_names: prev.role_names.includes(roleName)
        ? prev.role_names.filter((r) => r !== roleName)
        : [...prev.role_names, roleName],
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!user && !formData.password) {
      newErrors.password = "Password is required for new users";
    } else if (formData.password && formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (formData.role_names.length === 0) {
      newErrors.role_names = "Please select at least one role";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const payload = {
      username: formData.username.trim(),
      email: formData.email.trim(),
      is_active: formData.is_active,
      is_staff: formData.is_staff,
    };

    if (!user) {
      payload.password = formData.password;
      payload.role_names = formData.role_names;
    } else {
      if (formData.password) {
        payload.password = formData.password;
      }
      payload.role_names = formData.role_names;
    }

    onSave(payload);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            {user ? "Edit User" : "Add New User"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.username ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter username"
            />
            {errors.username && (
              <p className="text-red-500 text-xs mt-1">{errors.username}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter email"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password with Toggle Visibility */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password {!user && <span className="text-red-500">*</span>}
              {user && (
                <span className="text-gray-500 text-xs ml-1">
                  (leave empty to keep current)
                </span>
              )}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.password ? "border-red-500" : "border-gray-300"
                }`}
                placeholder={user ? "Enter new password" : "Enter password"}
              />
              {/* Eye Icon Toggle */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {showPassword ? (
                  // Eye Slash Icon (Hide)
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                ) : (
                  // Eye Icon (Show)
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          {/* Roles */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Roles <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2 border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto">
              {roles && roles.length > 0 ? (
                roles.map((role) => (
                  <label
                    key={role.id}
                    className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={formData.role_names.includes(role.name)}
                      onChange={() => handleRoleToggle(role.name)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900 capitalize">
                        {role.name}
                      </span>
                      {role.description && (
                        <p className="text-xs text-gray-500">
                          {role.description}
                        </p>
                      )}
                    </div>
                  </label>
                ))
              ) : (
                <p className="text-sm text-gray-500">No roles available</p>
              )}
            </div>
            {errors.role_names && (
              <p className="text-red-500 text-xs mt-1">{errors.role_names}</p>
            )}
          </div>

          {/* Status Checkboxes */}
          <div className="space-y-2 border-t pt-4">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) =>
                  setFormData({ ...formData, is_active: e.target.checked })
                }
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Active User</span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_staff}
                onChange={(e) =>
                  setFormData({ ...formData, is_staff: e.target.checked })
                }
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Staff Member</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
            >
              {user ? "Update User" : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
