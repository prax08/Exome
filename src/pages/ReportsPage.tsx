"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import { EmptyState } from "@/components/EmptyState";
import { BarChart, FileText, TrendingUp, PieChart as PieChartIcon } from "lucide-react";
import { Button } from "@/components/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/Card";
import { DateRangePicker } from "@/components/DateRangePicker";
import { DateRange } from "react-day-picker";
import { Select } from "@/components/Select";
import { CategorySelect } from "@/components/CategorySelect";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";
import { Loading } from "@/components/Loading";
import { format, startOfMonth, endOfMonth, subMonths, eachMonthOfInterval, parseISO } from "date-fns";
import { MonthlyTrendChart } from "@/components/charts/MonthlyTrendChart";
import { CategoryDistributionChart } from "@/components/charts/CategoryDistributionChart";
import { ComparativeBarChart } from "@/components/charts/ComparativeBarChart"; // Import new chart
import { toast } from "sonner";

interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  description: string;
  date: string; // ISO date string
  category_id?: string | null;
  category_name?: string | null;
  category_color?: string | null;
  receipt_url?: string | null; // Added missing property
  vendor?: string | null; // Added missing property
  payment_method?: string | null; // Added missing property
}

interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color?: string | null;
}

type ReportType = 'monthly_trends' | 'category_distribution_expense' | 'category_distribution_income' | 'category_spending_comparison';

const reportTypeOptions = [
  { value: "monthly_trends", label: "Monthly Income/Expense Trends" },
  { value: "category_distribution_expense", label: "Expense Category Distribution" },
  { value: "category_distribution_income", label: "Income Category Distribution" },
  { value: "category_spending_comparison", label: "Category Spending Comparison" }, // New report type
];

