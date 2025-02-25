
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Product } from "@/types/product";
import { Supplier, ProductSupplier } from "@/types/supplier";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface LinkProductsModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: Supplier;
}

export function LinkProductsModal({ isOpen, onClose, supplier }: LinkProductsModalProps) {
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [unitPrice, setUnitPrice] = useState<string>("");
  const [leadTimeDays, setLeadTimeDays] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*");
      if (error) throw error;
      return data as Product[];
    },
  });

  const { data: linkedProducts } = useQuery({
    queryKey: ["linkedProducts", supplier.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_suppliers")
        .select("*, products(*)")
        .eq("supplier_id", supplier.id);
      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      const newLink: ProductSupplier = {
        supplier_id: supplier.id,
        product_id: selectedProduct,
        unit_price: unitPrice ? parseFloat(unitPrice) : null,
        lead_time_days: leadTimeDays ? parseInt(leadTimeDays) : null,
      };

      const { error } = await supabase.from("product_suppliers").insert([newLink]);
      if (error) throw error;

      toast({ title: "Product linked successfully" });
      queryClient.invalidateQueries({ queryKey: ["linkedProducts"] });
      setSelectedProduct("");
      setUnitPrice("");
      setLeadTimeDays("");
    } catch (error: any) {
      toast({
        title: "Error linking product",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Link Products to {supplier.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="product">Product</Label>
            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger>
                <SelectValue placeholder="Select a product" />
              </SelectTrigger>
              <SelectContent>
                {products?.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="unitPrice">Unit Price</Label>
            <Input
              id="unitPrice"
              type="number"
              step="0.01"
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="leadTime">Lead Time (days)</Label>
            <Input
              id="leadTime"
              type="number"
              value={leadTimeDays}
              onChange={(e) => setLeadTimeDays(e.target.value)}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose} type="button">
              Close
            </Button>
            <Button type="submit" disabled={!selectedProduct}>
              Link Product
            </Button>
          </div>
        </form>
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Linked Products</h3>
          <div className="space-y-2">
            {linkedProducts?.map((link: any) => (
              <div
                key={link.product_id}
                className="flex justify-between items-center p-2 bg-muted rounded-md"
              >
                <span>{link.products.name}</span>
                <div className="text-sm text-muted-foreground">
                  {link.unit_price && <span>Price: ${link.unit_price}</span>}
                  {link.lead_time_days && (
                    <span className="ml-2">Lead time: {link.lead_time_days} days</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
