
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Supplier } from "@/types/supplier";

interface SupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier?: Supplier | null;
  onSuccess: () => void;
}

export function SupplierModal({ isOpen, onClose, supplier, onSuccess }: SupplierModalProps) {
  const [formData, setFormData] = useState<Partial<Supplier>>(
    supplier || {
      name: "",
      email: "",
      phone: "",
      address: "",
      notes: "",
    }
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (supplier?.id) {
        const { error } = await supabase
          .from("suppliers")
          .update(formData)
          .eq("id", supplier.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("suppliers").insert([formData]);
        if (error) throw error;
      }

      toast({ title: `Supplier ${supplier ? "updated" : "added"} successfully` });
      onSuccess();
    } catch (error: any) {
      toast({
        title: `Error ${supplier ? "updating" : "adding"} supplier`,
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{supplier ? "Edit" : "Add"} Supplier</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, phone: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, address: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              value={formData.notes || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {supplier ? "Update" : "Add"} Supplier
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
