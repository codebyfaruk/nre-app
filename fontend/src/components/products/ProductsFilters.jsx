// src/components/products/ProductsFilters.jsx - FIXED

export const ProductsFilters = ({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  onAddClick,
}) => {
  return (
    <div className="p-6 bg-white rounded-2xl shadow-sm mb-6">
      <div className="flex flex-col md:flex-row gap-4 items-end">
        {/* Search */}
        <div className="flex-1">
          <label className="block text-sm font-bold text-slate-700 mb-2">
            Search
          </label>
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 outline-none"
          />
        </div>

        {/* Category Filter */}
        <div className="flex-1">
          <label className="block text-sm font-bold text-slate-700 mb-2">
            Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Add Product Button */}
        <button
          onClick={onAddClick}
          className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition whitespace-nowrap"
        >
          ➕ Add Product
        </button>
      </div>
    </div>
  );
};
