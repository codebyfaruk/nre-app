// src/components/shops/ShopModal.jsx
import { useState, useEffect } from "react";

export const ShopModal = ({ shop, onClose, onSave }) => {
  const [formData, setFormData] = useState(
    shop || {
      name: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      phone: "",
      email: "",
      isActive: true,
    }
  );

  const [errors, setErrors] = useState({});

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name) {
      newErrors.name = "Shop name is required";
    }

    if (!formData.address) {
      newErrors.address = "Address is required";
    }

    if (!formData.city) {
      newErrors.city = "City is required";
    }

    if (!formData.state) {
      newErrors.state = "State is required";
    }

    if (!formData.pincode) {
      newErrors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = "Pincode must be 6 digits";
    }

    if (!formData.phone) {
      newErrors.phone = "Phone is required";
    } else if (!/^\+?[\d\s-]{10,15}$/.test(formData.phone)) {
      newErrors.phone = "Invalid phone number";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSave(formData);
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4 sm:p-6 lg:p-8">
        <div
          className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl transform transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white rounded-t-xl border-b border-gray-200 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                {shop ? "✏️ Edit Shop" : "➕ Add Shop"}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition p-1"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="max-h-[calc(100vh-200px)] overflow-y-auto"
          >
            <div className="p-4 sm:p-6 space-y-4">
              {/* Shop Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Shop Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-lg outline-none transition text-sm sm:text-base ${
                    errors.name
                      ? "border-red-300 focus:border-red-500"
                      : "border-gray-200 focus:border-gray-900"
                  }`}
                  placeholder="e.g., Main Store"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  rows="2"
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-lg outline-none transition text-sm sm:text-base resize-none ${
                    errors.address
                      ? "border-red-300 focus:border-red-500"
                      : "border-gray-200 focus:border-gray-900"
                  }`}
                  placeholder="e.g., 123 Main Street, Downtown"
                />
                {errors.address && (
                  <p className="text-red-500 text-xs mt-1">{errors.address}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* City */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    className={`w-full px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-lg outline-none transition text-sm sm:text-base ${
                      errors.city
                        ? "border-red-300 focus:border-red-500"
                        : "border-gray-200 focus:border-gray-900"
                    }`}
                    placeholder="e.g., Mumbai"
                  />
                  {errors.city && (
                    <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                  )}
                </div>

                {/* State */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    State <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => handleChange("state", e.target.value)}
                    className={`w-full px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-lg outline-none transition text-sm sm:text-base ${
                      errors.state
                        ? "border-red-300 focus:border-red-500"
                        : "border-gray-200 focus:border-gray-900"
                    }`}
                    placeholder="e.g., Maharashtra"
                  />
                  {errors.state && (
                    <p className="text-red-500 text-xs mt-1">{errors.state}</p>
                  )}
                </div>

                {/* Pincode */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Pincode <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => handleChange("pincode", e.target.value)}
                    maxLength="6"
                    className={`w-full px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-lg outline-none transition text-sm sm:text-base ${
                      errors.pincode
                        ? "border-red-300 focus:border-red-500"
                        : "border-gray-200 focus:border-gray-900"
                    }`}
                    placeholder="e.g., 400001"
                  />
                  {errors.pincode && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.pincode}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    className={`w-full px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-lg outline-none transition text-sm sm:text-base ${
                      errors.phone
                        ? "border-red-300 focus:border-red-500"
                        : "border-gray-200 focus:border-gray-900"
                    }`}
                    placeholder="e.g., +91 98765 43210"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-lg outline-none transition text-sm sm:text-base ${
                    errors.email
                      ? "border-red-300 focus:border-red-500"
                      : "border-gray-200 focus:border-gray-900"
                  }`}
                  placeholder="e.g., mainstore@electroshop.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              {/* Active Status */}
              <div>
                <label className="flex items-center space-x-2 cursor-pointer p-4 border-2 border-gray-200 rounded-lg hover:border-gray-400 transition">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => handleChange("isActive", e.target.checked)}
                    className="w-4 h-4"
                  />
                  <div>
                    <span className="text-sm font-semibold text-gray-700">
                      Active Shop
                    </span>
                    <p className="text-xs text-gray-600">
                      Shop is operational and accepting sales
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 sm:p-6 rounded-b-xl">
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-secondary w-full sm:w-auto"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary w-full sm:w-auto">
                  {shop ? "💾 Update Shop" : "➕ Create Shop"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
