// src/components/sales/SalesTable.jsx
import { formatCurrency, formatDateTime } from "../../utils/helpers";

export const SalesTable = ({ sales, onViewDetails, loading }) => {
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

  const getPaymentIcon = (method) => {
    const icons = {
      cash: "💵",
      card: "💳",
      upi: "📱",
      online: "🌐",
    };
    return icons[method] || "💰";
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                Invoice
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                Date & Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                Payment
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                Amount
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sales.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="px-6 py-12 text-center text-gray-500"
                >
                  <span className="text-4xl block mb-2">🧾</span>
                  <p className="text-lg font-semibold">No sales found</p>
                  <p className="text-sm">Try adjusting your filters</p>
                </td>
              </tr>
            ) : (
              sales.map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">
                      {sale.invoiceNumber}
                    </div>
                    <div className="text-sm text-gray-600">
                      {sale.items.length} item(s)
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {formatDateTime(sale.saleDate)}
                  </td>
                  <td className="px-6 py-4">
                    {sale.customerName ? (
                      <div>
                        <div className="font-medium text-gray-900">
                          {sale.customerName}
                        </div>
                        <div className="text-sm text-gray-600">
                          {sale.customerPhone}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">
                        Walk-in customer
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                      {getPaymentIcon(sale.paymentMethod)}{" "}
                      {sale.payment_method.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-gray-900">
                    {formatCurrency(sale.totalAmount)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => onViewDetails(sale)}
                      className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition text-sm font-medium"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden divide-y divide-gray-200">
        {sales.length === 0 ? (
          <div className="px-4 py-12 text-center text-gray-500">
            <span className="text-4xl block mb-2">🧾</span>
            <p className="text-lg font-semibold">No sales found</p>
            <p className="text-sm">Try adjusting your filters</p>
          </div>
        ) : (
          sales.map((sale) => (
            <div key={sale.id} className="p-4 hover:bg-gray-50 transition">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-gray-900">
                    {sale.invoiceNumber}
                  </h3>
                  <p className="text-xs text-gray-600">
                    {formatDateTime(sale.saleDate)}
                  </p>
                </div>
                <div className="font-bold text-lg text-gray-900">
                  {formatCurrency(sale.totalAmount)}
                </div>
              </div>

              {sale.customerName && (
                <div className="mb-2">
                  <p className="text-sm font-medium text-gray-900">
                    {sale.customerName}
                  </p>
                  <p className="text-xs text-gray-600">{sale.customerPhone}</p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                    {getPaymentIcon(sale.paymentMethod)}{" "}
                    {sale.payment_method.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-600">
                    {sale.items.length} item(s)
                  </span>
                </div>
                <button
                  onClick={() => onViewDetails(sale)}
                  className="px-3 py-1 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition text-sm font-medium"
                >
                  View
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
