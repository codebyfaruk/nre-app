// src/components/sales/SalesDetailModal.jsx
import { useEffect } from "react";
import { formatCurrency, formatDateTime } from "../../utils/helpers";

export const SalesDetailModal = ({ sale, shop, onClose }) => {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handlePrint = () => {
    window.print();
  };

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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-100">
      {/* Header Actions - No Print */}
      <div className="sticky top-0 bg-white shadow-md z-10 print:hidden">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Sale Details</h3>
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="btn-primary flex items-center space-x-2"
            >
              <span>🖨️</span>
              <span>Print</span>
            </button>
            <button onClick={onClose} className="btn-secondary">
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Invoice Content */}
      <div className="max-w-4xl mx-auto p-4 sm:p-8">
        <div className="bg-white rounded-xl shadow-lg p-8 print:shadow-none print:rounded-none">
          {/* Header */}
          <div className="flex items-start justify-between mb-8 pb-6 border-b-2 border-gray-900">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                ⚡ ElectroShop
              </h1>
              <p className="text-sm text-gray-600">{shop?.name}</p>
              <p className="text-sm text-gray-600">{shop?.address}</p>
              <p className="text-sm text-gray-600">{shop?.phone}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                INVOICE
              </div>
              <p className="text-sm text-gray-600">#{sale.invoiceNumber}</p>
              <p className="text-sm text-gray-600">
                {formatDateTime(sale.saleDate)}
              </p>
            </div>
          </div>

          {/* Customer & Payment Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Customer Details */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">
                Bill To:
              </h3>
              {sale.customerName ? (
                <div>
                  <p className="text-sm text-gray-900 font-medium">
                    {sale.customerName}
                  </p>
                  <p className="text-sm text-gray-600">{sale.customerPhone}</p>
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">Walk-in Customer</p>
              )}
            </div>

            {/* Payment Details */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">
                Payment Details:
              </h3>
              <div className="space-y-1">
                <div className="flex items-center text-sm">
                  <span className="text-gray-600 w-32">Method:</span>
                  <span className="font-medium text-gray-900">
                    {getPaymentIcon(sale.paymentMethod)}{" "}
                    {sale.payment_method.toUpperCase()}
                  </span>
                </div>
                {sale.paymentReference && (
                  <div className="flex items-center text-sm">
                    <span className="text-gray-600 w-32">Reference:</span>
                    <span className="font-medium text-gray-900">
                      {sale.paymentReference}
                    </span>
                  </div>
                )}
                <div className="flex items-center text-sm">
                  <span className="text-gray-600 w-32">Status:</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">
                    {sale.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <h3 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wide">
              Items:
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-900">
                    <th className="text-left py-3 text-sm font-semibold text-gray-900">
                      Item
                    </th>
                    <th className="text-center py-3 text-sm font-semibold text-gray-900">
                      Qty
                    </th>
                    <th className="text-right py-3 text-sm font-semibold text-gray-900">
                      Price
                    </th>
                    <th className="text-right py-3 text-sm font-semibold text-gray-900">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sale.items.map((item, index) => (
                    <tr key={index} className="border-b border-gray-200">
                      <td className="py-3">
                        <div>
                          <div className="font-medium text-gray-900 text-sm">
                            {item.productName}
                          </div>
                          <div className="text-xs text-gray-600">
                            SKU: {item.productSku}
                          </div>
                        </div>
                      </td>
                      <td className="text-center py-3 text-sm text-gray-900">
                        {item.quantity}
                      </td>
                      <td className="text-right py-3 text-sm text-gray-900">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="text-right py-3 font-semibold text-sm text-gray-900">
                        {formatCurrency(item.totalPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary */}
          <div className="flex justify-end mb-8">
            <div className="w-full md:w-80">
              <div className="space-y-2">
                <div className="flex justify-between py-2 text-sm text-gray-600">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(sale.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between py-2 text-sm text-gray-600">
                  <span>Tax (18% GST):</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(sale.taxAmount)}
                  </span>
                </div>
                <div className="flex justify-between py-3 border-t-2 border-gray-900 text-lg font-bold text-gray-900">
                  <span>Total Amount:</span>
                  <span>{formatCurrency(sale.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {sale.notes && (
            <div className="mb-8 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2 text-sm">
                Notes:
              </h4>
              <p className="text-sm text-gray-600">{sale.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="pt-6 border-t border-gray-300 text-center">
            <p className="text-sm text-gray-600">
              Thank you for your business!
            </p>
            <p className="text-xs text-gray-500 mt-2">
              This is a computer-generated invoice and does not require a
              signature.
            </p>
            <p className="text-xs text-gray-500 mt-1">
              For queries, contact us at {shop?.phone} or {shop?.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
