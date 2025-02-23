
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, TrendingUp, Users, AlertTriangle } from 'lucide-react';

const statsCards = [
  {
    title: "Total Products",
    value: "2,420",
    icon: Package,
    trend: "+4.75%",
    trendUp: true
  },
  {
    title: "Low Stock Items",
    value: "15",
    icon: AlertTriangle,
    trend: "+2.1%",
    trendUp: false
  },
  {
    title: "Active Suppliers",
    value: "48",
    icon: Users,
    trend: "+12.5%",
    trendUp: true
  },
  {
    title: "Monthly Transactions",
    value: "845",
    icon: TrendingUp,
    trend: "+8.2%",
    trendUp: true
  }
];

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-2">Welcome to your inventory overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index} className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {card.title}
                </CardTitle>
                <Icon className="w-5 h-5 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{card.value}</div>
                <div className={cn(
                  "text-xs font-medium mt-2",
                  card.trendUp ? "text-green-600" : "text-red-600"
                )}>
                  {card.trend} from last month
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">Activity timeline will be displayed here</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Stock Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">Stock charts will be displayed here</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
