"use client";

import React, { useState, useMemo } from "react";
import { PlusCircle, Wallet, MoreHorizontal, Tag, TrendingUp } from "lucide-react";
import { Button } from "@/components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { Loading } from "@/components/Loading";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";
import { format, isWithinInterval, parseISO } from "date-fns";
import { BudgetFormModal } from "@/components/BudgetFormModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProgressBar } from "@/components/ProgressBar"; // Import the new ProgressBar
import { cn } from "@/lib/utils";
// import { useIsMobile } from "@/hooks/use-mobile"; // Removed unused import
import { toast } from "sonner";

// Define budget type for client-side
interface Budget {
  id: string;
  name: string;
  amount: number;
  spent: number;
  start_date: string; // ISO date string
  end_date: string; // ISO date string
  category_id?: string | null;
  category_name?: string | null;
  category_color?: string | null;
  created_at: string;
}

const BudgetsPage: React.FC = () => {
  const { user } = useSession();
  // const isMobile = useIsMobile(); // Removed unused variable

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  const fetchBudgets = async () => {
    if (!user) return [];

    const { data: budgetsData, error: budgetsError } = await supabase
      .from('budgets')
      .select(`
        *,
        categories (
          name,
          color
        )
      `)
      .eq('user_id', user.id)
      .order('end_date', { ascending: true });

    if (budgetsError) {
      console.error("Error fetching budgets:", budgetsError);
      throw new Error("Failed to fetch budgets.");
    }

    const budgetsWithCategories = budgetsData.map((budget: any) => ({
      ...budget,
      category_name: budget.categories?.name || null,
      category_color: budget.categories?.color || null,
    })) as Budget[];

    // Fetch all transactions for the user to calculate 'spent' amounts
    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select('amount, type, date, category_id')
      .eq('user_id', user.id);

    if (transactionsError) {
      console.error("Error fetching transactions for budgets:", transactionsError);
      throw new Error("Failed to fetch transactions for budgets.");
    }

    // Calculate spent amount for each budget
    const budgetsWithSpent = budgetsWithCategories.map(budget => {
      let spentAmount = 0;
      const budgetStartDate = parseISO(budget.start_date);
      const budgetEndDate = parseISO(budget.end_date);

      transactions.forEach(transaction => {
        const transactionDate = parseISO(transaction.date);
        const isExpense = transaction.type === 'expense';
        const isWithinBudgetPeriod = isWithinInterval(transactionDate, { start: budgetStartDate, end: budgetEndDate });
        const matchesCategory = budget.category_id ? transaction.category_id === budget.category_id : true;

        if (isExpense && isWithinBudgetPeriod && matchesCategory) {
          spentAmount += transaction.amount;
        }
      });

      return { ...budget, spent: spentAmount };
    });

    return budgetsWithSpent;
  };

  const { data: budgets, isLoading, error, refetch } = useQuery({
    queryKey: ['budgets', user?.id],
    queryFn: fetchBudgets,
    enabled: !!user,
  });

  const handleAddBudget = () => {
    setEditingBudget(null);
    setIsModalOpen(true);
  };

  const handleEditBudget = (budget: Budget) => {
    setEditingBudget(budget);
    setIsModalOpen(true);
  };

  const handleDeleteBudget = async (budgetId: string) => {
    if (!user) {
      toast.error("You must be logged in to delete budgets.");
      return;
    }

    if (window.confirm("Are you sure you want to delete this budget? This action cannot be undone.")) {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', budgetId)
        .eq('user_id', user.id);

      if (error) {
        console.error("Error deleting budget:", error);
        toast.error(`Failed to delete budget: ${error.message}`);
      } else {
        toast.success("Budget deleted successfully!");
        refetch();
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-160px)]">
        <Loading count={3} className="w-full max-w-md" />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        title="Error loading budgets"
        description={error.message}
        action={<Button onClick={() => refetch()}>Try Again</Button>}
      />
    );
  }

  const hasBudgets = budgets && budgets.length > 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Your Budgets</h2>
        <Button onClick={handleAddBudget} variant="primary">
          <PlusCircle className="mr-2 h-4 w-4" /> Create New Budget
        </Button>
      </div>

      {hasBudgets ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((budget) => {
            const progress = (budget.spent / budget.amount) * 100;
            const isOverBudget = budget.spent > budget.amount;
            const remaining = budget.amount - budget.spent;

            return (
              <Card key={budget.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center space-x-2">
                    <Wallet className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-lg font-medium">{budget.name}</CardTitle>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleEditBudget(budget)}>Edit</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDeleteBudget(budget.id)} className="text-destructive">
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent className="space-y-4">
                  {budget.category_name && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Tag className="h-4 w-4 mr-2" style={{ color: budget.category_color || undefined }} />
                      <span>{budget.category_name}</span>
                    </div>
                  )}
                  <div className="text-sm text-muted-foreground">
                    {format(parseISO(budget.start_date), 'MMM dd, yyyy')} - {format(parseISO(budget.end_date), 'MMM dd, yyyy')}
                  </div>
                  <div>
                    <div className="flex justify-between text-sm font-medium">
                      <span>Spent: ₹{budget.spent.toFixed(2)}</span>
                      <span>Budget: ₹{budget.amount.toFixed(2)}</span>
                    </div>
                    <ProgressBar // Use ProgressBar here
                      value={progress}
                      className="h-2 mt-2"
                      indicatorClassName={cn({
                        "bg-red-500": isOverBudget,
                        "bg-green-500": progress < 75 && !isOverBudget,
                        "bg-yellow-500": progress >= 75 && !isOverBudget,
                      })}
                    />
                    <p className={cn("text-sm mt-2", isOverBudget ? "text-red-500" : "text-muted-foreground")}>
                      {isOverBudget ? `Over by ₹${Math.abs(remaining).toFixed(2)}` : `₹${remaining.toFixed(2)} remaining`}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<TrendingUp size={64} />}
          title="No Budgets Set"
          description="Create a budget to help manage your spending and achieve your financial goals."
          action={<Button onClick={handleAddBudget} variant="primary">Create New Budget</Button>}
        />
      )}

      <BudgetFormModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSuccess={refetch}
        editingBudget={editingBudget}
      />
    </div>
  );
};

export default BudgetsPage;