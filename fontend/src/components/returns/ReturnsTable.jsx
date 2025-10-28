// src/components/returns/ReturnsTable.jsx
import { formatCurrency, formatDateTime } from "../../utils/helpers";

export const ReturnsTable = ({ returns, onViewDetails, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      approved: "bg-green-100 text-green-800 border-green-200",
      rejected: "bg-red-100 text-red-800 border-red-200",
    };
    const icons = {
      pending: "⏳",
      approved: "✅",
      rejected: "❌",
    };
    return { className: badges[status], icon: icons[status] };
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                Return #
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                Invoice
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                Reason
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                Refund
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {returns.length === 0 ? (
              <tr>
                <td
                  colSpan="8"
                  className="px-6 py-12 text-center text-gray-500"
                >
                  <span className="text-4xl block mb-2">↩️</span>
                  <p className="text-lg font-semibold">No returns found</p>
                  <p className="text-sm">Try adjusting your filters</p>
                </td>
              </tr>
            ) : (
              returns.map((returnItem) => {
                const badge = getStatusBadge(returnItem.status);
                return (
                  <tr
                    key={returnItem.id}
                    className="hover:bg-gray-50 transition"
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">
                        {returnItem.returnNumber}
                      </div>
                      <div className="text-sm text-gray-600">
                        {returnItem.items.length} item(s)
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {returnItem.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatDateTime(returnItem.returnDate)}
                    </td>
                    <td className="px-6 py-4">
                      {returnItem.customerName ? (
                        <div>
                          <div className="font-medium text-gray-900">
                            {returnItem.customerName}
                          </div>
                          {returnItem.customerPhone && (
                            <div className="text-sm text-gray-600">
                              {returnItem.customerPhone}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Walk-in</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                      {returnItem.reason}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-gray-900">
                      {formatCurrency(returnItem.refundAmount)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${badge.className}`}
                      >
                        {badge.icon} {returnItem.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => onViewDetails(returnItem)}
                        className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition text-sm font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden divide-y divide-gray-200">
        {returns.length === 0 ? (
          <div className="px-4 py-12 text-center text-gray-500">
            <span className="text-4xl block mb-2">↩️</span>
            <p className="text-lg font-semibold">No returns found</p>
            <p className="text-sm">Try adjusting your filters</p>
          </div>
        ) : (
          returns.map((returnItem) => {
            const badge = getStatusBadge(returnItem.status);
            return (
              <div
                key={returnItem.id}
                className="p-4 hover:bg-gray-50 transition"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900">
                      {returnItem.returnNumber}
                    </h3>
                    <p className="text-xs text-gray-600">
                      {formatDateTime(returnItem.returnDate)}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Invoice: {returnItem.invoiceNumber}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${badge.className}`}
                  >
                    {badge.icon} {returnItem.status}
                  </span>
                </div>

                {returnItem.customerName && (
                  <div className="mb-2">
                    <p className="text-sm font-medium text-gray-900">
                      {returnItem.customerName}
                    </p>
                    {returnItem.customerPhone && (
                      <p className="text-xs text-gray-600">
                        {returnItem.customerPhone}
                      </p>
                    )}
                  </div>
                )}

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {returnItem.reason}
                </p>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600">Refund Amount</p>
                    <p className="font-bold text-lg text-gray-900">
                      {formatCurrency(returnItem.refundAmount)}
                    </p>
                  </div>
                  <button
                    onClick={() => onViewDetails(returnItem)}
                    className="px-3 py-1 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition text-sm font-medium"
                  >
                    View
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
