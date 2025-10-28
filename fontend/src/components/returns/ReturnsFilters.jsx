// src/components/returns/ReturnsFilters.jsx
export const ReturnsFilters = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  selectedShop,
  onShopChange,
  shops,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Search
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              🔍
            </span>
            <input
              type="text"
              placeholder="Return # or customer..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-gray-900 focus:ring-2 focus:ring-gray-200 outline-none transition"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-gray-900 focus:ring-2 focus:ring-gray-200 outline-none transition"
          >
            <option value="">All Status</option>
            <option value="pending">⏳ Pending</option>
            <option value="approved">✅ Approved</option>
            <option value="rejected">❌ Rejected</option>
          </select>
        </div>

        {/* Date From */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            From Date
          </label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-gray-900 focus:ring-2 focus:ring-gray-200 outline-none transition"
          />
        </div>

        {/* Date To */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            To Date
          </label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-gray-900 focus:ring-2 focus:ring-gray-200 outline-none transition"
          />
        </div>

        {/* Shop Filter */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Shop
          </label>
          <select
            value={selectedShop}
            onChange={(e) => onShopChange(e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-gray-900 focus:ring-2 focus:ring-gray-200 outline-none transition"
          >
            <option value="">All Shops</option>
            {shops.map((shop) => (
              <option key={shop.id} value={shop.id}>
                {shop.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Filters Display */}
      {(searchTerm || statusFilter || dateFrom || dateTo || selectedShop) && (
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
          {statusFilter && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              Status: {statusFilter}
              <button
                onClick={() => onStatusChange("")}
                className="ml-2 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </span>
          )}
          {dateFrom && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              From: {dateFrom}
              <button
                onClick={() => onDateFromChange("")}
                className="ml-2 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </span>
          )}
          {dateTo && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              To: {dateTo}
              <button
                onClick={() => onDateToChange("")}
                className="ml-2 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </span>
          )}
          {selectedShop && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              Shop: {shops.find((s) => s.id === parseInt(selectedShop))?.name}
              <button
                onClick={() => onShopChange("")}
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
