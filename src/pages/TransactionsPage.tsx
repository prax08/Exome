"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import {
  IndianRupee,
  PlusCircle,
  ArrowUpCircle,
  ArrowDownCircle,
  MoreHorizontal,
  CalendarDays,
  Search,
  ArrowUpDown,
  Tag, // Import Tag icon for categories
} from "lucide-react";
import { Button } from "@/components/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { Loading } from "@/components/Loading";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";
import { format } from "date-fns";
import { TransactionFormModal } from "@/components/TransactionFormModal";
import { Input } from "@/components/Input";
import { Select } from "@/components/Select";
import { DateRangePicker } from "@/components/DateRangePicker";
import { DateRange } from "react-day-picker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationLink, PaginationNext } from "@/components/ui/pagination";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { CategorySelect } from "@/components/CategorySelect"; // Import CategorySelect

// Define transaction type for client-side
interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  description: string;
  date: string; // ISO date string
  category_id?: string | null; // Add category_id
  category_name?: string | null; // Add category_name for display
  category_color?: string | null; // Add category_color for display
  created_at: string;
}

type TransactionTypeFilter = 'all' | 'income' | 'expense';
type SortColumn = 'date' | 'amount';
type SortDirection = 'asc' | 'desc';

const transactionTypeFilterOptions = [
  { value: "all", label: "All" },
  { value: "income", label: "Income" },
  { value: "expense", label: "Expense" },
];

