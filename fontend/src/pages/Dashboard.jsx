// src/pages/Dashboard.jsx - FIXED
import { useState, useEffect } from "react";
import { Layout } from "../components/layout/Layout";
import {
  StatsGrid,
  RecentSalesTable,
  LowStockAlert,
} from "../components/dashboard";
import { apiService } from "../services/api.service";
import { showError } from "../utils/toast";

export const Dashboard = () => {
  const [stats, setStats] = useState({
    todaySales: 0,
    totalProducts: 0,
    lowStock: 0,
    pendingReturns: 0,
  });
  const [recentSales, setRecentSales] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // ✅ FIXED: Using correct API methods with proper error handling
      const [todaySalesRes, productsRes, lowStockRes, returnsRes] =
        await Promise.all([
          apiService
            .getTodaySales()
            .catch(() => ({ data: { total_amount: 0, sales: [] } })),
          apiService.getProducts().catch(() => ({ data: [] })),
          apiService.getLowStock(5).catch(() => ({ data: [] })),
          apiService.getReturns("pending").catch(() => ({ data: [] })),
        ]);

      console.log("✅ Today's Sales:", todaySalesRes.data);
      console.log("✅ Products:", productsRes.data);
      console.log("✅ Low Stock:", lowStockRes.data);
      console.log("✅ Returns:", returnsRes.data);

      // ✅ FIXED: Correct data structure mapping
      setStats({
        todaySales: todaySalesRes.data.total_amount || 0,
        totalProducts: productsRes.data.length || 0,
        lowStock: lowStockRes.data.length || 0,
        pendingReturns: returnsRes.data.length || 0,
      });

      // ✅ FIXED: Get sales from today's sales response
      const salesList = todaySalesRes.data.sales || [];
      setRecentSales(salesList.slice(0, 5));
      setLowStockItems(lowStockRes.data.slice(0, 5));
    } catch (error) {
      console.error("❌ Error loading dashboard:", error);
      showError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back! Here's what's happening today.
          </p>
        </div>

        <StatsGrid stats={stats} loading={loading} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <RecentSalesTable sales={recentSales} loading={loading} />
          <LowStockAlert items={lowStockItems} loading={loading} />
        </div>
      </div>
    </Layout>
  );
};
