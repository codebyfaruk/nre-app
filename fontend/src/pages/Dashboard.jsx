// src/pages/Dashboard.jsx - COMPLETE WITHOUT RETURNS CALL

import { useState, useEffect } from "react";
import { Layout } from "../components/layout/Layout";
import {
  StatsGrid,
  RecentSalesTable,
  LowStockAlert,
} from "../components/dashboard";
import { apiService } from "../services/api.service";

export const Dashboard = () => {
  const [todaysSales, setTodaysSales] = useState({
    sales: [],
    total_amount: 0,
    total_sales_count: 0,
    date: new Date().toISOString().split("T")[0],
  });
  const [products, setProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // ✅ Load only working endpoints
      const [salesRes, productsRes, lowStockRes] = await Promise.all([
        apiService.getTodaySales(),
        apiService.getProducts(),
        apiService.getLowStock(10),
      ]);

      setTodaysSales(
        salesRes.data || {
          sales: [],
          total_amount: 0,
          total_sales_count: 0,
          date: new Date().toISOString().split("T")[0],
        }
      );
      setProducts(productsRes.data || []);
      setLowStockProducts(lowStockRes.data || []);
    } catch (error) {
      console.error("❌ Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    totalSales: todaysSales.total_sales_count || 0,
    revenue: parseFloat(todaysSales.total_amount || 0),
    products: products.length,
    lowStock: lowStockProducts.length,
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">
            Welcome back! Here's your store overview for {todaysSales.date}
          </p>
        </div>

        <StatsGrid stats={stats} loading={loading} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <RecentSalesTable sales={todaysSales.sales || []} loading={loading} />
          <LowStockAlert products={lowStockProducts} loading={loading} />
        </div>
      </div>
    </Layout>
  );
};
