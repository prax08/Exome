"use client";

import React, { useState } from "react";
import {
  PlusCircle,
  ArrowUpCircle,
  ArrowDownCircle,
  MoreHorizontal,
  Repeat,
  Tag,
} from "lucide-react";
import { Button } from "@/components/Button";
import { Card, CardContent } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { Loading } from "@/components/Loading";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";
import { format } from "date-fns";
import { RecurringTransactionFormModal } from "@/components/RecurringTransactionFormModal";
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
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { MobileActionSheet } from "@/components/MobileActionSheet"; // Import MobileActionSheet

// Define recurring transaction type for client-side
interface RecurringTransaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  description: string;
  category_id?: string | null;
  category_name?: string | null;
  category_color?: string | null;
  start_date: string; // ISO date string
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  end_date?: string | null; // ISO date string, optional
  created_at: string;
}

const frequencyLabels = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
};

const RecurringTransactionsPage: React.FC = () => {
  const { user } = useSession();
  const isMobile = useIsMobile();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecurringTransaction, setEditingRecurringTransaction] = useState<RecurringTransaction | null>(null);
  const [initialTransactionType, setInitialTransactionType] = useState<'income' | 'expense'>('expense');

  const fetchRecurringTransactions = async () => {
    if (!user) return [];

    const { data, error } = await supabase
      .from('recurring_transactions')
      .select(`
        *,
        categories (
          name,
          color
        )
      `)
      .eq('user_id', user.id)
      .order('start_date', { ascending: false });

    if (error) {
      console.error("Error fetching recurring transactions:", error);
      throw new Error("Failed to fetch recurring transactions.");
    }

    const recurringTransactionsWithCategories = data.map((rt: any) => ({
      ...rt,
      category_name: rt.categories?.name || null,
      category_color: rt.categories?.color || null,
    })) as RecurringTransaction[];

    return recurringTransactionsWithCategories;
  };

  const { data: recurringTransactions, isLoading, error, refetch } = useQuery({
    queryKey: ['recurringTransactions', user?.id],
    queryFn: fetchRecurringTransactions,
    enabled: !!user,
  });

  const handleAddRecurringTransaction = (type: 'income' | 'expense') => {
    setEditingRecurringTransaction(null);
    setInitialTransactionType(type);
    setIsModalOpen(true);
  };

  const handleEditRecurringTransaction = (recurringTransaction: RecurringTransaction) => {
    setEditingRecurringTransaction(recurringTransaction);
    setIsModalOpen(true);
  };

  const handleDeleteRecurringTransaction = async (recurringTransactionId: string) => {
    if (!user) {
      toast.error("You must be logged in to delete recurring transactions.");
      return;
    }

    if (window.confirm("Are you sure you want to delete this recurring transaction? This action cannot be undone.")) {
      const { error } = await supabase
        .from('recurring_transactions')
        .delete()
        .eq('id', recurringTransactionId)
        .eq('user_id', user.id);

      if (error) {
        console.error("Error deleting recurring transaction:", error);
        toast.error(`Failed to delete recurring transaction: ${error.message}`);
      } else {
        toast.success("Recurring transaction deleted successfully!");
        refetch();
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-160px)]">
        <Loading count={5} className="w-full max-w-md" />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        title="Error loading recurring transactions"
        description={error.message}
        action={<Button onClick={() => refetch()}>Try Again</Button>}
      />
    );
  }

  const hasRecurringTransactions = recurringTransactions && recurringTransactions.length > 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Recurring Transactions</h2>
        <div className="flex gap-2">
          <Button onClick={() => handleAddRecurringTransaction('income')} variant="primary">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Income
          </Button>
          <Button onClick={() => handleAddRecurringTransaction('expense')} variant="destructive">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Expense
          </Button>
        </div>
      </div>

      {hasRecurringTransactions ? (
        <>
          {isMobile ? (
            // Mobile view: Cards
            <div className="space-y-4">
              {recurringTransactions.map((rt) => (
                <Card key={rt.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {rt.type === 'income' ? (
                          <ArrowUpCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <ArrowDownCircle className="h-5 w-5 text-red-500" />
                        )}
                        <div>
                          <p className="font-medium">{rt.description}</p>
                          {rt.category_name && (
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Tag className="h-3 w-3 mr-1" style={{ color: rt.category_color || undefined }} />
                              <span>{rt.category_name}</span>
                            </div>
                          )}
                          <p className="text-sm text-muted-foreground">
                            {frequencyLabels[rt.frequency]} starting {format(new Date(rt.start_date), 'PPP')}
                            {rt.end_date && ` until ${format(new Date(rt.end_date), 'PPP')}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <p className={`font-semibold ${rt.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                          ₹{rt.amount.toFixed(2)}
                        </p>
                        <MobileActionSheet title="Recurring Transaction Actions" description={`Actions for ${rt.description}`}>
                          <Button variant="ghost" onClick={() => handleEditRecurringTransaction(rt)}>Edit</Button>
                          <Button variant="destructive" onClick={() => handleDeleteRecurringTransaction(rt.id)}>Delete</Button>
                        </MobileActionSheet>
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
                    <TableHead>Category</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="w-[50px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recurringTransactions.map((rt) => (
                    <TableRow key={rt.id}>
                      <TableCell>
                        {rt.type === 'income' ? (
                          <ArrowUpCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <ArrowDownCircle className="h-5 w-5 text-red-500" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{rt.description}</TableCell>
                      <TableCell>
                        {rt.category_name ? (
                          <div className="flex items-center">
                            <Tag className="h-4 w-4 mr-2" style={{ color: rt.category_color || undefined }} />
                            <span>{rt.category_name}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="capitalize">{frequencyLabels[rt.frequency]}</TableCell>
                      <TableCell>{format(new Date(rt.start_date), 'PPP')}</TableCell>
                      <TableCell>{rt.end_date ? format(new Date(rt.end_date), 'PPP') : 'Never'}</TableCell>
                      <TableCell className={`text-right font-semibold ${rt.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        ₹{rt.amount.toFixed(2)}
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
                            <DropdownMenuItem onClick={() => handleEditRecurringTransaction(rt)}>Edit</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDeleteRecurringTransaction(rt.id)} className="text-destructive">
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
        </>
      ) : (
        <EmptyState
          icon={<Repeat size={64} />}
          title="No Recurring Transactions"
          description="Set up transactions that happen regularly to save time on manual entry."
          action={
            <div className="flex gap-2">
              <Button onClick={() => handleAddRecurringTransaction('income')} variant="primary">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Income
              </Button>
              <Button onClick={() => handleAddRecurringTransaction('expense')} variant="destructive">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Expense
              </Button>
            </div>
          }
        />
      )}

      <RecurringTransactionFormModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSuccess={refetch}
        editingRecurringTransaction={editingRecurringTransaction}
        initialType={initialTransactionType}
      />
    </div>
  );
};

export default RecurringTransactionsPage;