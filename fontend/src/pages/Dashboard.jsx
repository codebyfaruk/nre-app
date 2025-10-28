// src/pages/Dashboard.jsx - UPDATED
import { useState, useEffect } from "react";
import { Layout } from "../components/layout/Layout";
import {
  StatsGrid,
  RecentSalesTable,
  LowStockAlert,
} from "../components/dashboard";
import { apiService } from "../services/api.service"; // ✅ Changed from mockAPI

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
      // ✅ Now using apiService instead of mockAPI
      const [todaySalesRes, productsRes, lowStockRes, returnsRes, salesRes] =
        await Promise.all([
          apiService.getTodaySales(),
          apiService.getProducts(),
          apiService.getLowStock(),
          apiService.getReturns("pending"),
          apiService.getSales(),
        ]);

      setStats({
        todaySales: todaySalesRes.data.total,
        totalProducts: productsRes.data.length,
        lowStock: lowStockRes.data.length,
        pendingReturns: returnsRes.data.length,
      });

      setRecentSales(salesRes.data.slice(0, 5));
      setLowStockItems(lowStockRes.data.slice(0, 5));
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Dashboard">
      <StatsGrid stats={stats} loading={loading} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentSalesTable sales={recentSales} loading={loading} />
        <LowStockAlert items={lowStockItems} loading={loading} />
      </div>
    </Layout>
  );
};
