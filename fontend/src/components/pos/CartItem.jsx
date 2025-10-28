// src/components/pos/CartItem.jsx
import { formatCurrency } from "../../utils/helpers";

export const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  return (
    <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
      <div className="flex items-start justify-between gap-3">
        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
            {item.product.name}
          </h4>
          <p className="text-xs sm:text-sm text-gray-600">
            {item.product.brand} • {item.product.sku}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {formatCurrency(item.unitPrice)} × {item.quantity}
          </p>
        </div>

        {/* Remove Button */}
        <button
          onClick={() => onRemove(item.product.id)}
          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
          title="Remove"
        >
          <svg
            className="w-5 h-5"
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

      {/* Quantity Controls & Price */}
      <div className="flex items-center justify-between mt-3">
        {/* Quantity Controls */}
        <div className="flex items-center space-x-2 bg-white rounded-lg border-2 border-gray-200">
          <button
            onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
            disabled={item.quantity <= 1}
            className="px-3 py-1 text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            −
          </button>
          <span className="px-3 py-1 font-semibold text-gray-900 min-w-[2rem] text-center">
            {item.quantity}
          </span>
          <button
            onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
            disabled={item.quantity >= item.maxStock}
            className="px-3 py-1 text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            +
          </button>
        </div>

        {/* Item Total */}
        <div className="font-bold text-gray-900 text-lg">
          {formatCurrency(item.totalPrice)}
        </div>
      </div>

      {/* Stock Warning */}
      {item.quantity >= item.maxStock && (
        <p className="text-xs text-red-600 mt-2">
          ⚠️ Maximum available stock reached
        </p>
      )}
    </div>
  );
};
