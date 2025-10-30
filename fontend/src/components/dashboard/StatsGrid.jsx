// src/components/dashboard/StatsGrid.jsx
import { StatCard } from "../common/StatCard";
import { formatCurrency } from "../../utils/helpers";

export const StatsGrid = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-gray-200 rounded-xl h-32 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <StatCard
        title="Total Sales"
        value={formatCurrency(stats.revenue)}
        icon="💰"
        variant="dark"
        subtitle="Today"
      />
      <StatCard
        title="Products"
        value={stats.products}
        icon="📦"
        variant="default"
        subtitle="Total"
      />
      <StatCard
        title="Low Stock"
        value={stats.lowStock}
        icon="⚠️"
        variant="light"
        subtitle="Alert"
      />
      <StatCard
        title="Returns"
        value={stats.pendingReturns}
        icon="↩️"
        variant="default"
        subtitle="Pending"
      />
    </div>
  );
};
