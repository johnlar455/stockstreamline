
export type TransactionType = 'purchase' | 'sale' | 'damage' | 'transfer_in' | 'transfer_out';

export interface Transaction {
  id: string;
  type: TransactionType;
  product_id: string;
  quantity: number;
  unit_price: number | null;
  notes: string | null;
  created_at: string;
  created_by: string | null;
}

export interface TransactionWithProduct extends Transaction {
  products: {
    name: string;
    sku: string;
  };
}
