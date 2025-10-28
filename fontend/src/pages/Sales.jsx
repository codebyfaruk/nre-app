// src/pages/Sales.jsx - COMPLETE
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

  // Filter sales
  const filteredSales = sales.filter((sale) => {
    // Search filter
    const matchesSearch =
      sale.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.customerPhone?.includes(searchTerm);

    // Date filters
    const saleDate = new Date(sale.saleDate).toISOString().split("T")[0];
    const matchesDateFrom = !dateFrom || saleDate >= dateFrom;
    const matchesDateTo = !dateTo || saleDate <= dateTo;

    // Shop filter
    const matchesShop = !selectedShop || sale.shopId === parseInt(selectedShop);

    // Payment method filter
    const matchesPayment =
      !paymentMethod || sale.paymentMethod === paymentMethod;

    return (
      matchesSearch &&
      matchesDateFrom &&
      matchesDateTo &&
      matchesShop &&
      matchesPayment
    );
  });

  // Calculate stats
  const totalSales = sales.length;
  const today = new Date().toISOString().split("T")[0];
  const todaySalesData = sales.filter(
    (sale) => new Date(sale.saleDate).toISOString().split("T")[0] === today
  );
  const todaySales = todaySalesData.length;
  const todayRevenue = todaySalesData.reduce(
    (sum, sale) => sum + sale.totalAmount,
    0
  );

  const handleViewDetails = (sale) => {
    setSelectedSale(sale);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedSale(null);
  };

  return (
    <Layout title="Sales">
      <SalesHeader
        totalSales={totalSales}
        todaySales={todaySales}
        todayRevenue={todayRevenue}
      />

      <SalesFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        selectedShop={selectedShop}
        onShopChange={setSelectedShop}
        paymentMethod={paymentMethod}
        onPaymentMethodChange={setPaymentMethod}
        shops={shops}
      />

      <SalesTable
        sales={filteredSales}
        onViewDetails={handleViewDetails}
        loading={loading}
      />

      {showDetailModal && selectedSale && (
        <SalesDetailModal
          sale={selectedSale}
          shop={shops.find((s) => s.id === selectedSale.shopId)}
          onClose={handleCloseModal}
        />
      )}
    </Layout>
  );
};
