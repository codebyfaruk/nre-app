// src/pages/Sales.jsx - CORRECT VERSION WITH FIXED HANDLERS
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

  // ✅ Filter with snake_case field names
  const filteredSales = sales.filter((sale) => {
    const matchesSearch =
      sale.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.customer_phone?.includes(searchTerm);

    const saleDate = new Date(sale.sale_date).toISOString().split("T")[0];
    const matchesDateFrom = !dateFrom || saleDate >= dateFrom;
    const matchesDateTo = !dateTo || saleDate <= dateTo;

    const matchesShop =
      !selectedShop || sale.shop_id === parseInt(selectedShop);

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

  // ✅ Calculate today's data
  const today = new Date().toISOString().split("T")[0];
  const todaySalesData = sales.filter(
    (sale) => new Date(sale.sale_date).toISOString().split("T")[0] === today
  );

  const todayRevenue = todaySalesData.reduce((sum, sale) => {
    const amount = parseFloat(sale.total_amount);
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);

  const handleViewDetails = (sale) => {
    setSelectedSale(sale);
  };

  const getShopForSale = (sale) => {
    return shops.find((s) => s.id === sale.shop_id) || null;
  };

  return (
    <Layout>
      <SalesHeader
        totalSales={sales.length}
        todaySales={todaySalesData.length}
        todayRevenue={todayRevenue}
      />

      <SalesFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        dateFrom={dateFrom}
        onDateFromChange={setDateFrom}
        dateTo={dateTo}
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

      {selectedSale && (
        <SalesDetailModal
          sale={selectedSale}
          shop={getShopForSale(selectedSale)}
          onClose={() => setSelectedSale(null)}
        />
      )}
    </Layout>
  );
};
