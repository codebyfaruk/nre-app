// src/components/products/ProductModal.jsx - MOBILE FIXED
import { useState, useEffect } from "react";

export const ProductModal = ({ product, categories, onClose, onSave }) => {
  const [formData, setFormData] = useState(
    product || {
      name: "",
      sku: "",
      description: "",
      categoryId: "",
      brand: "",
      model: "",
      price: "",
      discountPrice: "",
      costPrice: "",
      warrantyMonths: 12,
      isActive: true,
    }
  );

  const [errors, setErrors] = useState({});

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation
    const newErrors = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.sku) newErrors.sku = "SKU is required";
    if (!formData.categoryId) newErrors.categoryId = "Category is required";
    if (!formData.brand) newErrors.brand = "Brand is required";
    if (!formData.price) newErrors.price = "Price is required";
    if (!formData.costPrice) newErrors.costPrice = "Cost price is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
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

      {/* Modal Container - Centered with proper spacing */}
      <div className="flex min-h-full items-center justify-center p-4 sm:p-6 lg:p-8">
        <div
          className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl transform transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header - Sticky on scroll */}
          <div className="sticky top-0 z-10 bg-white rounded-t-xl border-b border-gray-200 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                {product ? "✏️ Edit Product" : "➕ Add Product"}
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

          {/* Form - Scrollable */}
          <form
            onSubmit={handleSubmit}
            className="max-h-[calc(100vh-200px)] overflow-y-auto"
          >
            <div className="p-4 sm:p-6 space-y-4">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Product Name <span className="text-red-500">*</span>
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
                  placeholder="e.g., iPhone 15 Pro Max"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* SKU */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    SKU <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => handleChange("sku", e.target.value)}
                    className={`w-full px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-lg outline-none transition text-sm sm:text-base ${
                      errors.sku
                        ? "border-red-300 focus:border-red-500"
                        : "border-gray-200 focus:border-gray-900"
                    }`}
                    placeholder="e.g., IP15PM-256"
                  />
                  {errors.sku && (
                    <p className="text-red-500 text-xs mt-1">{errors.sku}</p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => handleChange("categoryId", e.target.value)}
                    className={`w-full px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-lg outline-none transition text-sm sm:text-base ${
                      errors.categoryId
                        ? "border-red-300 focus:border-red-500"
                        : "border-gray-200 focus:border-gray-900"
                    }`}
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {errors.categoryId && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.categoryId}
                    </p>
                  )}
                </div>

                {/* Brand */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Brand <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => handleChange("brand", e.target.value)}
                    className={`w-full px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-lg outline-none transition text-sm sm:text-base ${
                      errors.brand
                        ? "border-red-300 focus:border-red-500"
                        : "border-gray-200 focus:border-gray-900"
                    }`}
                    placeholder="e.g., Apple"
                  />
                  {errors.brand && (
                    <p className="text-red-500 text-xs mt-1">{errors.brand}</p>
                  )}
                </div>

                {/* Model */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Model
                  </label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => handleChange("model", e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-lg focus:border-gray-900 outline-none transition text-sm sm:text-base"
                    placeholder="e.g., 15 Pro Max"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Price <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleChange("price", e.target.value)}
                    className={`w-full px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-lg outline-none transition text-sm sm:text-base ${
                      errors.price
                        ? "border-red-300 focus:border-red-500"
                        : "border-gray-200 focus:border-gray-900"
                    }`}
                    placeholder="134900"
                  />
                  {errors.price && (
                    <p className="text-red-500 text-xs mt-1">{errors.price}</p>
                  )}
                </div>

                {/* Discount Price */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Discount Price
                  </label>
                  <input
                    type="number"
                    value={formData.discountPrice}
                    onChange={(e) =>
                      handleChange("discountPrice", e.target.value)
                    }
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-lg focus:border-gray-900 outline-none transition text-sm sm:text-base"
                    placeholder="129900"
                  />
                </div>

                {/* Cost Price */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Cost Price <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.costPrice}
                    onChange={(e) => handleChange("costPrice", e.target.value)}
                    className={`w-full px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-lg outline-none transition text-sm sm:text-base ${
                      errors.costPrice
                        ? "border-red-300 focus:border-red-500"
                        : "border-gray-200 focus:border-gray-900"
                    }`}
                    placeholder="120000"
                  />
                  {errors.costPrice && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.costPrice}
                    </p>
                  )}
                </div>

                {/* Warranty */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Warranty (Months)
                  </label>
                  <input
                    type="number"
                    value={formData.warrantyMonths}
                    onChange={(e) =>
                      handleChange("warrantyMonths", e.target.value)
                    }
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-lg focus:border-gray-900 outline-none transition text-sm sm:text-base"
                    placeholder="12"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  rows="3"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-lg focus:border-gray-900 outline-none transition text-sm sm:text-base resize-none"
                  placeholder="Product description..."
                />
              </div>

              {/* Active Status */}
              <div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => handleChange("isActive", e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                  />
                  <span className="text-sm font-semibold text-gray-700">
                    Active Product
                  </span>
                </label>
              </div>
            </div>

            {/* Actions - Sticky at bottom */}
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
                  {product ? "💾 Update Product" : "➕ Add Product"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
