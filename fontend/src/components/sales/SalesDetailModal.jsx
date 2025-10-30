// src/components/sales/SalesDetailModal.jsx
import { useEffect } from "react";
import { formatCurrency, formatDateTime } from "../../utils/helpers";

export const SalesDetailModal = ({ sale, shop, onClose }) => {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [sale, shop, onClose]);

  const handlePrint = () => {
    window.print();
  };

  // ✅ Handle both snake_case and camelCase + NaN values
  const getNumber = (val1, val2) => {
    const num = parseFloat(val1 ?? val2);
    return isNaN(num) ? 0 : num;
  };

  const subtotal = getNumber(sale.subtotal, sale.sub_total);
  const tax = getNumber(sale.taxAmount, sale.tax_amount);
  const total = getNumber(sale.totalAmount, sale.total_amount);
  const discount = getNumber(sale.discountAmount, sale.discount_amount);

  const getPaymentIcon = (method) => {
    const icons = {
      cash: "💵",
      card: "💳",
      upi: "📱",
      online: "🌐",
    };
    return icons[method?.toLowerCase()] || "💰";
  };

  // ✅ FIX: Stop event propagation on modal content
  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  // ✅ FIX: Handle overlay click
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      {/* Screen overlay - ✅ Fixed click handler */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={handleOverlayClick}
      >
        {/* A4 Invoice Container - ✅ Stop propagation */}
        <div
          className="bg-white w-full max-w-4xl max-h-[95vh] overflow-y-auto rounded-lg shadow-2xl print:max-w-none print:max-h-none print:rounded-none print:shadow-none"
          onClick={handleModalClick}
        >
          {/* Print Styles */}
          <style>{`
            @media print {
              @page {
                margin: 0;
                size: A4;
              }
              
              body * {
                visibility: hidden;
              }
              
              .invoice-print, .invoice-print * {
                visibility: visible;
              }
              
              .invoice-print {
                position: fixed;
                left: 0;
                top: 0;
                width: 210mm;
                min-height: 297mm;
                padding: 15mm;
                background: white;
              }
              
              .no-print {
                display: none !important;
              }
            }
          `}</style>

          {/* Invoice Content */}
          <div
            className="invoice-print bg-white p-8 md:p-12"
            style={{ width: "210mm", minHeight: "297mm" }}
          >
            {/* Header */}
            <div className="border-b-4 border-blue-600 pb-6 mb-6">
              <div className="flex justify-between items-start">
                {/* Company Info - ✅ Fixed with fallbacks */}
                <div className="flex-1">
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">
                    ⚡ ElectroShop
                  </h1>
                  <div className="text-gray-600 text-sm space-y-1">
                    <p>{shop?.name || "Main Electronics Store"}</p>
                    <p>{shop?.address || "123 Main Street, City, State"}</p>
                    <p>📞 {shop?.phone || "+91 1234567890"}</p>
                    {shop?.email && <p>✉️ {shop.email}</p>}
                  </div>
                </div>

                {/* Invoice Info */}
                <div className="text-right flex-shrink-0 ml-8">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    INVOICE
                  </div>
                  <table className="text-sm ml-auto">
                    <tbody>
                      <tr>
                        <td className="text-gray-600 pr-4">Invoice #:</td>
                        <td className="font-semibold">
                          {sale.invoiceNumber || sale.invoice_number}
                        </td>
                      </tr>
                      <tr>
                        <td className="text-gray-600 pr-4">Date:</td>
                        <td className="font-semibold">
                          {formatDateTime(sale.saleDate || sale.sale_date)}
                        </td>
                      </tr>
                      <tr>
                        <td className="text-gray-600 pr-4">Status:</td>
                        <td>
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold uppercase">
                            {sale.status || "COMPLETED"}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Customer & Payment Info */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              {/* Bill To */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase border-b border-gray-300 pb-1">
                  Bill To
                </h3>
                <div className="text-sm space-y-1">
                  <p className="font-semibold text-gray-900">
                    {sale.customerName ||
                      sale.customer_name ||
                      "Walk-in Customer"}
                  </p>
                  {(sale.customerPhone || sale.customer_phone) && (
                    <p className="text-gray-600">
                      📱 {sale.customerPhone || sale.customer_phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Payment Info */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase border-b border-gray-300 pb-1">
                  Payment Details
                </h3>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Method:</span>
                    <span className="font-semibold capitalize">
                      {getPaymentIcon(
                        sale.paymentMethod || sale.payment_method
                      )}{" "}
                      {(
                        sale.paymentMethod ||
                        sale.payment_method ||
                        "Cash"
                      ).toUpperCase()}
                    </span>
                  </div>
                  {(sale.paymentReference || sale.payment_reference) && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ref:</span>
                      <span className="font-mono text-xs">
                        {sale.paymentReference || sale.payment_reference}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-8">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 text-left py-3 px-4 text-sm font-semibold text-gray-700 w-12">
                      #
                    </th>
                    <th className="border border-gray-300 text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Item Description
                    </th>
                    <th className="border border-gray-300 text-center py-3 px-4 text-sm font-semibold text-gray-700 w-20">
                      Qty
                    </th>
                    <th className="border border-gray-300 text-right py-3 px-4 text-sm font-semibold text-gray-700 w-32">
                      Unit Price
                    </th>
                    <th className="border border-gray-300 text-right py-3 px-4 text-sm font-semibold text-gray-700 w-32">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(sale.items || []).map((item, index) => (
                    <tr key={index}>
                      <td className="border border-gray-300 py-3 px-4 text-sm text-gray-600">
                        {index + 1}
                      </td>
                      <td className="border border-gray-300 py-3 px-4">
                        <div className="font-medium text-gray-900">
                          {item.productName || item.product_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          SKU: {item.productSku || item.product_sku}
                        </div>
                      </td>
                      <td className="border border-gray-300 py-3 px-4 text-center text-sm text-gray-700">
                        {item.quantity}
                      </td>
                      <td className="border border-gray-300 py-3 px-4 text-right text-sm text-gray-700">
                        {formatCurrency(
                          getNumber(item.unitPrice, item.unit_price)
                        )}
                      </td>
                      <td className="border border-gray-300 py-3 px-4 text-right text-sm font-semibold text-gray-900">
                        {formatCurrency(
                          getNumber(item.totalPrice, item.total_price)
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Section */}
            <div className="flex justify-end mb-8">
              <div className="w-80 border border-gray-300 rounded-lg overflow-hidden">
                <table className="w-full">
                  <tbody>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 px-4 text-sm text-gray-600">
                        Subtotal:
                      </td>
                      <td className="py-2 px-4 text-sm font-semibold text-right text-gray-900">
                        {formatCurrency(subtotal)}
                      </td>
                    </tr>
                    {discount > 0 && (
                      <tr className="border-b border-gray-200">
                        <td className="py-2 px-4 text-sm text-gray-600">
                          Discount:
                        </td>
                        <td className="py-2 px-4 text-sm font-semibold text-right text-red-600">
                          - {formatCurrency(discount)}
                        </td>
                      </tr>
                    )}
                    <tr className="border-b border-gray-200">
                      <td className="py-2 px-4 text-sm text-gray-600">
                        Tax (GST 18%):
                      </td>
                      <td className="py-2 px-4 text-sm font-semibold text-right text-gray-900">
                        {formatCurrency(tax)}
                      </td>
                    </tr>
                    <tr className="bg-blue-50">
                      <td className="py-3 px-4 text-lg font-bold text-gray-900">
                        Total:
                      </td>
                      <td className="py-3 px-4 text-lg font-bold text-right text-blue-600">
                        {formatCurrency(total)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Notes */}
            {sale.notes && (
              <div className="mb-8 p-4 bg-gray-50 rounded border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Notes:
                </h3>
                <p className="text-sm text-gray-600">{sale.notes}</p>
              </div>
            )}

            {/* Footer */}
            <div className="border-t-2 border-gray-200 pt-6 mt-12 text-center space-y-2">
              <p className="text-lg font-semibold text-gray-900">
                Thank You For Your Business!
              </p>
              <p className="text-xs text-gray-500">
                This is a computer-generated invoice and does not require a
                signature.
              </p>
              <p className="text-xs text-gray-500">
                For queries, contact: {shop?.phone || "+91 1234567890"}
                {shop?.email && ` or ${shop.email}`}
              </p>
            </div>
          </div>

          {/* Action Buttons - ✅ Fixed close button */}
          <div className="no-print border-t p-4 bg-gray-50 flex justify-end gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 font-medium transition"
            >
              Close
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrint();
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
            >
              🖨️ Print Invoice
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
