// src/components/products/ProductModal.jsx - COMPLETE WITH AUTOCOMPLETE

import { useState, useEffect, useRef } from "react";
import { apiService } from "../../services/api.service";
import { showError } from "../../utils/toast";

export const ProductModal = ({
  product,
  categories,
  shops,
  allProducts,
  onClose,
  onSave,
  onSwitchToEdit,
}) => {
  const [formData, setFormData] = useState({
    name: product?.name || "",
    sku: product?.sku || "",
    description: product?.description || "",
    categoryId: product?.category_id || "",
    brand: product?.brand || "",
    model: product?.model || "",
    price: product?.price || "",
    discountPrice: product?.discount_price || "",
    costPrice: product?.cost_price || "",
    specifications: product?.specifications || "",
    warrantyMonths: product?.warranty_months || 12,
    imageUrl: product?.image_url || "",
    isActive: product?.is_active ?? true,
  });

  const [shopInventory, setShopInventory] = useState({});
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(product?.image_url || "");
  const [uploading, setUploading] = useState(false);

  // ✅ Autocomplete states
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const searchRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  // ✅ Load existing inventory
  useEffect(() => {
    if (product && product.inventory) {
      const inventoryMap = {};
      product.inventory.forEach((inv) => {
        inventoryMap[inv.shop_id] = {
          inventoryId: inv.id,
          quantity: inv.quantity,
        };
      });

      shops.forEach((shop) => {
        if (!inventoryMap[shop.id]) {
          inventoryMap[shop.id] = { quantity: 0 };
        }
      });

      setShopInventory(inventoryMap);
    } else {
      const inventoryMap = {};
      shops.forEach((shop) => {
        inventoryMap[shop.id] = { quantity: 0 };
      });
      setShopInventory(inventoryMap);
    }
  }, [product, shops]);

  // ✅ Auto-generate SKU
  useEffect(() => {
    if (!product && formData.name && formData.name.length >= 2) {
      const words = formData.name.trim().split(/\s+/);
      let sku = words.map((word) => word[0]?.toUpperCase() || "").join("");

      if (sku.length < 2) {
        sku = formData.name
          .replace(/[^a-zA-Z]/g, "")
          .substring(0, 3)
          .toUpperCase();
      }

      setFormData((prev) => ({ ...prev, sku }));
    }
  }, [formData.name, product]);

  // ✅ Search suggestions on name change
  useEffect(() => {
    if (!product && formData.name && formData.name.length >= 1) {
      const searchTerm = formData.name.toLowerCase();
      const matches = allProducts
        .filter(
          (p) =>
            p.name.toLowerCase().includes(searchTerm) ||
            p.sku.toLowerCase().includes(searchTerm) ||
            p.brand.toLowerCase().includes(searchTerm)
        )
        .slice(0, 5);

      setSearchSuggestions(matches);
      setShowSuggestions(matches.length > 0);
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  }, [formData.name, product, allProducts]);

  // ✅ Handle clicking outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // ✅ Handle selecting a suggestion
  const handleSelectSuggestion = (selectedProduct) => {
    setShowSuggestions(false);
    onSwitchToEdit(selectedProduct);
  };

  // ✅ Keyboard navigation for suggestions
  const handleKeyDown = (e) => {
    if (!showSuggestions || searchSuggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) =>
        prev < searchSuggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter" && selectedSuggestionIndex >= 0) {
      e.preventDefault();
      handleSelectSuggestion(searchSuggestions[selectedSuggestionIndex]);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

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

    const saveData = {
      ...formData,
      shopInventory,
      existingProductId: product?.id,
    };

    onSave(saveData);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleShopInventoryChange = (shopId, value) => {
    setShopInventory((prev) => ({
      ...prev,
      [shopId]: {
        ...prev[shopId],
        quantity: parseInt(value) || 0,
      },
    }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showError("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showError("Image size must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const response = await apiService.uploadProductImage(file);
      setFormData((prev) => ({
        ...prev,
        imageUrl: response.data.file_url,
      }));
    } catch (error) {
      console.error("Image upload failed:", error);
      showError("Failed to upload image");
      setImagePreview(formData.imageUrl);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, imageUrl: "" }));
    setImagePreview("");
  };

  const getTotalStock = (productInventory) => {
    return (
      productInventory?.reduce((sum, inv) => sum + (inv.quantity || 0), 0) || 0
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
          <h2 className="text-xl font-semibold">
            {product ? "Edit Product" : "Add New Product"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ✅ Name with Autocomplete */}
            <div className="relative" ref={searchRef}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  if (searchSuggestions.length > 0) setShowSuggestions(true);
                }}
                disabled={!!product}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? "border-red-500" : "border-gray-300"
                } ${product ? "bg-gray-100" : ""}`}
                placeholder="Start typing to search..."
                autoComplete="off"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}

              {/* ✅ Autocomplete Dropdown */}
              {showSuggestions && !product && searchSuggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                  <div className="px-3 py-2 bg-blue-50 border-b text-xs text-blue-700 font-medium">
                    📦 Found {searchSuggestions.length} existing product
                    {searchSuggestions.length > 1 ? "s" : ""} - Click to edit
                  </div>
                  {searchSuggestions.map((suggestion, index) => {
                    const stock = getTotalStock(suggestion.inventory);
                    return (
                      <div
                        key={suggestion.id}
                        onClick={() => handleSelectSuggestion(suggestion)}
                        className={`px-4 py-3 cursor-pointer border-b last:border-b-0 hover:bg-blue-50 transition ${
                          index === selectedSuggestionIndex ? "bg-blue-50" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">
                              {suggestion.name}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {suggestion.brand} • SKU: {suggestion.sku} •
                              Stock: {stock}
                            </div>
                          </div>
                          <div className="text-xs text-blue-600 font-medium ml-2">
                            Click to edit →
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* SKU */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SKU *{" "}
                {!product && (
                  <span className="text-xs text-gray-400">
                    (Auto-generated)
                  </span>
                )}
              </label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                disabled={!!product}
                placeholder="e.g., ALZ"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.sku ? "border-red-500" : "border-gray-300"
                } ${product ? "bg-gray-100" : ""}`}
              />
              {errors.sku && (
                <p className="text-red-500 text-sm mt-1">{errors.sku}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.categoryId ? "border-red-500" : "border-gray-300"
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
                <p className="text-red-500 text-sm mt-1">{errors.categoryId}</p>
              )}
            </div>

            {/* Brand */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brand *
              </label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.brand ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.brand && (
                <p className="text-red-500 text-sm mt-1">{errors.brand}</p>
              )}
            </div>

            {/* Model */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Model
              </label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                step="0.01"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.price ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.price && (
                <p className="text-red-500 text-sm mt-1">{errors.price}</p>
              )}
            </div>

            {/* Discount Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Price
              </label>
              <input
                type="number"
                name="discountPrice"
                value={formData.discountPrice}
                onChange={handleChange}
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Cost Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cost Price *
              </label>
              <input
                type="number"
                name="costPrice"
                value={formData.costPrice}
                onChange={handleChange}
                step="0.01"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.costPrice ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.costPrice && (
                <p className="text-red-500 text-sm mt-1">{errors.costPrice}</p>
              )}
            </div>

            {/* Warranty Months */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Warranty (Months)
              </label>
              <input
                type="number"
                name="warrantyMonths"
                value={formData.warrantyMonths}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* IMAGE UPLOAD */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Image
              </label>

              {imagePreview && (
                <div className="mb-3 relative inline-block">
                  <img
                    src={
                      imagePreview.startsWith("data:")
                        ? imagePreview
                        : imagePreview.startsWith("http")
                        ? imagePreview
                        : `http://0.0.0.0:8000${imagePreview}`
                    }
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                    onError={(e) => {
                      e.target.src =
                        'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 24 24" fill="none" stroke="%23cbd5e1" stroke-width="2"%3E%3Crect x="3" y="3" width="18" height="18" rx="2"/%3E%3Ccircle cx="8.5" cy="8.5" r="1.5"/%3E%3Cpath d="M21 15l-5-5L5 21"/%3E%3C/svg%3E';
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                  >
                    ✕
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2">
                <label
                  className={`cursor-pointer ${
                    uploading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <div className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 border border-blue-200 inline-flex items-center gap-2">
                    <span>
                      {uploading ? "⏳ Uploading..." : "📁 Choose Image"}
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
                <span className="text-xs text-gray-500">
                  Max 5MB (JPG, PNG, GIF, WebP)
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Specifications */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specifications (JSON)
              </label>
              <textarea
                name="specifications"
                value={formData.specifications}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder='{"processor": "Intel i7", "ram": "16GB"}'
              />
            </div>

            {/* Active Status */}
            <div className="md:col-span-2 flex items-center">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label className="ml-2 text-sm font-medium text-gray-700">
                Active Product
              </label>
            </div>
          </div>

          {/* ✅ Stock per Shop Section - SHOW FOR BOTH ADD AND EDIT */}
          <div className="mt-6 border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">📦 Stock per Shop</h3>
              <span className="text-sm text-gray-500">
                {product
                  ? "Update quantities for each outlet"
                  : "Set initial stock for each outlet"}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {shops.map((shop) => {
                const inv = shopInventory[shop.id] || { quantity: 0 };
                return (
                  <div
                    key={shop.id}
                    className="border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-gray-50 to-white hover:shadow-md transition"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">{shop.name}</h4>
                      {inv.quantity > 0 && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                          In Stock
                        </span>
                      )}
                    </div>
                    <input
                      type="number"
                      value={inv.quantity || 0}
                      onChange={(e) =>
                        handleShopInventoryChange(shop.id, e.target.value)
                      }
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-lg font-semibold text-gray-900"
                      placeholder="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Current stock quantity
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${
                uploading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {product ? "Update" : "Add"} Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
