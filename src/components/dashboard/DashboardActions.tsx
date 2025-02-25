
import { PlusCircle, FileText, Download } from 'lucide-react';
import { QuickActions } from './QuickActions';
import { Product } from '@/types/product';

interface DashboardActionsProps {
  onAddProduct: () => void;
  products: Product[];
}

export function DashboardActions({ onAddProduct, products }: DashboardActionsProps) {
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

    downloadCSV(csvContent, 'stock_report.csv');
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

    downloadCSV(csvContent, 'detailed_stock_list.csv');
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', filename);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const quickActions = [
    { 
      label: "Add Product", 
      icon: PlusCircle, 
      action: onAddProduct
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

  return <QuickActions actions={quickActions} />;
}
