// src/components/products/ProductsHeader.jsx
export const ProductsHeader = ({ onAddProduct }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Title */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
            <span className="mr-2">📦</span>
            Inventory Management
          </h2>
          <p className="text-gray-600 text-xs sm:text-sm mt-1">
            Manage your product inventory
          </p>
        </div>

        {/* Add Button */}
        <button
          onClick={onAddProduct}
          className="btn-primary flex items-center justify-center space-x-2 w-full md:w-auto"
        >
          <span>➕</span>
          <span>Add Product</span>
        </button>
      </div>
    </div>
  );
};
