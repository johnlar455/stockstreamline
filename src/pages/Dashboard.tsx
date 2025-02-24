import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';
import { 
  Package, 
  TrendingUp, 
  Users, 
  AlertTriangle,
  FileText,
  PlusCircle,
  Download,
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProductModal } from '@/components/products/ProductModal';
import { useToast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { ProductsTable } from '@/components/dashboard/ProductsTable';
import { useDashboardData } from '@/hooks/useDashboardData';

const Dashboard = () => {
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { stockSummary, stockTrend, products } = useDashboardData();
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  const handleExportReport = () => {
    const headers = ['Name', 'SKU', 'Current Stock', 'Minimum Stock'];
    const csvContent = [
      headers.join(','),
      ...(products || []).map(product => 
        [
          product.name,
          product.sku,
          product.current_stock,
          product.minimum_stock
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'stock_report.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast({ title: "Report downloaded successfully" });
  };

  const handleDownloadStockList = () => {
    const headers = ['Name', 'SKU', 'Description', 'Current Stock', 'Minimum Stock', 'Status'];
    const csvContent = [
      headers.join(','),
      ...(products || []).map(product => 
        [
          product.name,
          product.sku,
          product.description || 'N/A',
          product.current_stock,
          product.minimum_stock,
          product.current_stock <= product.minimum_stock ? 'Low Stock' : 'In Stock'
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'detailed_stock_list.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast({ title: "Stock list downloaded successfully" });
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);
      
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['stockSummary'] });
      toast({ title: "Product deleted successfully" });
    } catch (error: any) {
      toast({
        title: "Error deleting product",
        description: error.message,
        variant: "destructive"
      });
    }
  };

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
    { 
      label: "Add Product", 
      icon: PlusCircle, 
      action: () => {
        setSelectedProduct(null);
        setIsProductModalOpen(true);
      }
    },
    { 
      label: "Export Report", 
      icon: FileText, 
      action: handleExportReport
    },
    { 
      label: "Download Stock List", 
      icon: Download, 
      action: handleDownloadStockList
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-2">Welcome to your inventory overview</p>
      </div>

      <QuickActions actions={quickActions} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card, index) => (
          <StatsCard key={index} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Stock Movement">
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
        </ChartCard>

        <ChartCard title="Recent Transactions">
          <BarChart data={stockTrend?.slice(-5)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ChartCard>
      </div>

      <ProductsTable 
        products={products || []}
        onEdit={(product) => {
          setSelectedProduct(product);
          setIsProductModalOpen(true);
        }}
        onDelete={handleDeleteProduct}
      />

      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        categories={categories || []}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['products'] });
          queryClient.invalidateQueries({ queryKey: ['stockSummary'] });
          setIsProductModalOpen(false);
          setSelectedProduct(null);
        }}
      />
    </div>
  );
};

export default Dashboard;
