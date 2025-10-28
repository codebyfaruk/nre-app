// src/components/pos/ProductSearch.jsx
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
    const stock = inventory.find((inv) => inv.productId === product.id);
    const availableQty = stock ? stock.quantity - stock.reservedQuantity : 0;

    if (availableQty <= 0) {
      alert("Product is out of stock!");
      return;
    }

    onAddToCart(product, stock);
    setSearchTerm("");
    setShowResults(false);
  };

  return (
    <div ref={searchRef} className="relative">
      {/* Search Input */}
      <div className="relative">
        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">
          🔍
        </span>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          placeholder="Search products by name, SKU, or brand..."
          className="w-full pl-12 pr-4 py-3 sm:py-4 border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:ring-2 focus:ring-gray-200 outline-none transition text-sm sm:text-base"
        />
      </div>

      {/* Search Results Dropdown */}
      {showResults && searchTerm && filteredProducts.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-2xl max-h-96 overflow-y-auto">
          {filteredProducts.map((product) => {
            const stock = inventory.find((inv) => inv.productId === product.id);
            const availableQty = stock
              ? stock.quantity - stock.reservedQuantity
              : 0;

            return (
              <div
                key={product.id}
                onClick={() => handleSelectProduct(product)}
                className={`p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition ${
                  availableQty <= 0 ? "opacity-50" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate">
                      {product.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {product.brand} • {product.sku}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                        {product.categoryName}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          availableQty > 0
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        Stock: {availableQty}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <div className="font-bold text-gray-900">
                      {formatCurrency(product.discountPrice || product.price)}
                    </div>
                    {product.discountPrice && (
                      <div className="text-xs text-gray-500 line-through">
                        {formatCurrency(product.price)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* No Results */}
      {showResults && searchTerm && filteredProducts.length === 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-lg p-6 text-center">
          <span className="text-4xl block mb-2">🔍</span>
          <p className="text-gray-600">No products found</p>
          <p className="text-sm text-gray-500 mt-1">
            Try a different search term
          </p>
        </div>
      )}
    </div>
  );
};
