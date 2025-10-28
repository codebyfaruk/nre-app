// src/components/shops/ShopsFilters.jsx
export const ShopsFilters = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Search */}
        <div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search by name, city, or phone..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 sm:py-3 border-2 border-gray-200 rounded-lg focus:border-gray-900 focus:ring-2 focus:ring-gray-200 outline-none transition"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-lg focus:border-gray-900 focus:ring-2 focus:ring-gray-200 outline-none transition"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Active Filters Display */}
      {(searchTerm || statusFilter !== "all") && (
        <div className="mt-4 flex flex-wrap gap-2">
          {searchTerm && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              Search: {searchTerm}
              <button
                onClick={() => onSearchChange("")}
                className="ml-2 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </span>
          )}
          {statusFilter !== "all" && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              Status:{" "}
              {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
              <button
                onClick={() => onStatusChange("all")}
                className="ml-2 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};
