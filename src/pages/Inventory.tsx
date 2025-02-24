
import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Package, PlusCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { ProductModal } from '@/components/products/ProductModal';
import { ProductsTable } from '@/components/dashboard/ProductsTable';
import { Card, CardContent } from '@/components/ui/card';

const Inventory = () => {
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name
          )
        `)
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

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

  const lowStockProducts = products?.filter(
    product => product.current_stock <= product.minimum_stock
  ) || [];

  return (
    <div className="space-y-6 animate-fade-in p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Inventory</h1>
          <p className="text-gray-500 mt-2">Manage your products and stock levels</p>
        </div>
        <Button 
          onClick={() => {
            setSelectedProduct(null);
            setIsProductModalOpen(true);
          }}
          className="flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          Add Product
        </Button>
      </div>

      {lowStockProducts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="flex items-center gap-3 py-3">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <p className="text-sm text-orange-800">
              {lowStockProducts.length} product(s) are running low on stock
            </p>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Package className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <ProductsTable 
          products={products || []}
          onEdit={(product) => {
            setSelectedProduct(product);
            setIsProductModalOpen(true);
          }}
          onDelete={handleDeleteProduct}
        />
      )}

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
          setIsProductModalOpen(false);
          setSelectedProduct(null);
        }}
      />
    </div>
  );
};

export default Inventory;
