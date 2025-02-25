
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, FileText, TrendingUp, Package, AlertTriangle } from 'lucide-react';

export default function Reports() {
  const [timeRange, setTimeRange] = useState<'7days' | '30days' | 'month'>('30days');

  const getDateRange = () => {
    const now = new Date();
    switch (timeRange) {
      case '7days':
        return subDays(now, 7);
      case '30days':
        return subDays(now, 30);
      case 'month':
        return startOfMonth(now);
      default:
        return subDays(now, 30);
    }
  };

  const { data: stockSummary } = useQuery({
    queryKey: ['stockSummary', timeRange],
    queryFn: async () => {
      const startDate = getDateRange();
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('current_stock', { ascending: true });

      if (productsError) throw productsError;

      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select(`
          type,
          quantity,
          created_at,
          products (
            name,
            sku
          )
        `)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (transactionsError) throw transactionsError;

      return {
        products,
        transactions,
        lowStockItems: products.filter(p => p.current_stock <= p.minimum_stock)
      };
    }
  });

  const transactionsByDay = stockSummary?.transactions.reduce((acc: any, transaction) => {
    const date = format(new Date(transaction.created_at), 'MMM dd');
    if (!acc[date]) {
      acc[date] = { sales: 0, purchases: 0, damages: 0 };
    }
    
    if (transaction.type === 'sale') {
      acc[date].sales += transaction.quantity;
    } else if (transaction.type === 'purchase') {
      acc[date].purchases += transaction.quantity;
    } else if (transaction.type === 'damage') {
      acc[date].damages += transaction.quantity;
    }
    
    return acc;
  }, {});

  const chartData = Object.entries(transactionsByDay || {}).map(([date, data]: [string, any]) => ({
    date,
    ...data
  }));

  const handleExportCSV = () => {
    if (!stockSummary) return;

    const transactionRows = stockSummary.transactions.map(t => ({
      Date: format(new Date(t.created_at), 'yyyy-MM-dd HH:mm:ss'),
      Type: t.type,
      Product: t.products.name,
      SKU: t.products.sku,
      Quantity: t.quantity
    }));

    const csvContent = [
      Object.keys(transactionRows[0]).join(','),
      ...transactionRows.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `stock_report_${timeRange}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Reports</h1>
          <p className="text-gray-500 mt-2">Analyze your inventory performance</p>
        </div>
        <div className="flex gap-4 w-full sm:w-auto">
          <Select value={timeRange} onValueChange={(value: '7days' | '30days' | 'month') => setTimeRange(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="month">This month</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stockSummary?.products.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stockSummary?.lowStockItems.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stockSummary?.transactions.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Stock Movement Trends">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="sales" stroke="#ef4444" name="Sales" />
            <Line type="monotone" dataKey="purchases" stroke="#22c55e" name="Purchases" />
            <Line type="monotone" dataKey="damages" stroke="#f97316" name="Damages" />
          </LineChart>
        </ChartCard>

        <ChartCard title="Transaction Distribution">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="sales" fill="#ef4444" name="Sales" />
            <Bar dataKey="purchases" fill="#22c55e" name="Purchases" />
            <Bar dataKey="damages" fill="#f97316" name="Damages" />
          </BarChart>
        </ChartCard>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Low Stock Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Minimum Stock</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stockSummary?.lowStockItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.sku}</TableCell>
                  <TableCell>{item.current_stock}</TableCell>
                  <TableCell>{item.minimum_stock}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Low Stock
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
