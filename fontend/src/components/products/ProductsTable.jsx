// src/components/products/ProductsTable.jsx - WITH PAGINATION

import { formatCurrency } from "../../utils/helpers";

export const ProductsTable = ({
  products,
  categories,
  shops,
  loading,
  onEdit,
  onDelete,
  currentPage,
  totalPages,
  onPageChange,
  totalResults,
  itemsPerPage,
}) => {
  const getCategoryName = (categoryId) => {
    return categories.find((c) => c.id === categoryId)?.name || "N/A";
  };

  const getShopName = (shopId) => {
    return shops.find((s) => s.id === shopId)?.name || "N/A";
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
        <div className="animate-spin inline-block w-12 h-12 border-4 border-slate-300 border-t-blue-600 rounded-full"></div>
        <p className="mt-4 text-slate-500 font-medium">Loading products...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
        <div className="text-6xl mb-4">📦</div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">
          No products found
        </h3>
        <p className="text-slate-500">
          Try adjusting your filters or add a new product
        </p>
      </div>
    );
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalResults);

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b-2 border-slate-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                Image
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                SKU
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                Brand
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {products.map((product, index) => {
              const totalStock = (product.inventory || []).reduce(
                (sum, inv) => sum + inv.quantity,
                0
              );
              const isOutOfStock = totalStock === 0;
              const isLowStock = totalStock > 0 && totalStock <= 10;

              return (
                <tr
                  key={product.id}
                  className={`hover:bg-blue-50 transition ${
                    index % 2 === 0 ? "bg-white" : "bg-slate-50"
                  }`}
                >
                  <td className="px-6 py-4">
                    <img
                      src={product.image_url || "placeholder.png"}
                      alt={product.name}
                      className="h-12 w-12 object-cover rounded-lg border border-slate-200"
                      onError={(e) => {
                        e.target.src =
                          "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2248%22 height=%2248%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23cbd5e1%22 stroke-width=%222%22%3E%3Crect x=%223%22 y=%223%22 width=%2218%22 height=%2218%22 rx=%222%22/%3E%3Ccircle cx=%228.5%22 cy=%228.5%22 r=%221.5%22/%3E%3Cpath d=%22M21 15l-5-5L5 21%22/%3E%3C/svg%3E";
                      }}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">
                      {product.name}
                    </div>
                    <div className="text-sm text-slate-500">
                      {product.brand} • {product.model || "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">
                    {product.sku}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900">
                    {getCategoryName(product.category_id)}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900">
                    {product.brand}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">
                        {totalStock}
                      </span>
                      {isOutOfStock && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded">
                          Out of Stock
                        </span>
                      )}
                      {isLowStock && !isOutOfStock && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded">
                          Low Stock
                        </span>
                      )}
                      {totalStock > 10 && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">
                          In Stock
                        </span>
                      )}
                    </div>
                    {product.inventory && product.inventory.length > 0 && (
                      <div className="text-xs text-slate-500 mt-2 space-y-1">
                        {product.inventory.map((inv) => (
                          <div key={inv.id}>
                            {getShopName(inv.shop_id)}: {inv.quantity}
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">
                      {formatCurrency(product.price)}
                    </div>
                    {product.discount_price && (
                      <div className="text-sm text-red-600 line-through">
                        Sale: {formatCurrency(product.discount_price)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        product.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {product.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onEdit(product)}
                        className="px-3 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(product.id)}
                        className="px-3 py-2 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ✅ Pagination Footer */}
      <div className="bg-slate-50 px-6 py-4 border-t-2 border-slate-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-600 font-medium">
            Showing{" "}
            <span className="font-bold text-slate-900">{startItem}</span> to{" "}
            <span className="font-bold text-slate-900">{endItem}</span> of{" "}
            <span className="font-bold text-slate-900">{totalResults}</span>{" "}
            products
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-bold rounded-lg border-2 border-slate-300 text-slate-700 hover:border-blue-500 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              ← Prev
            </button>

            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, index) => {
                const pageNum = index + 1;
                if (
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => onPageChange(pageNum)}
                      className={`px-3 py-2 text-sm font-bold rounded-lg transition ${
                        currentPage === pageNum
                          ? "bg-blue-600 text-white"
                          : "border-2 border-slate-300 text-slate-700 hover:border-blue-500"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                } else if (
                  pageNum === currentPage - 2 ||
                  pageNum === currentPage + 2
                ) {
                  return (
                    <span
                      key={pageNum}
                      className="px-2 text-slate-500 font-bold"
                    >
                      ...
                    </span>
                  );
                }
                return null;
              })}
            </div>

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-bold rounded-lg border-2 border-slate-300 text-slate-700 hover:border-blue-500 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
