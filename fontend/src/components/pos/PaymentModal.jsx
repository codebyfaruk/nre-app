// src/components/pos/PaymentModal.jsx
import { useState, useEffect } from "react";
import { formatCurrency } from "../../utils/helpers";

export const PaymentModal = ({ summary, onClose, onComplete }) => {
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [amountReceived, setAmountReceived] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");

  const change =
    paymentMethod === "cash" && amountReceived
      ? parseFloat(amountReceived) - summary.total
      : 0;

  const canComplete =
    paymentMethod === "cash"
      ? parseFloat(amountReceived) >= summary.total
      : true;

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleComplete = () => {
    if (!canComplete) {
      alert("Amount received is less than total!");
      return;
    }

    onComplete({
      paymentMethod,
      amountReceived:
        paymentMethod === "cash" ? parseFloat(amountReceived) : summary.total,
      change,
      customerName,
      customerPhone,
      notes,
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative bg-white rounded-xl shadow-2xl w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                💳 Payment Details
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition p-1"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            {/* Order Summary */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">
                Order Summary
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold">
                    {formatCurrency(summary.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (18%):</span>
                  <span className="font-semibold">
                    {formatCurrency(summary.taxAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-300">
                  <span>Total:</span>
                  <span>{formatCurrency(summary.total)}</span>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Payment Method <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "cash", label: "💵 Cash", icon: "💵" },
                  { value: "card", label: "💳 Card", icon: "💳" },
                  { value: "upi", label: "📱 UPI", icon: "📱" },
                  { value: "online", label: "🌐 Online", icon: "🌐" },
                ].map((method) => (
                  <button
                    key={method.value}
                    type="button"
                    onClick={() => setPaymentMethod(method.value)}
                    className={`p-3 rounded-lg border-2 transition text-sm font-medium ${
                      paymentMethod === method.value
                        ? "border-gray-900 bg-gray-100 text-gray-900"
                        : "border-gray-200 text-gray-600 hover:border-gray-400"
                    }`}
                  >
                    {method.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Cash Payment Fields */}
            {paymentMethod === "cash" && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Amount Received <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={amountReceived}
                    onChange={(e) => setAmountReceived(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-gray-900 outline-none transition"
                    placeholder={summary.total.toString()}
                    step="0.01"
                  />
                </div>

                {/* Change Display */}
                {amountReceived && (
                  <div
                    className={`mb-4 p-4 rounded-lg ${
                      change >= 0
                        ? "bg-green-50 border border-green-200"
                        : "bg-red-50 border border-red-200"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span
                        className={`font-semibold ${
                          change >= 0 ? "text-green-700" : "text-red-700"
                        }`}
                      >
                        {change >= 0
                          ? "Change to Return:"
                          : "Insufficient Amount:"}
                      </span>
                      <span
                        className={`text-xl font-bold ${
                          change >= 0 ? "text-green-700" : "text-red-700"
                        }`}
                      >
                        {formatCurrency(Math.abs(change))}
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Customer Details (Optional) */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Customer Name (Optional)
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-gray-900 outline-none transition"
                placeholder="Enter customer name"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Customer Phone (Optional)
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-gray-900 outline-none transition"
                placeholder="Enter phone number"
              />
            </div>

            {/* Notes */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows="2"
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-gray-900 outline-none transition resize-none"
                placeholder="Any additional notes..."
              />
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-col-reverse sm:flex-row gap-3">
              <button
                onClick={onClose}
                className="btn-secondary w-full sm:w-auto"
              >
                Cancel
              </button>
              <button
                onClick={handleComplete}
                disabled={!canComplete}
                className="btn-primary w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ✅ Complete Sale
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
