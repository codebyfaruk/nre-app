// src/components/pos/POSHeader.jsx
export const POSHeader = ({ selectedShop, shops, onShopChange, onNewSale }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Title */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
            <span className="mr-2">💰</span>
            Point of Sale
          </h2>
          <p className="text-gray-600 text-xs sm:text-sm mt-1">
            Create new sales and generate invoices
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Shop Selector */}
          <select
            value={selectedShop}
            onChange={(e) => onShopChange(e.target.value)}
            className="px-3 sm:px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-gray-900 focus:ring-2 focus:ring-gray-200 outline-none transition font-medium text-sm sm:text-base"
          >
            {shops.map((shop) => (
              <option key={shop.id} value={shop.id}>
                {shop.name}
              </option>
            ))}
          </select>

          {/* New Sale Button */}
          <button
            onClick={onNewSale}
            className="btn-secondary whitespace-nowrap text-sm sm:text-base"
          >
            🔄 New Sale
          </button>
        </div>
      </div>
    </div>
  );
};
