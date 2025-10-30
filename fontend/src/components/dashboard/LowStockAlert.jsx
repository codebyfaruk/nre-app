// src/components/dashboard/LowStockAlert.jsx - FIXED
export const LowStockAlert = ({ items, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Low Stock Alert
        </h2>
        <div className="text-center py-8 text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="text-green-500 mr-2">✓</span>
          Low Stock Alert
        </h2>
        <div className="text-center py-8">
          <div className="text-4xl mb-2">✅</div>
          <p className="text-gray-600 font-medium">All Good!</p>
          <p className="text-gray-500 text-sm">No low stock items</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <span className="text-red-500 mr-2">⚠</span>
        Low Stock Alert ({items.length})
      </h2>
      <div className="space-y-4">
        {items.map((item) => {
          // ✅ FIXED: Handle both nested and direct product access
          const productName = item.product?.name || "Unknown Product";
          const shopName = item.shop?.name || "Unknown Shop";
          const quantity = item.quantity || 0;
          const minStock = item.min_stock_level || 10;
          const percentage = Math.min((quantity / minStock) * 100, 100);

          return (
            <div
              key={item.id}
              className="border border-red-200 rounded-lg p-4 bg-red-50"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium text-gray-900">{productName}</h3>
                  <p className="text-sm text-gray-600">{shopName}</p>
                </div>
                <span className="text-red-600 font-bold">{quantity}</span>
              </div>

              {/* Progress Bar */}
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {quantity} / {minStock} (Min Stock)
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
