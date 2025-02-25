
import { Package, AlertTriangle, Users, TrendingUp } from 'lucide-react';
import { StatsCard } from './StatsCard';

interface DashboardStatsProps {
  stockSummary: {
    totalProducts: number;
    lowStockItems: number;
    activeSuppliers: number;
    monthlyTransactions: number;
  } | undefined;
}

export function DashboardStats({ stockSummary }: DashboardStatsProps) {
  const statsCards = [
    {
      title: "Total Products",
      value: stockSummary?.totalProducts || 0,
      icon: Package,
      trend: "+4.75%",
      trendUp: true
    },
    {
      title: "Low Stock Items",
      value: stockSummary?.lowStockItems || 0,
      icon: AlertTriangle,
      trend: stockSummary?.lowStockItems > 5 ? "+2.1%" : "-3.2%",
      trendUp: false,
      alert: true
    },
    {
      title: "Active Suppliers",
      value: stockSummary?.activeSuppliers || 0,
      icon: Users,
      trend: "+12.5%",
      trendUp: true
    },
    {
      title: "Monthly Transactions",
      value: stockSummary?.monthlyTransactions || 0,
      icon: TrendingUp,
      trend: "+8.2%",
      trendUp: true
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statsCards.map((card, index) => (
        <StatsCard key={index} {...card} />
      ))}
    </div>
  );
}
