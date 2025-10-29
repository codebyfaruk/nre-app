// src/components/users/UserModal.jsx - SIMPLIFIED VERSION

import { useState, useEffect } from "react";

export const UserModal = ({ isOpen, onClose, user, roles, onSave }) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    roles: [],
    is_active: true,
    is_staff: false,
  });

  // Initialize form
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
        password: "",
        roles: user.roles?.map((r) => r.name || r) || [],
        is_active: user.is_active ?? true,
        is_staff: user.is_staff ?? false,
      });
    } else {
      setFormData({
        username: "",
        email: "",
        password: "",
        roles: [],
        is_active: true,
        is_staff: false,
      });
    }
  }, [user, isOpen]);

  const handleRoleToggle = (roleName) => {
    setFormData((prev) => ({
      ...prev,
      roles: prev.roles.includes(roleName)
        ? prev.roles.filter((r) => r !== roleName)
        : [...prev.roles, roleName],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.roles.length === 0) {
      alert("Please select at least one role");
      return;
    }
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">
          {user ? "Edit User" : "Add New User"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium mb-1">Username *</label>
            <input
              type="text"
              required
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              disabled={!!user}
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1">Email *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          {/* Password */}
          {!user && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Password *
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-3 py-2 border rounded"
              />
            </div>
          )}

          {/* ✅ ROLES SECTION - SIMPLIFIED */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Roles * ({roles?.length || 0} available)
            </label>

            {/* Debug display */}
            {(!roles || roles.length === 0) && (
              <div className="text-red-600 text-sm mb-2">
                ⚠️ No roles available
              </div>
            )}

            {/* Roles list */}
            <div className="border rounded p-3 space-y-2 max-h-48 overflow-y-auto bg-gray-50">
              {roles && roles.length > 0 ? (
                roles.map((role) => (
                  <label
                    key={role.id}
                    className="flex items-center space-x-2 p-2 hover:bg-white rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.roles.includes(role.name)}
                      onChange={() => handleRoleToggle(role.name)}
                      className="h-4 w-4 rounded"
                    />
                    <div className="flex-1">
                      <span className="font-medium">{role.name}</span>
                      {role.description && (
                        <span className="text-xs text-gray-500 block">
                          {role.description}
                        </span>
                      )}
                    </div>
                  </label>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No roles loaded</p>
              )}
            </div>

            {/* Selected count */}
            {formData.roles.length > 0 && (
              <p className="text-xs text-green-600 mt-2">
                ✓ {formData.roles.length} role(s) selected:{" "}
                {formData.roles.join(", ")}
              </p>
            )}
          </div>

          {/* Active & Staff */}
          <div className="flex space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) =>
                  setFormData({ ...formData, is_active: e.target.checked })
                }
                className="rounded"
              />
              <span>Active</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.is_staff}
                onChange={(e) =>
                  setFormData({ ...formData, is_staff: e.target.checked })
                }
                className="rounded"
              />
              <span>Staff</span>
            </label>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formData.roles.length === 0}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
            >
              {user ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
