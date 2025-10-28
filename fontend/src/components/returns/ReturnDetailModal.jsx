// src/components/returns/ReturnDetailModal.jsx
import { useState, useEffect } from "react";
import { formatCurrency, formatDateTime } from "../../utils/helpers";

export const ReturnDetailModal = ({
  returnData,
  shop,
  onClose,
  onApprove,
  onReject,
}) => {
  const [actionNotes, setActionNotes] = useState("");
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const getStatusBadge = (status) => {
    const badges = {
      pending: {
        className: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: "⏳",
        text: "PENDING",
      },
      approved: {
        className: "bg-green-100 text-green-800 border-green-200",
        icon: "✅",
        text: "APPROVED",
      },
      rejected: {
        className: "bg-red-100 text-red-800 border-red-200",
        icon: "❌",
        text: "REJECTED",
      },
    };
    return badges[status];
  };

  const handleApprove = () => {
    onApprove(returnData.id, actionNotes);
    setShowApproveConfirm(false);
  };

  const handleReject = () => {
    onReject(returnData.id, actionNotes);
    setShowRejectConfirm(false);
  };

  const badge = getStatusBadge(returnData.status);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-100">
      {/* Header Actions - No Print */}
      <div className="sticky top-0 bg-white shadow-md z-10 print:hidden">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Return Details</h3>
          <div className="flex gap-3">
            {returnData.status === "pending" && (
              <>
                <button
                  onClick={() => setShowApproveConfirm(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium flex items-center space-x-2"
                >
                  <span>✅</span>
                  <span>Approve</span>
                </button>
                <button
                  onClick={() => setShowRejectConfirm(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium flex items-center space-x-2"
                >
                  <span>❌</span>
                  <span>Reject</span>
                </button>
              </>
            )}
            <button onClick={onClose} className="btn-secondary">
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Return Content */}
      <div className="max-w-4xl mx-auto p-4 sm:p-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-8 pb-6 border-b-2 border-gray-900">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                ↩️ Product Return
              </h1>
              <p className="text-sm text-gray-600">{shop?.name}</p>
              <p className="text-sm text-gray-600">{shop?.address}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                RETURN REQUEST
              </div>
              <p className="text-sm text-gray-600">
                #{returnData.returnNumber}
              </p>
              <p className="text-sm text-gray-600">
                {formatDateTime(returnData.returnDate)}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="mb-6">
            <span
              className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-bold border-2 ${badge.className}`}
            >
              {badge.icon} STATUS: {badge.text}
            </span>
          </div>

          {/* Customer & Original Sale Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Customer Details */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">
                Customer Details:
              </h3>
              {returnData.customerName ? (
                <div>
                  <p className="text-sm text-gray-900 font-medium">
                    {returnData.customerName}
                  </p>
                  {returnData.customerPhone && (
                    <p className="text-sm text-gray-600">
                      {returnData.customerPhone}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">Walk-in Customer</p>
              )}
            </div>

            {/* Original Sale Details */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">
                Original Sale:
              </h3>
              <div className="space-y-1">
                <div className="flex items-center text-sm">
                  <span className="text-gray-600 w-32">Invoice:</span>
                  <span className="font-medium text-gray-900">
                    {returnData.invoiceNumber}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="text-gray-600 w-32">Sale Amount:</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(returnData.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Return Reason */}
          <div className="mb-8 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
            <h4 className="font-semibold text-gray-900 mb-2 text-sm uppercase tracking-wide">
              Return Reason:
            </h4>
            <p className="text-sm text-gray-700">{returnData.reason}</p>
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <h3 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wide">
              Returned Items:
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-900">
                    <th className="text-left py-3 text-sm font-semibold text-gray-900">
                      Product
                    </th>
                    <th className="text-center py-3 text-sm font-semibold text-gray-900">
                      Qty
                    </th>
                    <th className="text-right py-3 text-sm font-semibold text-gray-900">
                      Unit Price
                    </th>
                    <th className="text-right py-3 text-sm font-semibold text-gray-900">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {returnData.items.map((item, index) => (
                    <tr key={index} className="border-b border-gray-200">
                      <td className="py-3">
                        <div>
                          <div className="font-medium text-gray-900 text-sm">
                            {item.productName}
                          </div>
                          <div className="text-xs text-gray-600">
                            SKU: {item.productSku}
                          </div>
                          {item.returnReason && (
                            <div className="text-xs text-gray-500 italic mt-1">
                              Reason: {item.returnReason}
                            </div>
                          )}
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

          {/* Refund Summary */}
          <div className="flex justify-end mb-8">
            <div className="w-full md:w-80">
              <div className="space-y-2">
                <div className="flex justify-between py-2 text-sm text-gray-600">
                  <span>Original Amount:</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(returnData.totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between py-3 border-t-2 border-gray-900 text-lg font-bold text-gray-900">
                  <span>Refund Amount:</span>
                  <span
                    className={
                      returnData.refundAmount > 0
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {formatCurrency(returnData.refundAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Processing Information */}
          {returnData.processedBy && (
            <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">
                Processing Details:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Processed By:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {returnData.processedBy}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Processed Date:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {formatDateTime(returnData.processedDate)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {returnData.notes && (
            <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-2 text-sm uppercase tracking-wide">
                Notes:
              </h4>
              <p className="text-sm text-gray-600">{returnData.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="pt-6 border-t border-gray-300 text-center">
            <p className="text-xs text-gray-500">
              For queries regarding this return, contact us at {shop?.phone}
            </p>
          </div>
        </div>
      </div>

      {/* Approve Confirmation Modal */}
      {showApproveConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              ✅ Approve Return
            </h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to approve this return? A refund of{" "}
              <strong>{formatCurrency(returnData.refundAmount)}</strong> will be
              processed.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                rows="3"
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-gray-900 outline-none transition resize-none"
                placeholder="Add any notes about this approval..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowApproveConfirm(false)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
              >
                Confirm Approval
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Confirmation Modal */}
      {showRejectConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              ❌ Reject Return
            </h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to reject this return? No refund will be
              processed.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Rejection Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                rows="3"
                required
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-gray-900 outline-none transition resize-none"
                placeholder="Please provide a reason for rejection..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectConfirm(false)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!actionNotes.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