const ReportsPage: React.FC = () => {
  const { user } = useSession();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(subMonths(new Date(), 5)), // Last 6 months by default
    to: endOfMonth(new Date()),
  });
  const [reportType, setReportType] = useState<ReportType>('monthly_trends');
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined);

  const fetchTransactionsForReports = async (range?: DateRange) => {
    if (!user) return [];

    let query = supabase
      .from('transactions')
      .select(`
        *,
        categories (
          name,
          color
        )
      `)
      .eq('user_id', user.id);

    if (range?.from) {
      query = query.gte('date', format(range.from, 'yyyy-MM-dd'));
    }
    if (range?.to) {
      query = query.lte('date', format(range.to, 'yyyy-MM-dd'));
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching transactions for reports:", error);
      throw new Error("Failed to fetch transactions for reports.");
    }

    const transactionsWithCategories = data.map((t: any) => ({
      ...t,
      category_name: t.categories?.name || null,
      category_color: t.categories?.color || null,
    })) as Transaction[];

    return transactionsWithCategories;
  };

  const { data: transactions, isLoading, error, refetch } = useQuery({
    queryKey: ['transactionsForReports', user?.id, dateRange],
    queryFn: () => fetchTransactionsForReports(dateRange),
    enabled: !!user,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, color, type')
        .eq('user_id', user.id);
      if (error) throw error;
      return data as Category[];
    },
    enabled: !!user,
  });

  const monthlyTrendData = useMemo(() => {
    if (!transactions || !dateRange?.from || !dateRange?.to) return [];

    const months = eachMonthOfInterval({ start: dateRange.from, end: dateRange.to });
    const dataMap = new Map<string, { income: number; expenses: number }>();

    months.forEach(month => {
      dataMap.set(format(month, 'yyyy-MM-01'), { income: 0, expenses: 0 });
    });

    transactions.forEach(transaction => {
      const monthKey = format(parseISO(transaction.date), 'yyyy-MM-01');
      if (dataMap.has(monthKey)) {
        const current = dataMap.get(monthKey)!;
        if (transaction.type === 'income') {
          current.income += transaction.amount;
        } else {
          current.expenses += transaction.amount;
        }
        dataMap.set(monthKey, current);
      }
    });

    return Array.from(dataMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([monthKey, values]) => ({
        month: monthKey,
        income: values.income,
        expenses: values.expenses,
      }));
  }, [transactions, dateRange]);

  const categoryDistributionData = useMemo(() => {
    if (!transactions || !categoriesData) return [];

    const filteredTransactions = transactions.filter(t => {
      const matchesCategory = categoryFilter ? t.category_id === categoryFilter : true;
      const matchesType = (reportType === 'category_distribution_expense' && t.type === 'expense') ||
                          (reportType === 'category_distribution_income' && t.type === 'income');
      return matchesCategory && matchesType;
    });

    const distributionMap = new Map<string, { value: number; color: string; name: string }>();

    filteredTransactions.forEach(transaction => {
      const category = categoriesData.find(c => c.id === transaction.category_id);
      const categoryName = category?.name || 'Uncategorized';
      const categoryColor = category?.color || '#CCCCCC'; // Default grey for uncategorized

      if (!distributionMap.has(categoryName)) {
        distributionMap.set(categoryName, { name: categoryName, value: 0, color: categoryColor });
      }
      const current = distributionMap.get(categoryName)!;
      current.value += transaction.amount;
      distributionMap.set(categoryName, current);
    });

    return Array.from(distributionMap.values()).sort((a, b) => b.value - a.value);
  }, [transactions, categoriesData, reportType, categoryFilter]);

  const categorySpendingComparisonData = useMemo(() => {
    if (!transactions || !categoriesData) return [];

    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    const categoryMap = new Map<string, number>();

    expenseTransactions.forEach(transaction => {
      const categoryName = categoriesData.find(c => c.id === transaction.category_id)?.name || 'Uncategorized';
      categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + transaction.amount);
    });

    return Array.from(categoryMap.entries())
      .sort(([, amountA], [, amountB]) => amountB - amountA)
      .map(([name, value]) => ({
        name,
        value1: value,
        label1: "Expenses",
        color1: "hsl(0 84.2% 60.2%)", // Red
      }));
  }, [transactions, categoriesData]);

  const handleExportCSV = () => {
    if (!transactions || transactions.length === 0) {
      toast.info("No data to export.");
      return;
    }

    const headers = ["Date", "Type", "Description", "Amount", "Category", "Vendor", "Payment Method", "Receipt URL"];
    const rows = transactions.map(t => [
      format(parseISO(t.date), 'yyyy-MM-dd'),
      t.type,
      t.description,
      t.amount.toFixed(2),
      t.category_name || 'Uncategorized',
      t.vendor || '',
      t.payment_method || '',
      t.receipt_url || '',
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(field => `"${field.toString().replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `transactions_report_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("CSV exported successfully!");
    } else {
      toast.error("Your browser does not support downloading files directly.");
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
        title="Error loading reports"
        description={error.message}
        action={<Button onClick={() => refetch()}>Try Again</Button>}
      />
    );
  }

  const hasDataForCharts = transactions && transactions.length > 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Financial Reports</h2>
        <Button onClick={handleExportCSV} variant="outline">
          <FileText className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report Filters</CardTitle>
          <CardDescription>Select your desired report type and date range.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            options={reportTypeOptions}
            placeholder="Select Report Type"
            onValueChange={(value) => {
              setReportType(value as ReportType);
              setCategoryFilter(undefined); // Reset category filter when report type changes
            }}
            value={reportType}
          />
          <DateRangePicker
            dateRange={dateRange}
            onSelect={setDateRange}
            className="w-full"
          />
          {(reportType === 'category_distribution_expense' || reportType === 'category_distribution_income') && (
            <CategorySelect
              transactionType={reportType === 'category_distribution_expense' ? 'expense' : 'income'}
              value={categoryFilter || ""}
              onValueChange={(value) => setCategoryFilter(value || undefined)}
              placeholder="Filter by specific category (optional)"
            />
          )}
        </CardContent>
      </Card>

      {hasDataForCharts ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {reportType === 'monthly_trends' && <TrendingUp className="h-5 w-5" />}
              {(reportType === 'category_distribution_expense' || reportType === 'category_distribution_income') && <PieChartIcon className="h-5 w-5" />}
              {reportType === 'category_spending_comparison' && <BarChart className="h-5 w-5" />}
              {reportTypeOptions.find(opt => opt.value === reportType)?.label}
            </CardTitle>
            <CardDescription>
              Data from {dateRange?.from ? format(dateRange.from, 'PPP') : 'start'} to {dateRange?.to ? format(dateRange.to, 'PPP') : 'end'}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {reportType === 'monthly_trends' && (
              <MonthlyTrendChart data={monthlyTrendData} />
            )}
            {(reportType === 'category_distribution_expense' || reportType === 'category_distribution_income') && (
              <CategoryDistributionChart data={categoryDistributionData} />
            )}
            {reportType === 'category_spending_comparison' && (
              <ComparativeBarChart
                data={categorySpendingComparisonData}
                dataKey1="value1"
                label1="Total Spent"
                color1="hsl(0 84.2% 60.2%)" // Red
              />
            )}
          </CardContent>
        </Card>
      ) : (
        <EmptyState
          icon={<BarChart size={64} />}
          title="No Data for Reports"
          description="Add some transactions within the selected date range to generate reports."
          action={<Button variant="primary">Add Transaction</Button>}
        />
      )}
    </div>
  );
};

export default ReportsPage;