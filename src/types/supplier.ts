
export interface Supplier {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
}

export interface ProductSupplier {
  supplier_id: string;
  product_id: string;
  unit_price: number | null;
  lead_time_days: number | null;
}
