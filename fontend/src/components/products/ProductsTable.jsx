// src/components/products/ProductsTable.jsx - WITH REAL SHOP NAMES

import { formatCurrency } from "../../utils/helpers";

export const ProductsTable = ({
  products,
  categories,
  shops,
  loading,
  onEdit,
  onDelete,
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : "N/A";
  };

  // ✅ Get shop name by ID
  const getShopName = (shopId) => {
    const shop = shops.find((s) => s.id === shopId);
    return shop ? shop.name : `Shop ${shopId}`;
  };

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <div className="text-6xl mb-4">📦</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No products found
        </h3>
        <p className="text-gray-500">
          Try adjusting your filters or add a new product
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Image
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                SKU
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Brand
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map((product) => {
              const totalStock =
                product.inventory?.reduce(
                  (sum, inv) => sum + (inv.quantity || 0),
                  0
                ) || 0;
              const isLowStock = totalStock > 0 && totalStock <= 10;
              const isOutOfStock = totalStock === 0;

              return (
                <tr key={product.id} className="hover:bg-gray-50">
                  {/* Image */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <img
                      src={
                        product.image_url
                          ? product.image_url.startsWith("http")
                            ? product.image_url
                            : `http://0.0.0.0:8000${product.image_url}`
                          : 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="%23cbd5e1" stroke-width="2"%3E%3Crect x="3" y="3" width="18" height="18" rx="2"/%3E%3Ccircle cx="8.5" cy="8.5" r="1.5"/%3E%3Cpath d="M21 15l-5-5L5 21"/%3E%3C/svg%3E'
                      }
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                      onError={(e) => {
                        e.target.src =
                          'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="%23cbd5e1" stroke-width="2"%3E%3Crect x="3" y="3" width="18" height="18" rx="2"/%3E%3Ccircle cx="8.5" cy="8.5" r="1.5"/%3E%3Cpath d="M21 15l-5-5L5 21"/%3E%3C/svg%3E';
                      }}
                    />
                  </td>

                  {/* Product Name */}
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {product.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {product.brand} • {product.model || "N/A"}
                      </div>
                    </div>
                  </td>

                  {/* SKU */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-mono">
                      {product.sku}
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {getCategoryName(product.category_id)}
                    </span>
                  </td>

                  {/* Brand */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.brand}
                  </td>

                  {/* ✅ STOCK COLUMN - WITH REAL SHOP NAMES */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-semibold ${
                          isOutOfStock
                            ? "text-red-600"
                            : isLowStock
                            ? "text-orange-600"
                            : "text-green-600"
                        }`}
                      >
                        {totalStock}
                      </span>
                      {isOutOfStock && (
                        <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full font-medium">
                          Out of Stock
                        </span>
                      )}
                      {isLowStock && !isOutOfStock && (
                        <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full font-medium">
                          Low Stock
                        </span>
                      )}
                      {totalStock > 10 && (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full font-medium">
                          In Stock
                        </span>
                      )}
                    </div>
                    {/* ✅ Show breakdown with REAL shop names */}
                    {product.inventory && product.inventory.length > 0 && (
                      <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                        {product.inventory.map((inv) => (
                          <div key={inv.id} className="flex items-center gap-1">
                            <span className="font-medium">
                              {getShopName(inv.shop_id)}:
                            </span>
                            <span
                              className={
                                inv.quantity === 0
                                  ? "text-red-600"
                                  : "text-gray-700"
                              }
                            >
                              {inv.quantity}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </td>

                  {/* Price */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-medium">
                      {formatCurrency(product.price)}
                    </div>
                    {product.discount_price && (
                      <div className="text-xs text-green-600 font-medium">
                        Sale: {formatCurrency(product.discount_price)}
                      </div>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        product.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {product.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => onEdit(product)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(product.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
