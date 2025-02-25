
export interface Product {
  id: string;
  name: string;
  sku: string;
  description: string | null;
  current_stock: number;
  minimum_stock: number;
  category_id: string | null;
  image_url: string | null;
  categories?: {
    id: string;
    name: string;
  };
}
