
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useDashboardData() {
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
      };
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

  return {
    stockSummary,
    stockTrend,
    products,
    isLoadingStock
  };
}
