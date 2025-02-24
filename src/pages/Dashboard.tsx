import React, { useState } from 'react';
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
  Download,
  Pencil,
  Trash2
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProductModal } from '@/components/products/ProductModal';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";

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
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stockSummary, isLoading: isLoadingStock } = useQuery({
    queryKey: ['stockSummary'],
    queryFn: async () => {
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, current_stock, minimum_stock');
      
      if (productsError) throw productsError;

      const { data: suppliers, error: suppliersError } = await supabase
        .from('suppliers')
        .select('id');
      
      if (suppliersError) throw suppliersError;

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

  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-2">Welcome to your inventory overview</p>
      </div>

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

      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Minimum Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products?.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell>{product.current_stock}</TableCell>
                  <TableCell>{product.minimum_stock}</TableCell>
                  <TableCell>
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs",
                      product.current_stock <= product.minimum_stock
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                    )}>
                      {product.current_stock <= product.minimum_stock ? "Low Stock" : "In Stock"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedProduct(product);
                          setIsProductModalOpen(true);
                        }}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['products'] });
          queryClient.invalidateQueries({ queryKey: ['stockSummary'] });
        }}
      />
    </div>
  );
};

export default Dashboard;
