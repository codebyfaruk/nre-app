// src/components/products/ProductsTable.jsx
import { formatCurrency } from "../../utils/helpers";

export const ProductsTable = ({ products, onEdit, onDelete, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                SKU
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Brand
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  className="px-6 py-12 text-center text-gray-500"
                >
                  <span className="text-4xl block mb-2">📦</span>
                  <p className="text-lg font-semibold">No products found</p>
                  <p className="text-sm">
                    Try adjusting your filters or add a new product
                  </p>
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <ProductTableRow
                  key={product.id}
                  product={product}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden divide-y divide-gray-200">
        {products.length === 0 ? (
          <div className="px-4 py-12 text-center text-gray-500">
            <span className="text-4xl block mb-2">📦</span>
            <p className="text-lg font-semibold">No products found</p>
            <p className="text-sm">
              Try adjusting your filters or add a new product
            </p>
          </div>
        ) : (
          products.map((product) => (
            <ProductMobileCard
              key={product.id}
              product={product}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  );
};

// Desktop Table Row Component
const ProductTableRow = ({ product, onEdit, onDelete }) => (
  <tr className="hover:bg-gray-50 transition">
    <td className="px-6 py-4">
      <div>
        <div className="font-semibold text-gray-900">{product.name}</div>
        <div className="text-sm text-gray-500">{product.model}</div>
      </div>
    </td>
    <td className="px-6 py-4 text-sm text-gray-600">{product.sku}</td>
    <td className="px-6 py-4 text-sm text-gray-600">{product.categoryName}</td>
    <td className="px-6 py-4 text-sm text-gray-600">{product.brand}</td>
    <td className="px-6 py-4 text-right">
      <div className="font-bold text-gray-900">
        {formatCurrency(product.price)}
      </div>
      {product.discountPrice && (
        <div className="text-sm text-gray-500 line-through">
          {formatCurrency(product.discountPrice)}
        </div>
      )}
    </td>
    <td className="px-6 py-4 text-center">
      <span
        className={`px-3 py-1 text-xs font-semibold rounded-full ${
          product.isActive
            ? "bg-gray-200 text-gray-900"
            : "bg-gray-100 text-gray-500"
        }`}
      >
        {product.isActive ? "Active" : "Inactive"}
      </span>
    </td>
    <td className="px-6 py-4 text-center">
      <div className="flex items-center justify-center space-x-2">
        <button
          onClick={() => onEdit(product)}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
          title="Edit"
        >
          ✏️
        </button>
        <button
          onClick={() => onDelete(product)}
          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
          title="Delete"
        >
          🗑️
        </button>
      </div>
    </td>
  </tr>
);

// Mobile Card Component
const ProductMobileCard = ({ product, onEdit, onDelete }) => (
  <div className="p-4 hover:bg-gray-50 transition">
    <div className="flex justify-between items-start mb-3">
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 mb-1 truncate">
          {product.name}
        </h3>
        <p className="text-sm text-gray-600">
          {product.brand} • {product.model}
        </p>
        <p className="text-xs text-gray-500 mt-1">SKU: {product.sku}</p>
      </div>
      <span
        className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ml-2 ${
          product.isActive
            ? "bg-gray-200 text-gray-900"
            : "bg-gray-100 text-gray-500"
        }`}
      >
        {product.isActive ? "Active" : "Inactive"}
      </span>
    </div>

    <div className="flex items-center justify-between">
      <div>
        <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded mb-2">
          {product.categoryName}
        </span>
        <div className="font-bold text-gray-900">
          {formatCurrency(product.price)}
        </div>
        {product.discountPrice && (
          <div className="text-sm text-gray-500 line-through">
            {formatCurrency(product.discountPrice)}
          </div>
        )}
      </div>
      <div className="flex space-x-2">
        <button
          onClick={() => onEdit(product)}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition text-xl"
        >
          ✏️
        </button>
        <button
          onClick={() => onDelete(product)}
          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition text-xl"
        >
          🗑️
        </button>
      </div>
    </div>
  </div>
);
