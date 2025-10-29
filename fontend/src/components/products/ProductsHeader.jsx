// src/components/products/ProductsHeader.jsx - COMPLETE

export const ProductsHeader = ({ onAddProduct }) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <p className="text-gray-500 mt-1">Manage your product inventory</p>
      </div>
      <button
        onClick={onAddProduct}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
      >
        <span className="text-xl">+</span>
        Add Product
      </button>
    </div>
  );
};
