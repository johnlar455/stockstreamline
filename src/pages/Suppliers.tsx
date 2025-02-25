
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { SupplierModal } from "@/components/suppliers/SupplierModal";
import { SuppliersTable } from "@/components/suppliers/SuppliersTable";
import { LinkProductsModal } from "@/components/suppliers/LinkProductsModal";
import { Supplier } from "@/types/supplier";

const Suppliers = () => {
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: suppliers } = useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as Supplier[];
    },
  });

  const filteredSuppliers = suppliers?.filter((supplier) =>
    supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.phone?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteSupplier = async (supplierId: string) => {
    try {
      const { error } = await supabase
        .from("suppliers")
        .delete()
        .eq("id", supplierId);
      
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast({ title: "Supplier deleted successfully" });
    } catch (error: any) {
      toast({
        title: "Error deleting supplier",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Suppliers</h1>
        <p className="text-gray-500 mt-2">Manage your supplier relationships</p>
      </div>

      <div className="flex justify-between items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search suppliers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={() => {
          setSelectedSupplier(null);
          setIsSupplierModalOpen(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Supplier
        </Button>
      </div>

      <div className="rounded-md border">
        <SuppliersTable
          suppliers={filteredSuppliers || []}
          onEdit={(supplier) => {
            setSelectedSupplier(supplier);
            setIsSupplierModalOpen(true);
          }}
          onDelete={handleDeleteSupplier}
          onLinkProducts={(supplier) => {
            setSelectedSupplier(supplier);
            setIsLinkModalOpen(true);
          }}
        />
      </div>

      <SupplierModal
        isOpen={isSupplierModalOpen}
        onClose={() => {
          setIsSupplierModalOpen(false);
          setSelectedSupplier(null);
        }}
        supplier={selectedSupplier}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["suppliers"] });
          setIsSupplierModalOpen(false);
          setSelectedSupplier(null);
        }}
      />

      {selectedSupplier && (
        <LinkProductsModal
          isOpen={isLinkModalOpen}
          onClose={() => {
            setIsLinkModalOpen(false);
            setSelectedSupplier(null);
          }}
          supplier={selectedSupplier}
        />
      )}
    </div>
  );
};

export default Suppliers;
