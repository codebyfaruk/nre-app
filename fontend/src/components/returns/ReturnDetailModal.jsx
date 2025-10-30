// src/components/returns/ReturnDetailModal.jsx - COMPLETE VIEW & PROCESS

import { useState } from "react";
import { formatDateTime } from "../../utils/helpers";

export const ReturnDetailModal = ({
  returnData,
  shop,
  onClose,
  onApprove,
  onReject,
}) => {
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [approveNotes, setApproveNotes] = useState("");
  const [rejectNotes, setRejectNotes] = useState("");
  const [processing, setProcessing] = useState(false);

  const getStatusBadge = (status) => {
    const badges = {
      pending: {
        className: "bg-yellow-100 text-yellow-800 border-yellow-300",
        icon: "⏳",
        text: "PENDING",
      },
      approved: {
        className: "bg-green-100 text-green-800 border-green-300",
        icon: "✅",
        text: "APPROVED",
      },
      rejected: {
        className: "bg-red-100 text-red-800 border-red-300",
        icon: "❌",
        text: "REJECTED",
      },
      completed: {
        className: "bg-blue-100 text-blue-800 border-blue-300",
        icon: "🏁",
        text: "COMPLETED",
      },
    };
    return badges[returnData.status] || badges.pending;
  };

  const handleApproveSubmit = async () => {
    setProcessing(true);
    try {
      await onApprove(returnData.id, approveNotes || null);
      setShowApproveConfirm(false);
      setApproveNotes("");
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectNotes.trim()) {
      alert("Please provide a rejection reason");
      return;
    }
    setProcessing(true);
    try {
      await onReject(returnData.id, rejectNotes);
      setShowRejectConfirm(false);
      setRejectNotes("");
    } finally {
      setProcessing(false);
    }
  };

  const badge = getStatusBadge(returnData.status);
  const isPending = returnData.status === "pending";

  return (
    <>
      {/* Main Detail Modal */}
      <div
        className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold">Return Details</h2>
                <p className="text-slate-300 text-sm mt-1">
                  Return #{returnData.return_number}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-slate-300 hover:text-white text-3xl font-light transition"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Status Badge */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 border-2 border-slate-200">
              <div>
                <p className="text-sm text-slate-600 font-semibold uppercase mb-1">
                  Current Status
                </p>
                <p className="text-lg font-bold text-slate-900">
                  {returnData.status.toUpperCase()}
                </p>
              </div>
              <span
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border-2 ${badge.className}`}
              >
                <span className="text-lg">{badge.icon}</span>
                <span>{badge.text}</span>
              </span>
            </div>

            {/* Return Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <p className="text-xs text-slate-600 uppercase font-bold mb-1">
                  Return Date
                </p>
                <p className="text-sm font-semibold text-slate-900">
                  {formatDateTime(returnData.return_date)}
                </p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <p className="text-xs text-slate-600 uppercase font-bold mb-1">
                  Invoice Number
                </p>
                <p className="text-sm font-semibold text-slate-900">
                  #{returnData.invoice_number || "N/A"}
                </p>
              </div>
            </div>

            {/* Product Information */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase">
                📦 Product Information
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-700">Product ID:</span>
                  <span className="font-semibold text-slate-900">
                    {returnData.product_id}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-700">Quantity:</span>
                  <span className="font-semibold text-slate-900">
                    {returnData.quantity}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-blue-300">
                  <span className="font-semibold text-slate-900">
                    Refund Amount:
                  </span>
                  <span className="font-bold text-blue-600">
                    ₹{parseFloat(returnData.refund_amount || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Return Reason */}
            <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4">
              <h3 className="text-sm font-bold text-slate-900 mb-2 uppercase">
                ⚠️ Return Reason
              </h3>
              <p className="text-slate-700 text-sm leading-relaxed">
                {returnData.reason}
              </p>
            </div>

            {/* Additional Notes */}
            {returnData.notes && (
              <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
                <h3 className="text-sm font-bold text-slate-900 mb-2 uppercase">
                  📝 Notes
                </h3>
                <p className="text-slate-700 text-sm leading-relaxed">
                  {returnData.notes}
                </p>
              </div>
            )}

            {/* Action Notes (if processed) */}
            {returnData.action_notes && (
              <div className="bg-gray-50 border-2 border-gray-300 rounded-xl p-4">
                <h3 className="text-sm font-bold text-slate-900 mb-2 uppercase">
                  📋 Processing Notes
                </h3>
                <p className="text-slate-700 text-sm leading-relaxed">
                  {returnData.action_notes}
                </p>
              </div>
            )}

            {/* Processed By Info */}
            {returnData.processed_by && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <p className="text-xs text-slate-600 uppercase font-bold mb-2">
                  Processed By
                </p>
                <p className="text-sm font-semibold text-slate-900">
                  User ID: {returnData.processed_by}
                </p>
                {returnData.processed_at && (
                  <p className="text-xs text-slate-500 mt-1">
                    {formatDateTime(returnData.processed_at)}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="border-t-2 border-slate-200 bg-slate-50 p-6 flex gap-3 justify-end sticky bottom-0">
            <button
              onClick={onClose}
              className="px-6 py-3 text-slate-700 font-bold rounded-lg border-2 border-slate-300 hover:bg-slate-100 transition text-sm uppercase tracking-wide"
            >
              Close
            </button>

            {isPending && (
              <>
                <button
                  onClick={() => setShowRejectConfirm(true)}
                  className="px-6 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition text-sm uppercase tracking-wide shadow-md"
                >
                  ❌ Reject
                </button>
                <button
                  onClick={() => setShowApproveConfirm(true)}
                  className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition text-sm uppercase tracking-wide shadow-md"
                >
                  ✅ Approve
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Approve Confirmation Modal */}
      {showApproveConfirm && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={() => setShowApproveConfirm(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="text-6xl mb-4 text-center">✅</div>
              <h3 className="text-2xl font-bold text-slate-900 text-center mb-2">
                Approve Return?
              </h3>
              <p className="text-slate-600 text-center mb-6">
                Return{" "}
                <span className="font-bold">#{returnData.return_number}</span>{" "}
                will be approved and refund of{" "}
                <span className="font-bold">
                  ₹{parseFloat(returnData.refund_amount || 0).toFixed(2)}
                </span>{" "}
                will be processed. Inventory will be restored.
              </p>

              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Optional Processing Notes
                </label>
                <textarea
                  value={approveNotes}
                  onChange={(e) => setApproveNotes(e.target.value)}
                  placeholder="Add any approval notes..."
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none resize-none text-slate-900"
                  rows="3"
                  maxLength="500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowApproveConfirm(false)}
                  disabled={processing}
                  className="flex-1 px-4 py-3 text-slate-700 font-bold rounded-lg border-2 border-slate-300 hover:bg-slate-50 transition disabled:opacity-50 text-sm uppercase"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApproveSubmit}
                  disabled={processing}
                  className="flex-1 px-4 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm uppercase shadow-lg"
                >
                  {processing ? (
                    <>
                      <span className="animate-spin">⏳</span> Processing...
                    </>
                  ) : (
                    "✅ Approve"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Confirmation Modal */}
      {showRejectConfirm && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={() => setShowRejectConfirm(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="text-6xl mb-4 text-center">❌</div>
              <h3 className="text-2xl font-bold text-slate-900 text-center mb-2">
                Reject Return?
              </h3>
              <p className="text-slate-600 text-center mb-6">
                Return{" "}
                <span className="font-bold">#{returnData.return_number}</span>{" "}
                will be rejected. The customer will be notified.
              </p>

              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Rejection Reason *{" "}
                  <span className="text-red-600">Required</span>
                </label>
                <textarea
                  value={rejectNotes}
                  onChange={(e) => setRejectNotes(e.target.value)}
                  placeholder="Why are you rejecting this return? Be specific..."
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none resize-none text-slate-900"
                  rows="3"
                  maxLength="500"
                />
                <p className="text-xs text-slate-500 mt-1">
                  {rejectNotes.length}/500 characters
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowRejectConfirm(false)}
                  disabled={processing}
                  className="flex-1 px-4 py-3 text-slate-700 font-bold rounded-lg border-2 border-slate-300 hover:bg-slate-50 transition disabled:opacity-50 text-sm uppercase"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectSubmit}
                  disabled={processing || !rejectNotes.trim()}
                  className="flex-1 px-4 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm uppercase shadow-lg"
                >
                  {processing ? (
                    <>
                      <span className="animate-spin">⏳</span> Processing...
                    </>
                  ) : (
                    "❌ Reject"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
