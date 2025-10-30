// src/components/returns/CreateReturnModal.jsx - PRODUCTION READY

import { useState } from "react";

export const CreateReturnModal = ({ sale, onClose, onSubmit }) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [returnReason, setReturnReason] = useState("");
  const [notes, setNotes] = useState("");
  const [processing, setProcessing] = useState(false);
  const [validationError, setValidationError] = useState("");

  const items = sale.items || [];

  const handleItemSelect = (itemId) => {
    setValidationError("");
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter((id) => id !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  const handleReasonChange = (e) => {
    setReturnReason(e.target.value);
    setValidationError("");
  };

  const handleSubmit = async () => {
    // ✅ Validate selections
    if (selectedItems.length === 0) {
      setValidationError("❌ Please select at least one item to return");
      return;
    }

    // ✅ Validate reason
    if (!returnReason.trim()) {
      setValidationError("❌ Please provide a return reason");
      return;
    }

    if (returnReason.length < 10) {
      setValidationError(
        `❌ Return reason must be at least 10 characters (current: ${returnReason.length})`
      );
      return;
    }

    setProcessing(true);

    try {
      const selectedItemsData = items.filter((item) =>
        selectedItems.includes(item.id)
      );

      // ✅ Calculate total quantity and refund from selected items
      const totalQuantity = selectedItemsData.reduce(
        (sum, item) => sum + item.quantity,
        0
      );

      // ✅ Calculate total refund amount using total_price
      const totalRefundAmount = selectedItemsData.reduce((sum, item) => {
        const totalPrice = parseFloat(item.total_price || 0);
        return sum + totalPrice;
      }, 0);

      // ✅ Create payload matching backend schema exactly
      const returnData = {
        sale_id: sale.id,
        product_id: selectedItemsData[0]?.product_id || null,
        quantity: totalQuantity,
        reason: returnReason.trim(),
        notes: notes.trim() || null,
        items: selectedItemsData.map((item) => ({
          sale_item_id: item.id,
          product_id: item.product_id,
          quantity: item.quantity,
        })),
      };

      await onSubmit(returnData);
      setValidationError("");
    } catch (error) {
      console.error("❌ Error submitting return:", error);
      setValidationError("❌ Failed to create return. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  // ✅ Calculate selected items and amounts correctly
  const selectedItemsData = items.filter((item) =>
    selectedItems.includes(item.id)
  );

  const totalRefundAmount = selectedItemsData.reduce((sum, item) => {
    // ✅ Use total_price from SaleItem model
    const totalPrice = parseFloat(item.total_price || 0);
    return sum + totalPrice;
  }, 0);

  const totalQuantity = selectedItemsData.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const reasonLength = returnReason.length;
  const reasonValid = reasonLength >= 10;

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">Create Return</h2>
              <p className="text-blue-100 text-sm mt-1">
                Invoice #{sale.invoice_number || sale.invoiceNumber}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-blue-100 hover:text-white text-3xl font-light transition"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Validation Error */}
          {validationError && (
            <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4">
              <p className="text-red-700 font-semibold">{validationError}</p>
            </div>
          )}

          {/* Sale Info Card */}
          <div className="grid grid-cols-2 gap-4 bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 rounded-xl p-4">
            <div>
              <p className="text-xs font-bold text-slate-600 uppercase mb-2">
                Customer
              </p>
              <p className="text-lg font-bold text-slate-900">
                {sale.customer_name || sale.customerName || "Walk-in"}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-600 uppercase mb-2">
                Sale Date
              </p>
              <p className="text-lg font-bold text-slate-900">
                {new Date(sale.sale_date || sale.saleDate).toLocaleDateString(
                  "en-IN"
                )}
              </p>
            </div>
          </div>

          {/* Select Items */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">
              📦 Select Items to Return
            </h3>
            <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
              {items.length === 0 ? (
                <p className="text-slate-500 py-8 text-center">
                  No items in this invoice
                </p>
              ) : (
                items.map((item) => {
                  // ✅ Use total_price for display
                  const itemTotalPrice = parseFloat(item.total_price || 0);

                  return (
                    <label
                      key={item.id}
                      className="flex items-center p-4 border-2 border-slate-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition"
                    >
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => handleItemSelect(item.id)}
                        className="w-5 h-5 text-blue-600 rounded accent-blue-600 cursor-pointer"
                      />
                      <div className="ml-4 flex-1">
                        <p className="font-bold text-slate-900">
                          {item.product_name || item.productName}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          SKU: {item.product_sku || item.productSku} | Qty:{" "}
                          {item.quantity} × ₹
                          {parseFloat(item.unit_price || 0).toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-600">
                          ₹{itemTotalPrice.toFixed(2)}
                        </p>
                        <p className="text-xs text-slate-500">Total Price</p>
                      </div>
                    </label>
                  );
                })
              )}
            </div>
          </div>

          {/* Return Reason */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-bold text-slate-900 uppercase">
                ⚠️ Return Reason *
              </label>
              <span
                className={`text-xs font-bold ${
                  reasonValid ? "text-green-600" : "text-red-600"
                }`}
              >
                {reasonLength}/10 characters
              </span>
            </div>
            <select
              value={returnReason}
              onChange={handleReasonChange}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-slate-900 font-medium"
            >
              <option value="">— Select a reason —</option>
              <option value="🔧 Defective Product">
                🔧 Defective/Not Working
              </option>
              <option value="📦 Damaged Shipment">
                📦 Damaged in Shipment
              </option>
              <option value="❌ Wrong Item Sent">❌ Wrong Item Received</option>
              <option value="📸 Not as Described">📸 Not as Described</option>
              <option value="🤔 Changed Mind Now">🤔 Changed My Mind</option>
              <option value="⚠️ Quality is Poor">⚠️ Quality is Poor</option>
            </select>
            {returnReason && !reasonValid && (
              <p className="text-red-600 text-sm mt-2 font-semibold">
                ⚠️ Need {10 - reasonLength} more character(s)
              </p>
            )}
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-3 uppercase">
              💬 Additional Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional information..."
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none resize-none text-slate-900 placeholder-slate-400"
              rows="3"
              maxLength="1000"
            />
          </div>

          {/* Return Summary */}
          {selectedItems.length > 0 && (
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl p-5">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-700 font-semibold">
                    Items Selected:
                  </span>
                  <span className="font-bold text-blue-600 text-lg">
                    {selectedItems.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-700 font-semibold">
                    Total Quantity:
                  </span>
                  <span className="font-bold text-blue-600">
                    {totalQuantity}
                  </span>
                </div>
                <div className="border-t-2 border-blue-200 pt-3 flex justify-between text-lg">
                  <span className="font-bold text-slate-900">
                    Total Refund Amount:
                  </span>
                  <span className="font-bold text-blue-600">
                    ₹{totalRefundAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="bg-slate-50 border-t-2 border-slate-200 p-6 flex gap-4 justify-end">
          <button
            onClick={onClose}
            disabled={processing}
            className="px-6 py-3 text-slate-700 font-bold rounded-lg border-2 border-slate-300 hover:border-slate-400 hover:bg-slate-100 transition disabled:opacity-50 text-sm uppercase tracking-wide"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={processing || selectedItems.length === 0 || !reasonValid}
            className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm uppercase tracking-wide shadow-lg hover:shadow-xl"
          >
            {processing ? (
              <>
                <span className="animate-spin">⏳</span> Creating...
              </>
            ) : (
              <>
                <span>✅</span> Create Return
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
