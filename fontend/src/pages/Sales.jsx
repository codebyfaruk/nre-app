// src/pages/Sales.jsx - FIXED COMPLETE VERSION
import { useState, useEffect } from "react";
import { Layout } from "../components/layout/Layout";
import {
  SalesHeader,
  SalesFilters,
  SalesTable,
  SalesDetailModal,
} from "../components/sales";
import { apiService } from "../services/api.service";
import { showError } from "../utils/toast";

export const Sales = () => {
  const [sales, setSales] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedShop, setSelectedShop] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [selectedSale, setSelectedSale] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [salesRes, shopsRes] = await Promise.all([
        apiService.getSales(),
        apiService.getShops(),
      ]);
      setSales(salesRes.data);
      setShops(shopsRes.data);
    } catch (error) {
      console.error("Error loading data:", error);
      showError("Failed to load sales data");
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED: Filter with snake_case field names
  const filteredSales = sales.filter((sale) => {
    // Search filter - Use optional chaining to prevent errors
    const matchesSearch =
      sale.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.customer_phone?.includes(searchTerm);

    // ✅ FIXED: Use sale_date (snake_case)
    const saleDate = new Date(sale.sale_date).toISOString().split("T")[0];
    const matchesDateFrom = !dateFrom || saleDate >= dateFrom;
    const matchesDateTo = !dateTo || saleDate <= dateTo;

    // ✅ FIXED: Use shop_id (snake_case)
    const matchesShop =
      !selectedShop || sale.shop_id === parseInt(selectedShop);

    // ✅ FIXED: Use payment_method (snake_case)
    const matchesPayment =
      !paymentMethod || sale.payment_method === paymentMethod;

    return (
      matchesSearch &&
      matchesDateFrom &&
      matchesDateTo &&
      matchesShop &&
      matchesPayment
    );
  });

  // ✅ FIXED: Calculate today's data with snake_case
  const today = new Date().toISOString().split("T")[0];
  const todaySalesData = sales.filter(
    (sale) => new Date(sale.sale_date).toISOString().split("T")[0] === today
  );

  // ✅ FIXED: Use total_amount (snake_case)
  const todayRevenue = todaySalesData.reduce(
    (sum, sale) => sum + (sale.total_amount || 0),
    0
  );

  const handleViewDetails = (sale) => {
    setSelectedSale(sale);
    setShowDetailModal(true);
  };

  return (
    <Layout>
      <SalesHeader
        todaySales={todaySalesData.length}
        todayRevenue={todayRevenue}
      />

      <SalesFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        dateFrom={dateFrom}
        setDateFrom={setDateFrom}
        dateTo={dateTo}
        setDateTo={setDateTo}
        selectedShop={selectedShop}
        setSelectedShop={setSelectedShop}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        shops={shops}
      />

      <SalesTable
        sales={filteredSales}
        onViewDetails={handleViewDetails}
        loading={loading}
      />

      {selectedSale && (
        <SalesDetailModal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          sale={selectedSale}
          shopName={
            shops.find((s) => s.id === selectedSale.shop_id)?.name || "Unknown"
          }
        />
      )}
    </Layout>
  );
};
