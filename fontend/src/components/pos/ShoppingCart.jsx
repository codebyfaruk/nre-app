// src/components/pos/ShoppingCart.jsx
import { CartItem } from "./CartItem";
import { formatCurrency } from "../../utils/helpers";

export const ShoppingCart = ({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}) => {
  const subtotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const taxRate = 0.18; // 18% GST
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;

  return (
    <div className="bg-white rounded-xl shadow-lg h-full flex flex-col">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center justify-between">
          <span>🛒 Cart ({cartItems.length})</span>
          {cartItems.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm("Clear cart?")) {
                  cartItems.forEach((item) => onRemoveItem(item.product.id));
                }
              }}
              className="text-sm text-red-600 hover:text-red-700 font-normal"
            >
              Clear All
            </button>
          )}
        </h3>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <span className="text-6xl mb-4">🛒</span>
            <p className="text-lg font-semibold">Cart is empty</p>
            <p className="text-sm">Search and add products to cart</p>
          </div>
        ) : (
          cartItems.map((item) => (
            <CartItem
              key={item.product.id}
              item={item}
              onUpdateQuantity={onUpdateQuantity}
              onRemove={onRemoveItem}
            />
          ))
        )}
      </div>

      {/* Summary & Checkout */}
      {cartItems.length > 0 && (
        <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50">
          {/* Summary */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal:</span>
              <span className="font-semibold">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Tax (18% GST):</span>
              <span className="font-semibold">{formatCurrency(taxAmount)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-300">
              <span>Total:</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Checkout Button */}
          <button
            onClick={() => onCheckout({ subtotal, taxAmount, total })}
            className="btn-primary w-full text-lg py-3"
          >
            💳 Checkout
          </button>
        </div>
      )}
    </div>
  );
};
