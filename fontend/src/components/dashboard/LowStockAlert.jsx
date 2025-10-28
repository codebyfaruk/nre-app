// src/components/dashboard/LowStockAlert.jsx
export const LowStockAlert = ({ items, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse" />
        </div>
        <div className="p-4">
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center">
          <span className="mr-2">⚠️</span>Low Stock Alert
        </h3>
      </div>

      {/* Content */}
      <div className="p-4 max-h-96 overflow-y-auto">
        {items.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <LowStockItem key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Empty State Component
const EmptyState = () => (
  <div className="text-center py-12">
    <span className="text-5xl block mb-3">✅</span>
    <p className="text-lg font-semibold text-gray-700">All Good!</p>
    <p className="text-sm text-gray-500">No low stock items</p>
  </div>
);

// Low Stock Item Component
const LowStockItem = ({ item }) => {
  const stockPercentage = ((item.quantity / item.minStockLevel) * 100).toFixed(
    0
  );

  return (
    <div className="flex items-center justify-between p-3 sm:p-4 bg-red-50 border-l-4 border-red-500 rounded-lg hover:shadow-md transition">
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        {/* Icon */}
        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-lg">⚠️</span>
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate text-sm sm:text-base">
            {item.product?.name || "Unknown Product"}
          </p>
          <p className="text-xs sm:text-sm text-gray-600">{item.shop?.name}</p>

          {/* Progress Bar */}
          <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-red-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(stockPercentage, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stock Count */}
      <div className="ml-3 sm:ml-4 text-right flex-shrink-0">
        <span className="text-xl sm:text-2xl font-bold text-red-600">
          {item.quantity}
        </span>
        <p className="text-xs text-gray-500">/ {item.minStockLevel}</p>
      </div>
    </div>
  );
};
