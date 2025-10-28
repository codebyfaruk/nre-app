// src/components/dashboard/RecentSalesTable.jsx
import {
  formatCurrency,
  formatDate,
  getStatusBadgeClass,
} from "../../utils/helpers";

export const RecentSalesTable = ({ sales, loading }) => {
  if (loading) {
    return (
      <div className="lg:col-span-2 bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="h-6 bg-gray-200 rounded w-48 animate-pulse" />
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:col-span-2 bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center">
          <span className="mr-2">🧾</span>Recent Sales
        </h3>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                Invoice
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                Date
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                Total
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sales.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                  <span className="text-4xl block mb-2">📭</span>
                  No sales yet. Go to POS to make your first sale!
                </td>
              </tr>
            ) : (
              sales.map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-semibold text-sm">
                    {sale.invoiceNumber}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatDate(sale.saleDate)}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-gray-900">
                    {formatCurrency(sale.totalAmount)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`px-3 py-1 text-xs rounded-full ${getStatusBadgeClass(
                        sale.status
                      )}`}
                    >
                      {sale.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-gray-200">
        {sales.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500">
            <span className="text-4xl block mb-2">📭</span>
            No sales yet. Go to POS to make your first sale!
          </div>
        ) : (
          sales.map((sale) => (
            <div key={sale.id} className="p-4 hover:bg-gray-50 transition">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-gray-900">
                    {sale.invoiceNumber}
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatDate(sale.saleDate)}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(
                    sale.status
                  )}`}
                >
                  {sale.status.toUpperCase()}
                </span>
              </div>
              <div className="font-bold text-lg text-gray-900">
                {formatCurrency(sale.totalAmount)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
