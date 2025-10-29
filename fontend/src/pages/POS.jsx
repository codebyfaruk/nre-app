// src/pages/POS.jsx - COMPLETE POS SYSTEM
import { useState, useEffect } from "react";
import { Layout } from "../components/layout/Layout";
import { POSHeader } from "../components/pos/POSHeader";
import { ProductSearch } from "../components/pos/ProductSearch";
import { ShoppingCart } from "../components/pos/ShoppingCart";
import { PaymentModal } from "../components/pos/PaymentModal";
import { InvoicePreview } from "../components/pos/InvoicePreview";
import { apiService } from "../services/api.service";
import { showSuccess, showError } from "../utils/toast";

export const POS = () => {
  const [shops, setShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState("");
  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState(null);
  const [checkoutSummary, setCheckoutSummary] = useState(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedShop) {
      loadInventory(selectedShop);
    }
  }, [selectedShop]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [shopsRes, productsRes] = await Promise.all([
        apiService.getShops(),
        apiService.getProducts(),
      ]);

      setShops(shopsRes.data);
      setProducts(productsRes.data);

      if (shopsRes.data.length > 0) {
        setSelectedShop(shopsRes.data[0].id.toString());
      }
    } catch (error) {
      console.error("Error loading data:", error);
      showError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const loadInventory = async (shopId) => {
    try {
      const inventoryRes = await apiService.getInventory(shopId);
      setInventory(inventoryRes.data);
    } catch (error) {
      console.error("Error loading inventory:", error);
      showError("Failed to load inventory");
    }
  };

  const handleAddToCart = (product, stock) => {
    const existingItem = cartItems.find(
      (item) => item.product.id === product.id
    );
    const maxStock = stock.quantity - (stock.reserved_quantity || 0);

    if (existingItem) {
      if (existingItem.quantity >= maxStock) {
        showError("Cannot add more. Stock limit reached!");
        return;
      }
      handleUpdateQuantity(product.id, existingItem.quantity + 1);
    } else {
      const newItem = {
        product,
        quantity: 1,
        unitPrice: product.discountPrice || product.price,
        totalPrice: product.discountPrice || product.price,
        maxStock,
      };
      setCartItems([...cartItems, newItem]);
      showSuccess(`${product.name} added to cart`);
    }
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    setCartItems(
      cartItems.map((item) => {
        if (item.product.id === productId) {
          const qty = Math.max(1, Math.min(newQuantity, item.maxStock));
          return {
            ...item,
            quantity: qty,
            totalPrice: item.unitPrice * qty,
          };
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (productId) => {
    setCartItems(cartItems.filter((item) => item.product.id !== productId));
    showSuccess("Item removed from cart");
  };

  const handleCheckout = (summary) => {
    setCheckoutSummary(summary);
    setShowPaymentModal(true);
  };

  const handleCompleteSale = async (paymentDetails) => {
    try {
      // ✅ FIX: Use snake_case and proper number formatting
      const saleData = {
        shop_id: parseInt(selectedShop), // ✅ snake_case
        customer_id: null, // ✅ Required field
        payment_method: paymentDetails.paymentMethod, // ✅ snake_case
        payment_reference:
          paymentDetails.paymentMethod !== "cash" ? `REF-${Date.now()}` : null,
        notes: paymentDetails.notes || null,
        items: cartItems.map((item) => ({
          product_id: item.product.id, // ✅ snake_case
          quantity: item.quantity,
          unit_price: parseFloat(item.unitPrice), // ✅ snake_case + number
          discount: 0,
        })),
      };

      console.log("💰 Sending sale data:", JSON.stringify(saleData, null, 2));

      const response = await apiService.createSale(saleData);

      // Create invoice object
      const invoice = {
        ...response.data,
        shop: shops.find((s) => s.id === parseInt(selectedShop)),
        change: paymentDetails.change,
        customerName: paymentDetails.customerName,
        customerPhone: paymentDetails.customerPhone,
        notes: paymentDetails.notes,
      };

      setCurrentInvoice(invoice);
      setShowPaymentModal(false);
      setShowInvoice(true);

      // Clear cart
      setCartItems([]);
      showSuccess("✅ Sale completed successfully!");

      // Reload inventory
      await loadInventory(selectedShop);
    } catch (error) {
      console.error("❌ Error completing sale:", error);
      console.error("❌ Error response:", error.response?.data);

      // Show detailed error message
      const errorMsg = error.response?.data?.detail
        ? Array.isArray(error.response.data.detail)
          ? error.response.data.detail.map((e) => e.msg).join(", ")
          : error.response.data.detail
        : "Failed to complete sale";

      showError(errorMsg);
    }
  };

  const handleNewSale = () => {
    if (cartItems.length > 0) {
      if (window.confirm("Current cart will be cleared. Continue?")) {
        setCartItems([]);
        setShowInvoice(false);
        setCurrentInvoice(null);
      }
    }
  };

  if (loading) {
    return (
      <Layout title="Point of Sale">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading POS...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Point of Sale">
      <POSHeader
        selectedShop={selectedShop}
        shops={shops}
        onShopChange={setSelectedShop}
        onNewSale={handleNewSale}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Product Search & Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Search */}
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Search Products
            </h3>
            <ProductSearch
              products={products}
              inventory={inventory}
              onAddToCart={handleAddToCart}
            />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl shadow-md p-4">
              <div className="text-sm text-gray-600 mb-1">
                Available Products
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {inventory.length}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4">
              <div className="text-sm text-gray-600 mb-1">Items in Cart</div>
              <div className="text-2xl font-bold text-gray-900">
                {cartItems.length}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Shopping Cart */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-6">
            <ShoppingCart
              cartItems={cartItems}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onCheckout={handleCheckout}
            />
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          summary={checkoutSummary}
          onClose={() => setShowPaymentModal(false)}
          onComplete={handleCompleteSale}
        />
      )}

      {/* Invoice Preview */}
      {showInvoice && currentInvoice && (
        <InvoicePreview
          invoice={currentInvoice}
          onClose={() => setShowInvoice(false)}
          onPrint={() => window.print()}
        />
      )}
    </Layout>
  );
};
