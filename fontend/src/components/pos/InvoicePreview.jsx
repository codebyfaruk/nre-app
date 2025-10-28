// src/components/pos/InvoicePreview.jsx
import { useEffect } from "react";
import { formatCurrency, formatDateTime } from "../../utils/helpers";

export const InvoicePreview = ({ invoice, onClose, onPrint }) => {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-100">
      {/* Header Actions */}
      <div className="sticky top-0 bg-white shadow-md z-10 print:hidden">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Invoice Preview</h3>
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
              <p className="text-sm text-gray-600">{invoice.shop.name}</p>
              <p className="text-sm text-gray-600">{invoice.shop.address}</p>
              <p className="text-sm text-gray-600">{invoice.shop.phone}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                INVOICE
              </div>
              <p className="text-sm text-gray-600">#{invoice.invoiceNumber}</p>
              <p className="text-sm text-gray-600">
                {formatDateTime(invoice.saleDate)}
              </p>
            </div>
          </div>

          {/* Customer Details */}
          {(invoice.customerName || invoice.customerPhone) && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Bill To:</h3>
              {invoice.customerName && (
                <p className="text-sm text-gray-600">{invoice.customerName}</p>
              )}
              {invoice.customerPhone && (
                <p className="text-sm text-gray-600">{invoice.customerPhone}</p>
              )}
            </div>
          )}

          {/* Items Table */}
          <div className="mb-6">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-900">
                  <th className="text-left py-3 font-semibold text-gray-900">
                    Item
                  </th>
                  <th className="text-center py-3 font-semibold text-gray-900">
                    Qty
                  </th>
                  <th className="text-right py-3 font-semibold text-gray-900">
                    Price
                  </th>
                  <th className="text-right py-3 font-semibold text-gray-900">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="py-3">
                      <div>
                        <div className="font-medium text-gray-900">
                          {item.productName}
                        </div>
                        <div className="text-sm text-gray-600">
                          {item.productSku}
                        </div>
                      </div>
                    </td>
                    <td className="text-center py-3 text-gray-900">
                      {item.quantity}
                    </td>
                    <td className="text-right py-3 text-gray-900">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="text-right py-3 font-semibold text-gray-900">
                      {formatCurrency(item.totalPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="flex justify-end mb-6">
            <div className="w-64">
              <div className="flex justify-between py-2 text-gray-600">
                <span>Subtotal:</span>
                <span className="font-semibold">
                  {formatCurrency(invoice.subtotal)}
                </span>
              </div>
              <div className="flex justify-between py-2 text-gray-600">
                <span>Tax (18%):</span>
                <span className="font-semibold">
                  {formatCurrency(invoice.taxAmount)}
                </span>
              </div>
              <div className="flex justify-between py-3 border-t-2 border-gray-900 text-lg font-bold text-gray-900">
                <span>Total:</span>
                <span>{formatCurrency(invoice.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Payment Method:</span>
                <span className="ml-2 font-semibold text-gray-900 capitalize">
                  {invoice.paymentMethod}
                </span>
              </div>
              {invoice.paymentMethod === "cash" && invoice.change > 0 && (
                <div>
                  <span className="text-gray-600">Change:</span>
                  <span className="ml-2 font-semibold text-gray-900">
                    {formatCurrency(invoice.change)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-2">Notes:</h4>
              <p className="text-sm text-gray-600">{invoice.notes}</p>
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
          </div>
        </div>
      </div>
    </div>
  );
};
