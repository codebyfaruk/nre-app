// src/components/pos/PaymentModal.jsx - COMPLETE FIXED

import { useState, useEffect } from "react";
import { formatCurrency } from "../../utils/helpers";

export const PaymentModal = ({ summary, onClose, onComplete }) => {
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [amountReceived, setAmountReceived] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");

  // ✅ FIX: Round to 2 decimals to avoid floating point issues
  const roundTo2 = (num) => Math.round(num * 100) / 100;

  const receivedAmount = roundTo2(parseFloat(amountReceived) || 0);
  const totalAmount = roundTo2(parseFloat(summary.total) || 0);

  const change =
    paymentMethod === "cash" && receivedAmount > 0
      ? roundTo2(receivedAmount - totalAmount)
      : 0;

  // ✅ FIX: Simple >= comparison (already rounded)
  const canComplete =
    paymentMethod === "cash" ? receivedAmount >= totalAmount : true;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleComplete = () => {
    if (!canComplete) {
      alert(
        `Insufficient amount! Need ${formatCurrency(
          totalAmount
        )}, received ${formatCurrency(receivedAmount)}`
      );
      return;
    }

    onComplete({
      paymentMethod,
      amountReceived: paymentMethod === "cash" ? receivedAmount : totalAmount,
      change: roundTo2(change),
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      notes: notes.trim(),
    });
  };

  // ✅ FIX: Round quick amounts properly
  const quickAmounts = [
    totalAmount, // Exact amount
    Math.ceil(totalAmount / 100) * 100, // Next ₹100
    Math.ceil(totalAmount / 500) * 500, // Next ₹500
    Math.ceil(totalAmount / 1000) * 1000, // Next ₹1000
  ]
    .map((val) => roundTo2(val))
    .filter((val, idx, arr) => arr.indexOf(val) === idx && val >= totalAmount) // Remove duplicates & ensure >= total
    .slice(0, 4); // Max 4 buttons

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
          <h2 className="text-xl font-semibold">Complete Payment</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold leading-none"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Order Summary */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 space-y-2 border border-blue-200">
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">Subtotal:</span>
              <span className="font-medium text-gray-900">
                {formatCurrency(summary.subtotal)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">Tax ({summary.taxRate}%):</span>
              <span className="font-medium text-gray-900">
                {formatCurrency(summary.tax)}
              </span>
            </div>
            <div className="border-t border-blue-300 pt-2 flex justify-between">
              <span className="font-semibold text-lg text-gray-900">
                Total:
              </span>
              <span className="font-bold text-2xl text-blue-600">
                {formatCurrency(totalAmount)}
              </span>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { method: "cash", emoji: "💵", label: "Cash" },
                { method: "card", emoji: "💳", label: "Card" },
                { method: "upi", emoji: "📱", label: "UPI" },
              ].map(({ method, emoji, label }) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => {
                    setPaymentMethod(method);
                    if (method !== "cash") {
                      setAmountReceived(totalAmount.toFixed(2));
                    } else {
                      setAmountReceived("");
                    }
                  }}
                  className={`px-4 py-3 border-2 rounded-lg font-medium capitalize transition-all ${
                    paymentMethod === method
                      ? "bg-blue-600 text-white border-blue-600 shadow-lg scale-105"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-blue-300"
                  }`}
                >
                  <div className="text-2xl mb-1">{emoji}</div>
                  <div className="text-sm">{label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Amount Received (Cash Only) */}
          {paymentMethod === "cash" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount Received <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={amountReceived}
                onChange={(e) => setAmountReceived(e.target.value)}
                placeholder="Enter amount received"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xl font-bold text-gray-900"
                autoFocus
              />

              {/* Quick Amount Buttons */}
              <div className="mt-3 flex flex-wrap gap-2">
                {quickAmounts.map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setAmountReceived(amount.toFixed(2))}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      amount === totalAmount
                        ? "bg-green-500 text-white hover:bg-green-600 shadow-md"
                        : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                    }`}
                  >
                    {amount === totalAmount ? "✓ Exact" : ""}{" "}
                    {formatCurrency(amount)}
                  </button>
                ))}
              </div>

              {/* Change Display */}
              {receivedAmount > 0 && (
                <div
                  className={`mt-4 p-4 rounded-lg border-2 ${
                    change >= 0
                      ? "bg-green-50 border-green-300"
                      : "bg-red-50 border-red-300"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span
                      className={`font-semibold ${
                        change >= 0 ? "text-green-700" : "text-red-700"
                      }`}
                    >
                      {change >= 0
                        ? "💰 Change to return:"
                        : "⚠️ Amount short:"}
                    </span>
                    <span
                      className={`text-2xl font-bold ${
                        change >= 0 ? "text-green-700" : "text-red-700"
                      }`}
                    >
                      {formatCurrency(Math.abs(change))}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Customer Details (Optional) */}
          <div className="border-t pt-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Customer Details (Optional)
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Customer Name
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter customer name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Customer Phone
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Enter phone number"
                maxLength="10"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes..."
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Footer - FIXED: Make sure button is always visible */}
        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleComplete}
            disabled={!canComplete}
            className={`px-8 py-3 rounded-lg font-bold text-lg transition-all ${
              canComplete
                ? "bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {canComplete ? "✓ Complete Sale" : "⚠️ Insufficient Amount"}
          </button>
        </div>
      </div>
    </div>
  );
};
