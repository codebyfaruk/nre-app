// src/components/sales/SalesHeader.jsx
import { formatCurrency } from "../../utils/helpers";

export const SalesHeader = ({ totalSales, todaySales, todayRevenue }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6">
      <div className="flex flex-col gap-4">
        {/* Title */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
            <span className="mr-2">🧾</span>
            Sales History
          </h2>
          <p className="text-gray-600 text-xs sm:text-sm mt-1">
            View and manage all sales transactions
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Total Sales</p>
            <p className="text-2xl font-bold text-gray-900">{totalSales}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Today's Sales</p>
            <p className="text-2xl font-bold text-gray-900">{todaySales}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Today's Revenue</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(todayRevenue)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
