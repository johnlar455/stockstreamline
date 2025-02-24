
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, Image, Loader2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: {
    id: string;
    name: string;
    sku: string;
    description: string | null;
    current_stock: number;
    minimum_stock: number;
    category_id: string | null;
    image_url: string | null;
  };
  categories: Category[];
  onSuccess: () => void;
}

export function ProductModal({ isOpen, onClose, product, categories, onSuccess }: ProductModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: product?.name || "",
    sku: product?.sku || "",
    description: product?.description || "",
    current_stock: product?.current_stock || 0,
    minimum_stock: product?.minimum_stock || 0,
    category_id: product?.category_id || null,
    image_url: product?.image_url || null,
  });

  const handleImageUpload = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let imageUrl = formData.image_url;

      if (imageFile) {
        imageUrl = await handleImageUpload(imageFile);
      }

      const finalData = {
        ...formData,
        image_url: imageUrl,
      };

      if (product?.id) {
        const { error } = await supabase
          .from('products')
          .update(finalData)
          .eq('id', product.id);
        
        if (error) throw error;
        toast({ title: "Product updated successfully" });
      } else {
        // Check for duplicate SKU
        const { data: existingProduct } = await supabase
          .from('products')
          .select('id')
          .eq('sku', formData.sku)
          .single();

        if (existingProduct) {
          toast({
            title: "Error",
            description: "A product with this SKU already exists",
            variant: "destructive",
          });
          return;
        }

        const { error } = await supabase
          .from('products')
          .insert([finalData]);
        
        if (error) throw error;
        toast({ title: "Product created successfully" });
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{product ? "Edit Product" : "Add New Product"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              value={formData.sku}
              onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category_id || undefined}
              onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Product Image</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setImageFile(file);
                }
              }}
              className="hidden"
            />
            <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors">
              {formData.image_url ? (
                <div className="relative group">
                  <img 
                    src={formData.image_url} 
                    alt={formData.name} 
                    className="max-h-32 mx-auto rounded"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, image_url: null }))}
                    >
                      Change Image
                    </Button>
                  </div>
                </div>
              ) : (
                <label htmlFor="image" className="cursor-pointer">
                  <Image className="w-8 h-8 mx-auto text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">
                    {imageFile ? imageFile.name : "Click to upload an image"}
                  </p>
                </label>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="current_stock">Current Stock</Label>
              <Input
                id="current_stock"
                type="number"
                min="0"
                value={formData.current_stock}
                onChange={(e) => setFormData(prev => ({ ...prev, current_stock: parseInt(e.target.value) }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minimum_stock">Minimum Stock</Label>
              <Input
                id="minimum_stock"
                type="number"
                min="0"
                value={formData.minimum_stock}
                onChange={(e) => setFormData(prev => ({ ...prev, minimum_stock: parseInt(e.target.value) }))}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {product ? "Updating..." : "Creating..."}
                </>
              ) : (
                product ? "Update" : "Create"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
