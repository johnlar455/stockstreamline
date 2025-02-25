
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Filter } from "lucide-react";
import { TransactionModal } from "@/components/transactions/TransactionModal";
import { TransactionType, TransactionWithProduct } from "@/types/transaction";
import { format } from "date-fns";

export default function Transactions() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TransactionType | "all">("all");
  const { toast } = useToast();

  const { data: transactions, refetch } = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const query = supabase
        .from("transactions")
        .select(`
          *,
          products (
            name,
            sku
          )
        `)
        .order("created_at", { ascending: false });

      if (typeFilter !== "all") {
        query.eq("type", typeFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as TransactionWithProduct[];
    },
  });

  const filteredTransactions = transactions?.filter((transaction) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      transaction.products.name.toLowerCase().includes(searchLower) ||
      transaction.products.sku.toLowerCase().includes(searchLower) ||
      transaction.notes?.toLowerCase().includes(searchLower)
    );
  });

  const getTransactionTypeLabel = (type: TransactionType) => {
    return {
      purchase: "Purchase",
      sale: "Sale",
      damage: "Damage",
      transfer_in: "Transfer In",
      transfer_out: "Transfer Out",
    }[type];
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Transactions</h1>
        <p className="text-gray-500 mt-2">View and manage stock transactions</p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex-shrink-0 min-w-[150px]">
            <Select value={typeFilter} onValueChange={(value: TransactionType | "all") => setTypeFilter(value)}>
              <SelectTrigger>
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="purchase">Purchase</SelectItem>
                <SelectItem value="sale">Sale</SelectItem>
                <SelectItem value="damage">Damage</SelectItem>
                <SelectItem value="transfer_in">Transfer In</SelectItem>
                <SelectItem value="transfer_out">Transfer Out</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          New Transaction
        </Button>
      </div>

      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Unit Price</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions?.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  {format(new Date(transaction.created_at), "MMM d, yyyy HH:mm")}
                </TableCell>
                <TableCell>
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                    transaction.type === "purchase" || transaction.type === "transfer_in"
                      ? "bg-green-100 text-green-800"
                      : transaction.type === "sale"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-red-100 text-red-800"
                  }`}>
                    {getTransactionTypeLabel(transaction.type)}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{transaction.products.name}</div>
                  <div className="text-sm text-gray-500">{transaction.products.sku}</div>
                </TableCell>
                <TableCell>{transaction.quantity}</TableCell>
                <TableCell>
                  {transaction.unit_price
                    ? `$${transaction.unit_price.toFixed(2)}`
                    : "-"}
                </TableCell>
                <TableCell>{transaction.notes || "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          refetch();
        }}
      />
    </div>
  );
}
