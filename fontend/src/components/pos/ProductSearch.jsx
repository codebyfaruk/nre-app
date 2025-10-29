// src/components/pos/ProductSearch.jsx - FIXED INVENTORY LOOKUP

import { useState, useEffect, useRef } from "react";
import { formatCurrency } from "../../utils/helpers";

export const ProductSearch = ({ products, inventory, onAddToCart }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter products
  const filteredProducts = products
    .filter((product) => {
      if (!searchTerm) return false;
      const term = searchTerm.toLowerCase();
      return (
        product.name.toLowerCase().includes(term) ||
        product.sku.toLowerCase().includes(term) ||
        product.brand.toLowerCase().includes(term)
      );
    })
    .slice(0, 10); // Limit to 10 results

  const handleSelectProduct = (product) => {
    // ✅ FIX: Use product_id (with underscore) not productId
    const stock = inventory.find((inv) => inv.product_id === product.id);

    // ✅ Calculate available quantity
    const availableQty = stock
      ? stock.quantity - (stock.reserved_quantity || 0)
      : 0;

    console.log("Product:", product.name);
    console.log("Stock found:", stock);
    console.log("Available quantity:", availableQty);

    if (availableQty <= 0) {
      alert(`"${product.name}" is out of stock!`);
      return;
    }

    onAddToCart(product, stock);
    setSearchTerm("");
    setShowResults(false);
  };

  return (
    <div className="relative" ref={searchRef}>
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          placeholder="Search by name, SKU, or brand..."
          className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <svg
          className="absolute left-4 top-3.5 h-5 w-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* Search Results Dropdown */}
      {showResults && searchTerm && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {filteredProducts.length > 0 ? (
            <>
              <div className="px-4 py-2 bg-gray-50 border-b text-sm text-gray-600 font-medium">
                {filteredProducts.length} product
                {filteredProducts.length > 1 ? "s" : ""} found
              </div>
              {filteredProducts.map((product) => {
                // ✅ FIX: Use product_id (with underscore)
                const stock = inventory.find(
                  (inv) => inv.product_id === product.id
                );
                const availableQty = stock
                  ? stock.quantity - (stock.reserved_quantity || 0)
                  : 0;

                return (
                  <div
                    key={product.id}
                    onClick={() => handleSelectProduct(product)}
                    className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0 transition"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {product.name}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {product.brand} • {product.sku}
                        </div>
                      </div>
                      <div className="ml-4 text-right">
                        <div className="font-semibold text-gray-900">
                          {formatCurrency(
                            product.discount_price || product.price
                          )}
                        </div>
                        <div
                          className={`text-sm font-medium mt-1 ${
                            availableQty === 0
                              ? "text-red-600"
                              : availableQty < 10
                              ? "text-orange-600"
                              : "text-green-600"
                          }`}
                        >
                          {availableQty === 0
                            ? "Out of Stock"
                            : availableQty < 10
                            ? `Only ${availableQty} left`
                            : `${availableQty} in stock`}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            <div className="px-4 py-8 text-center text-gray-500">
              <div className="text-4xl mb-2">🔍</div>
              <div className="font-medium">No products found</div>
              <div className="text-sm mt-1">Try a different search term</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