const TransactionsPage: React.FC = () => {
  const { user } = useSession();
  const isMobile = useIsMobile();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [initialTransactionType, setInitialTransactionType] = useState<'income' | 'expense'>('expense');

  // Filter states
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<TransactionTypeFilter>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined); // New category filter state

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // You can make this configurable

  // Sorting states
  const [sortColumn, setSortColumn] = useState<SortColumn>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const fetchTransactions = async (
    typeFilter: TransactionTypeFilter,
    range: DateRange | undefined,
    search: string,
    category: string | undefined, // Add category to fetch params
    page: number,
    limit: number,
    column: SortColumn,
    direction: SortDirection
  ) => {
    if (!user) return { data: [], count: 0 };

    let query = supabase
      .from('transactions')
      .select(`
        *,
        categories (
          name,
          color
        )
      `, { count: 'exact' })
      .eq('user_id', user.id);

    if (typeFilter !== 'all') {
      query = query.eq('type', typeFilter);
    }
    if (range?.from) {
      query = query.gte('date', format(range.from, 'yyyy-MM-dd'));
    }
    if (range?.to) {
      query = query.lte('date', format(range.to, 'yyyy-MM-dd'));
    }
    if (search) {
      query = query.ilike('description', `%${search}%`);
    }
    if (category) { // Apply category filter
      query = query.eq('category_id', category);
    }

    query = query.order(column, { ascending: direction === 'asc' });

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching transactions:", error);
      throw new Error("Failed to fetch transactions.");
    }

    // Map data to include category name and color directly
    const transactionsWithCategories = data.map((t: any) => ({
      ...t,
      category_name: t.categories?.name || null,
      category_color: t.categories?.color || null,
    })) as Transaction[];

    return { data: transactionsWithCategories, count: count || 0 };
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [
      'transactions',
      user?.id,
      transactionTypeFilter,
      dateRange,
      searchTerm,
      categoryFilter, // Add categoryFilter to queryKey
      currentPage,
      itemsPerPage,
      sortColumn,
      sortDirection,
    ],
    queryFn: () =>
      fetchTransactions(
        transactionTypeFilter,
        dateRange,
        searchTerm,
        categoryFilter, // Pass category filter
        currentPage,
        itemsPerPage,
        sortColumn,
        sortDirection
      ),
    enabled: !!user,
    placeholderData: (previousData) => previousData, // Keep previous data while fetching new
  });

  const totalPages = useMemo(() => {
    if (!data?.count) return 0;
    return Math.ceil(data.count / itemsPerPage);
  }, [data?.count, itemsPerPage]);

  const handleAddTransaction = (type: 'income' | 'expense') => {
    setEditingTransaction(null);
    setInitialTransactionType(type);
    setIsModalOpen(true);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    if (!user) {
      toast.error("You must be logged in to delete transactions.");
      return;
    }

    if (window.confirm("Are you sure you want to delete this transaction? This action cannot be undone.")) {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId)
        .eq('user_id', user.id);

      if (error) {
        console.error("Error deleting transaction:", error);
        toast.error(`Failed to delete transaction: ${error.message}`);
      } else {
        toast.success("Transaction deleted successfully!");
        refetch();
      }
    }
  };

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc'); // Default to descending for new sort column
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => {
                if (currentPage !== 1) {
                  setCurrentPage((prev) => Math.max(1, prev - 1));
                }
              }}
              className={cn(currentPage === 1 && "pointer-events-none opacity-50")}
              aria-disabled={currentPage === 1}
            />
          </PaginationItem>
          {pages.map((page) => (
            <PaginationItem key={page}>
              <PaginationLink
                onClick={() => setCurrentPage(page)}
                isActive={currentPage === page}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              onClick={() => {
                if (currentPage !== totalPages) {
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1));
                }
              }}
              className={cn(currentPage === totalPages && "pointer-events-none opacity-50")}
              aria-disabled={currentPage === totalPages}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  if (isLoading && !data) { // Only show full loading if no data is present yet
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-160px)]">
        <Loading count={5} className="w-full max-w-md" />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        title="Error loading transactions"
        description={error.message}
        action={<Button onClick={() => refetch()}>Try Again</Button>}
      />
    );
  }

  const transactions = data?.data || [];
  const hasTransactions = transactions.length > 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Your Transactions</h2>
        <div className="flex gap-2">
          <Button onClick={() => handleAddTransaction('income')} variant="primary">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Income
          </Button>
          <Button onClick={() => handleAddTransaction('expense')} variant="destructive">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Expense
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Transactions</CardTitle>
          <CardDescription>Refine your transaction view.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4"> {/* Adjusted grid for new filter */}
          <div className="col-span-1">
            <Select
              options={transactionTypeFilterOptions}
              placeholder="Filter by type"
              onValueChange={(value) => {
                setTransactionTypeFilter(value as TransactionTypeFilter);
                setCategoryFilter(undefined); // Reset category filter when type changes
                setCurrentPage(1); // Reset page on filter change
              }}
              value={transactionTypeFilter}
            />
          </div>
          <div className="col-span-1">
            <CategorySelect
              transactionType={transactionTypeFilter} // Pass selected transaction type to filter categories
              value={categoryFilter || ""}
              onValueChange={(value) => {
                setCategoryFilter(value || undefined);
                setCurrentPage(1); // Reset page on filter change
              }}
              placeholder="Filter by category"
            />
          </div>
          <div className="col-span-1">
            <DateRangePicker
              dateRange={dateRange}
              onSelect={(range) => {
                setDateRange(range);
                setCurrentPage(1); // Reset page on filter change
              }}
              className="w-full"
            />
          </div>
          <div className="col-span-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search description..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset page on filter change
              }}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {hasTransactions ? (
        <>
          {isMobile ? (
            // Mobile view: Cards
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <Card key={transaction.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {transaction.type === 'income' ? (
                          <ArrowUpCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <ArrowDownCircle className="h-5 w-5 text-red-500" />
                        )}
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          {transaction.category_name && (
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Tag className="h-3 w-3 mr-1" style={{ color: transaction.category_color || undefined }} />
                              <span>{transaction.category_name}</span>
                            </div>
                          )}
                          <p className="text-sm text-muted-foreground">{format(new Date(transaction.date), 'PPP')}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <p className={`font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                          ₹{transaction.amount.toFixed(2)}
                        </p>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleEditTransaction(transaction)}>Edit</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDeleteTransaction(transaction.id)} className="text-destructive">
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            // Desktop view: Table
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead> {/* New Category column */}
                    <TableHead
                      className="cursor-pointer hover:text-primary"
                      onClick={() => handleSort('date')}
                    >
                      <div className="flex items-center">
                        Date
                        <ArrowUpDown className={cn("ml-2 h-4 w-4", sortColumn === 'date' && "text-primary")} />
                      </div>
                    </TableHead>
                    <TableHead
                      className="text-right cursor-pointer hover:text-primary"
                      onClick={() => handleSort('amount')}
                    >
                      <div className="flex items-center justify-end">
                        Amount
                        <ArrowUpDown className={cn("ml-2 h-4 w-4", sortColumn === 'amount' && "text-primary")} />
                      </div>
                    </TableHead>
                    <TableHead className="w-[50px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {transaction.type === 'income' ? (
                          <ArrowUpCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <ArrowDownCircle className="h-5 w-5 text-red-500" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{transaction.description}</TableCell>
                      <TableCell>
                        {transaction.category_name ? (
                          <div className="flex items-center">
                            <Tag className="h-4 w-4 mr-2" style={{ color: transaction.category_color || undefined }} />
                            <span>{transaction.category_name}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>{format(new Date(transaction.date), 'PPP')}</TableCell>
                      <TableCell className={`text-right font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        ₹{transaction.amount.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleEditTransaction(transaction)}>Edit</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDeleteTransaction(transaction.id)} className="text-destructive">
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          {renderPagination()}
        </>
      ) : (
        <EmptyState
          icon={<CalendarDays size={64} />}
          title="No Transactions Found"
          description="Adjust your filters or add new transactions to see them here."
          action={
            <div className="flex gap-2">
              <Button onClick={() => handleAddTransaction('income')} variant="primary">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Income
              </Button>
              <Button onClick={() => handleAddTransaction('expense')} variant="destructive">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Expense
              </Button>
            </div>
          }
        />
      )}

      <TransactionFormModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSuccess={refetch}
        editingTransaction={editingTransaction}
        initialType={initialTransactionType}
      />
    </div>
  );
};

export default TransactionsPage;