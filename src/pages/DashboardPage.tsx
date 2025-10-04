"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/Card";
import { Button } from "@/components/Button";
import { PlusCircle, ArrowUpCircle, ArrowDownCircle, Wallet, CalendarDays } from "lucide-react";
import { ResponsiveGrid } from "@/components/ResponsiveGrid";
import { EmptyState } from "@/components/EmptyState";
import { Loading } from "@/components/Loading";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { Modal } from "@/components/Modal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/Form";
import { Input } from "@/components/Input";
import { Select } from "@/components/Select";
import { DatePicker } from "@/components/DatePicker";
import { toast } from "sonner";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "@/components/DateRangePicker"; // Import DateRangePicker

// Define transaction type for client-side
interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  description: string;
  date: string; // ISO date string
  created_at: string;
}

// Form schema for adding transactions
const addTransactionSchema = z.object({
  amount: z.preprocess(
    (val) => Number(val),
    z.number().positive({ message: "Amount must be positive." })
  ),
  type: z.enum(['income', 'expense'], {
    required_error: "Transaction type is required.",
  }),
  description: z.string().min(1, { message: "Description is required." }).max(255, { message: "Description is too long." }),
  date: z.date({
    required_error: "A transaction date is required.",
  }),
});

const DashboardPage: React.FC = () => {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [isAddTransactionModalOpen, setIsAddTransactionModalOpen] = useState(false);
  const [selectedTransactionType, setSelectedTransactionType] = useState<'income' | 'expense'>('expense');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  const transactionForm = useForm<z.infer<typeof addTransactionSchema>>({
    resolver: zodResolver(addTransactionSchema),
    defaultValues: {
      amount: 0,
      type: 'expense',
      description: "",
      date: new Date(),
    },
  });

  const fetchDashboardData = async (range?: DateRange) => {
    if (!user) return { income: 0, expenses: 0, balance: 0, recentTransactions: [] };

    let query = supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id);

    if (range?.from) {
      query = query.gte('date', format(range.from, 'yyyy-MM-dd'));
    }
    if (range?.to) {
      query = query.lte('date', format(range.to, 'yyyy-MM-dd'));
    }

    query = query.order('date', { ascending: false });

    const { data: transactions, error } = await query;

    if (error) {
      console.error("Error fetching dashboard data:", error);
      throw new Error("Failed to fetch dashboard data.");
    }

    let totalIncome = 0;
    let totalExpenses = 0;

    transactions.forEach((t: Transaction) => {
      if (t.type === 'income') {
        totalIncome += t.amount;
      } else {
        totalExpenses += t.amount;
      }
    });

    const balance = totalIncome - totalExpenses;

    // For recent transactions, we'll take the first 5 from the filtered list
    const recentTransactions = transactions.slice(0, 5);

    return {
      income: totalIncome,
      expenses: totalExpenses,
      balance: balance,
      recentTransactions: recentTransactions,
    };
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboardData', user?.id, dateRange], // Add dateRange to queryKey
    queryFn: () => fetchDashboardData(dateRange),
    enabled: !!user, // Only run query if user is available
  });

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('dashboard_transactions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Realtime transaction change received:', payload);
          queryClient.invalidateQueries({ queryKey: ['dashboardData', user.id, dateRange] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient, dateRange]);

  const onSubmitAddTransaction = async (values: z.infer<typeof addTransactionSchema>) => {
    if (!user) {
      toast.error("You must be logged in to add a transaction.");
      return;
    }

    const { error } = await supabase.from('transactions').insert({
      user_id: user.id,
      amount: values.amount,
      type: values.type,
      description: values.description,
      date: format(values.date, 'yyyy-MM-dd'),
    });

    if (error) {
      console.error("Error adding transaction:", error);
      toast.error(`Failed to add transaction: ${error.message}`);
    } else {
      toast.success("Transaction added successfully!");
      setIsAddTransactionModalOpen(false);
      transactionForm.reset({
        amount: 0,
        type: selectedTransactionType, // Reset to the last selected type
        description: "",
        date: new Date(),
      });
      // Real-time subscription will handle refetching
    }
  };

  const openAddTransactionModal = (type: 'income' | 'expense') => {
    setSelectedTransactionType(type);
    transactionForm.reset({
      amount: 0,
      type: type,
      description: "",
      date: new Date(),
    });
    setIsAddTransactionModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-160px)]">
        <Loading count={5} className="w-64" />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        title="Error loading dashboard"
        description={error.message}
        action={<Button onClick={() => refetch()}>Try Again</Button>}
      />
    );
  }

  const transactionTypeOptions = [
    { value: "income", label: "Income" },
    { value: "expense", label: "Expense" },
  ];

  return (
    <div className="space-y-8">
      {/* Financial Summary Cards */}
      <ResponsiveGrid cols={{ default: 1, md: 3 }} gap={6}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{data?.income.toFixed(2) || "0.00"}</div>
            <p className="text-xs text-muted-foreground">
              Total earnings
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{data?.expenses.toFixed(2) || "0.00"}</div>
            <p className="text-xs text-muted-foreground">
              Total spending
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
            <Wallet className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{data?.balance.toFixed(2) || "0.00"}</div>
            <p className="text-xs text-muted-foreground">
              Net funds available
            </p>
          </CardContent>
        </Card>
      </ResponsiveGrid>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Add new income or expense.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button onClick={() => openAddTransactionModal('income')} variant="primary">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Income
          </Button>
          <Button onClick={() => openAddTransactionModal('expense')} variant="destructive">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Expense
          </Button>
          <Button onClick={() => refetch()} variant="outline">
            Refresh Data
          </Button>
        </CardContent>
      </Card>

      {/* Period Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Filter by Period</CardTitle>
          <CardDescription>Select a date range to view transactions.</CardDescription>
        </CardHeader>
        <CardContent>
          <DateRangePicker dateRange={dateRange} onSelect={setDateRange} />
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setDateRange({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) })}>
              This Month
            </Button>
            <Button variant="outline" onClick={() => setDateRange({ from: startOfMonth(subMonths(new Date(), 1)), to: endOfMonth(subMonths(new Date(), 1)) })}>
              Last Month
            </Button>
            <Button variant="outline" onClick={() => setDateRange(undefined)}>
              All Time
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest financial activities.</CardDescription>
        </CardHeader>
        <CardContent>
          {data?.recentTransactions && data.recentTransactions.length > 0 ? (
            <div className="space-y-4">
              {data.recentTransactions.map((transaction: Transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-center space-x-3">
                    {transaction.type === 'income' ? (
                      <ArrowUpCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <ArrowDownCircle className="h-5 w-5 text-red-500" />
                    )}
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">{format(new Date(transaction.date), 'PPP')}</p>
                    </div>
                  </div>
                  <p className={`font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    ₹{transaction.amount.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<CalendarDays size={48} />}
              title="No Recent Transactions"
              description="Add your first income or expense to see it here."
              action={<Button onClick={() => openAddTransactionModal('expense')} variant="primary">Add Transaction</Button>}
            />
          )}
        </CardContent>
      </Card>

      {/* Add Transaction Modal */}
      <Modal
        title={selectedTransactionType === 'income' ? "Add New Income" : "Add New Expense"}
        description="Enter the details for your transaction."
        open={isAddTransactionModalOpen}
        onOpenChange={setIsAddTransactionModalOpen}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsAddTransactionModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="add-transaction-form" disabled={transactionForm.formState.isSubmitting}>
              {transactionForm.formState.isSubmitting ? "Saving..." : "Add Transaction"}
            </Button>
          </div>
        }
      >
        <Form {...transactionForm}>
          <form id="add-transaction-form" onSubmit={transactionForm.handleSubmit(onSubmitAddTransaction)} className="space-y-4">
            <FormField
              control={transactionForm.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select
                    options={transactionTypeOptions}
                    placeholder="Select type"
                    onValueChange={field.onChange}
                    value={field.value}
                    className={!!transactionForm.formState.errors.type ? "border-destructive focus-visible:ring-destructive" : ""}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={transactionForm.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      error={!!transactionForm.formState.errors.amount}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={transactionForm.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Groceries, Salary, Rent, etc." {...field} error={!!transactionForm.formState.errors.description} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={transactionForm.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <DatePicker
                    date={field.value}
                    onSelect={field.onChange}
                    className={!!transactionForm.formState.errors.date ? "border-destructive focus-visible:ring-destructive" : ""}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </Modal>
    </div>
  );
};

export default DashboardPage;