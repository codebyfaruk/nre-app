// src/components/dashboard/RecentSalesTable.jsx - FIXED
export const RecentSalesTable = ({ sales, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Recent Sales
        </h2>
        <div className="text-center py-8 text-gray-500">Loading...</div>
      </div>
    );
  }

  // ✅ Helper functions
  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadgeClass = (status) => {
    const baseClasses = "px-2 py-1 text-xs font-semibold rounded-full";
    switch (status?.toLowerCase()) {
      case "completed":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "pending":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case "cancelled":
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  if (!sales || sales.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Recent Sales
        </h2>
        <div className="text-center py-8">
          <div className="text-4xl mb-2">📭</div>
          <p className="text-gray-600">No sales yet</p>
          <p className="text-gray-500 text-sm">
            Go to POS to make your first sale!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Recent Sales ({sales.length})
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 text-sm font-medium text-gray-600">
                Invoice
              </th>
              <th className="text-left py-2 text-sm font-medium text-gray-600">
                Date
              </th>
              <th className="text-right py-2 text-sm font-medium text-gray-600">
                Total
              </th>
              <th className="text-center py-2 text-sm font-medium text-gray-600">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => (
              <tr key={sale.id} className="border-b hover:bg-gray-50">
                <td className="py-3 text-sm font-medium text-gray-900">
                  {sale.invoice_number || "N/A"}
                </td>
                <td className="py-3 text-sm text-gray-600">
                  {formatDate(sale.sale_date || sale.created_at)}
                </td>
                <td className="py-3 text-sm font-semibold text-gray-900 text-right">
                  {formatCurrency(sale.total_amount)}
                </td>
                <td className="py-3 text-center">
                  <span className={getStatusBadgeClass(sale.status)}>
                    {(sale.status || "pending").toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
