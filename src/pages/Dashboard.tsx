
import React, { useState } from 'react';
import { Package } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProductModal } from '@/components/products/ProductModal';
import { useToast } from "@/hooks/use-toast";
import { ProductsTable } from '@/components/dashboard/ProductsTable';
import { useDashboardData } from '@/hooks/useDashboardData';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { DashboardCharts } from '@/components/dashboard/DashboardCharts';
import { DashboardActions } from '@/components/dashboard/DashboardActions';

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

  const handleDeleteProduct = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);
      
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({ title: "Product deleted successfully" });
    } catch (error: any) {
      toast({
        title: "Error deleting product",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-2">Welcome to your inventory overview</p>
      </div>

      <DashboardActions 
        onAddProduct={() => {
          setSelectedProduct(null);
          setIsProductModalOpen(true);
        }}
        products={products || []}
      />

      <DashboardStats stockSummary={stockSummary} />

      <DashboardCharts stockTrend={stockTrend} />

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
