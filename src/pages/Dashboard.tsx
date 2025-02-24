
import React, { useEffect, useState } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  TrendingUp, 
  Users, 
  AlertTriangle,
  FileText,
  PlusCircle,
  Download
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Types for our data
interface StockSummary {
  totalProducts: number;
  lowStockItems: number;
  activeSuppliers: number;
  monthlyTransactions: number;
}

interface ChartData {
  name: string;
  value: number;
}

const Dashboard = () => {
  // Fetch stock summary data
  const { data: stockSummary, isLoading: isLoadingStock } = useQuery({
    queryKey: ['stockSummary'],
    queryFn: async () => {
      // Fetch total products
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, current_stock, minimum_stock');
      
      if (productsError) throw productsError;

      // Fetch active suppliers
      const { data: suppliers, error: suppliersError } = await supabase
        .from('suppliers')
        .select('id');
      
      if (suppliersError) throw suppliersError;

      // Fetch monthly transactions
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select('id')
        .gte('created_at', thirtyDaysAgo.toISOString());
      
      if (transactionsError) throw transactionsError;

      return {
        totalProducts: products.length,
        lowStockItems: products.filter(p => p.current_stock <= p.minimum_stock).length,
        activeSuppliers: suppliers.length,
        monthlyTransactions: transactions.length
      } as StockSummary;
    }
  });

  // Fetch stock trend data
  const { data: stockTrend } = useQuery({
    queryKey: ['stockTrend'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('created_at, quantity, type')
        .order('created_at', { ascending: true })
        .limit(10);

      if (error) throw error;

      return data.map(transaction => ({
        name: new Date(transaction.created_at).toLocaleDateString(),
        value: transaction.type === 'purchase' ? transaction.quantity : -transaction.quantity
      }));
    }
  });

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

  const quickActions = [
    { label: "Add Product", icon: PlusCircle, action: () => {} },
    { label: "Export Report", icon: FileText, action: () => {} },
    { label: "Download Stock List", icon: Download, action: () => {} }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-2">Welcome to your inventory overview</p>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        {quickActions.map((action, index) => (
          <Button
            key={index}
            onClick={action.action}
            className="flex items-center gap-2"
          >
            <action.icon className="w-4 h-4" />
            {action.label}
          </Button>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card 
              key={index} 
              className={cn(
                "hover:shadow-lg transition-shadow duration-200",
                card.alert && card.value > 5 ? "border-red-500" : ""
              )}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {card.title}
                </CardTitle>
                <Icon className={cn(
                  "w-5 h-5",
                  card.alert && card.value > 5 ? "text-red-500" : "text-gray-400"
                )} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Stock Movement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stockTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#8884d8" 
                    activeDot={{ r: 8 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stockTrend?.slice(-5)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
