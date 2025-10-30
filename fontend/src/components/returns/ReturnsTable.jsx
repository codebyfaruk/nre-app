// src/components/returns/ReturnsTable.jsx - WITH VIEW DETAILS

import { formatDateTime } from "../../utils/helpers";

export const ReturnsTable = ({
  returns,
  onViewDetails,
  loading,
  currentPage,
  totalPages,
  onPageChange,
  totalResults,
  itemsPerPage,
}) => {
  const getStatusBadge = (status) => {
    const badges = {
      pending: {
        className: "bg-yellow-100 text-yellow-800 border-yellow-300",
        icon: "⏳",
      },
      approved: {
        className: "bg-green-100 text-green-800 border-green-300",
        icon: "✅",
      },
      rejected: {
        className: "bg-red-100 text-red-800 border-red-300",
        icon: "❌",
      },
      completed: {
        className: "bg-blue-100 text-blue-800 border-blue-300",
        icon: "🏁",
      },
    };
    return badges[status] || badges.pending;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
        <div className="animate-spin inline-block w-12 h-12 border-4 border-slate-300 border-t-blue-600 rounded-full"></div>
        <p className="mt-4 text-slate-500 font-medium">Loading returns...</p>
      </div>
    );
  }

  if (returns.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
        <div className="text-6xl mb-4">↩️</div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">
          No returns found
        </h3>
        <p className="text-slate-500">Try adjusting your filters</p>
      </div>
    );
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalResults);

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b-2 border-slate-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                Return #
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                Invoice
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-4 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">
                Refund
              </th>
              <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {returns.map((returnItem, index) => {
              const badge = getStatusBadge(returnItem.status);
              return (
                <tr
                  key={returnItem.id}
                  className={`hover:bg-blue-50 transition ${
                    index % 2 === 0 ? "bg-white" : "bg-slate-50"
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">
                      {returnItem.return_number}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900 font-medium">
                    {returnItem.invoice_number || "N/A"}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {formatDateTime(returnItem.return_date)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-bold text-slate-900">
                      ₹{parseFloat(returnItem.refund_amount || 0).toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border-2 ${badge.className}`}
                    >
                      <span>{badge.icon}</span>
                      <span>{returnItem.status.toUpperCase()}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => onViewDetails(returnItem)}
                      className="px-4 py-2 bg-blue-600 text-white font-bold text-sm rounded-lg hover:bg-blue-700 transition shadow-md"
                    >
                      👁️ View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="bg-slate-50 px-6 py-4 border-t-2 border-slate-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-600 font-medium">
            Showing{" "}
            <span className="font-bold text-slate-900">{startItem}</span> to{" "}
            <span className="font-bold text-slate-900">{endItem}</span> of{" "}
            <span className="font-bold text-slate-900">{totalResults}</span>{" "}
            returns
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-bold rounded-lg border-2 border-slate-300 text-slate-700 hover:border-blue-500 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              ← Prev
            </button>

            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, index) => {
                const pageNum = index + 1;
                if (
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => onPageChange(pageNum)}
                      className={`px-3 py-2 text-sm font-bold rounded-lg transition ${
                        currentPage === pageNum
                          ? "bg-blue-600 text-white"
                          : "border-2 border-slate-300 text-slate-700 hover:border-blue-500"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                } else if (
                  pageNum === currentPage - 2 ||
                  pageNum === currentPage + 2
                ) {
                  return (
                    <span
                      key={pageNum}
                      className="px-2 text-slate-500 font-bold"
                    >
                      ...
                    </span>
                  );
                }
                return null;
              })}
            </div>

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-bold rounded-lg border-2 border-slate-300 text-slate-700 hover:border-blue-500 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
