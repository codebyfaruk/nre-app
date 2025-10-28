// src/components/returns/ReturnsHeader.jsx
import { formatCurrency } from "../../utils/helpers";

export const ReturnsHeader = ({
  totalReturns,
  pendingReturns,
  totalRefunds,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6">
      <div className="flex flex-col gap-4">
        {/* Title */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
            <span className="mr-2">↩️</span>
            Returns Management
          </h2>
          <p className="text-gray-600 text-xs sm:text-sm mt-1">
            Process and manage product returns
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Total Returns</p>
            <p className="text-2xl font-bold text-gray-900">{totalReturns}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <p className="text-sm text-yellow-700 mb-1">Pending Review</p>
            <p className="text-2xl font-bold text-yellow-900">
              {pendingReturns}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Total Refunds</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(totalRefunds)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
