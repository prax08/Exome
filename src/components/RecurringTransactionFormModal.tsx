"use client";

import React, { useEffect } from "react";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/Button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/Form";
import { Input } from "@/components/Input";
import { Select } from "@/components/Select";
import { DatePicker } from "@/components/DatePicker";
import { CategorySelect } from "@/components/CategorySelect";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";
import { format } from "date-fns";

// Define recurring transaction type for client-side
interface RecurringTransaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  description: string;
  category_id?: string | null;
  start_date: string; // ISO date string
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  end_date?: string | null; // ISO date string, optional
  created_at: string;
}

// Form schema for adding/editing recurring transactions
const recurringTransactionFormSchema = z.object({
  amount: z.preprocess(
    (val) => Number(val),
    z.number().positive({ message: "Amount must be positive." })
  ),
  type: z.enum(['income', 'expense'], {
    required_error: "Transaction type is required.",
  }),
  description: z.string().min(1, { message: "Description is required." }).max(255, { message: "Description is too long." }),
  category_id: z.string().optional().nullable(),
  start_date: z.date({
    required_error: "A start date is required.",
  }),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly'], {
    required_error: "Frequency is required.",
  }),
  end_date: z.date().optional().nullable(),
});

interface RecurringTransactionFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editingRecurringTransaction?: RecurringTransaction | null;
  initialType?: 'income' | 'expense';
}

const transactionTypeOptions = [
  { value: "income", label: "Income" },
  { value: "expense", label: "Expense" },
];

const frequencyOptions = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

const RecurringTransactionFormModal: React.FC<RecurringTransactionFormModalProps> = ({
  isOpen,
  onOpenChange,
  onSuccess,
  editingRecurringTransaction,
  initialType = 'expense',
}) => {
  const { user } = useSession();

  const form = useForm<z.infer<typeof recurringTransactionFormSchema>>({
    resolver: zodResolver(recurringTransactionFormSchema),
    defaultValues: {
      amount: 0,
      type: initialType,
      description: "",
      category_id: null,
      start_date: new Date(),
      frequency: "monthly",
      end_date: null,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (editingRecurringTransaction) {
        form.reset({
          amount: editingRecurringTransaction.amount,
          type: editingRecurringTransaction.type,
          description: editingRecurringTransaction.description,
          category_id: editingRecurringTransaction.category_id || null,
          start_date: new Date(editingRecurringTransaction.start_date),
          frequency: editingRecurringTransaction.frequency,
          end_date: editingRecurringTransaction.end_date ? new Date(editingRecurringTransaction.end_date) : null,
        });
      } else {
        form.reset({
          amount: 0,
          type: initialType,
          description: "",
          category_id: null,
          start_date: new Date(),
          frequency: "monthly",
          end_date: null,
        });
      }
    }
  }, [isOpen, editingRecurringTransaction, initialType, form]);

  const onSubmit = async (values: z.infer<typeof recurringTransactionFormSchema>) => {
    if (!user) {
      toast.error("You must be logged in to manage recurring transactions.");
      return;
    }

    const recurringTransactionData = {
      amount: values.amount,
      type: values.type,
      description: values.description,
      category_id: values.category_id || null,
      start_date: format(values.start_date, 'yyyy-MM-dd'),
      frequency: values.frequency,
      end_date: values.end_date ? format(values.end_date, 'yyyy-MM-dd') : null,
    };

    if (editingRecurringTransaction) {
      // Update existing recurring transaction
      const { error } = await supabase
        .from('recurring_transactions')
        .update(recurringTransactionData)
        .eq('id', editingRecurringTransaction.id)
        .eq('user_id', user.id);

      if (error) {
        console.error("Error updating recurring transaction:", error);
        toast.error(`Failed to update recurring transaction: ${error.message}`);
      } else {
        toast.success("Recurring transaction updated successfully!");
        onOpenChange(false);
        onSuccess();
      }
    } else {
      // Add new recurring transaction
      const { error } = await supabase.from('recurring_transactions').insert({
        user_id: user.id,
        ...recurringTransactionData,
      });

      if (error) {
        console.error("Error adding recurring transaction:", error);
        toast.error(`Failed to add recurring transaction: ${error.message}`);
      } else {
        toast.success("Recurring transaction added successfully!");
        onOpenChange(false);
        onSuccess();
      }
    }
  };

  return (
    <Modal
      title={editingRecurringTransaction ? "Edit Recurring Transaction" : "Add New Recurring Transaction"}
      description="Set up a transaction that occurs regularly."
      open={isOpen}
      onOpenChange={onOpenChange}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="recurring-transaction-form" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? (editingRecurringTransaction ? "Saving..." : "Adding...") : (editingRecurringTransaction ? "Save Changes" : "Add Recurring Transaction")}
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form id="recurring-transaction-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select
                  options={transactionTypeOptions}
                  placeholder="Select type"
                  onValueChange={field.onChange}
                  value={field.value}
                  className={!!form.formState.errors.type ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="category_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <CategorySelect
                  transactionType={form.watch('type')}
                  value={field.value || ""}
                  onValueChange={field.onChange}
                  placeholder="Select a category (optional)"
                  className={!!form.formState.errors.category_id ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
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
                    error={!!form.formState.errors.amount}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input placeholder="Rent, Salary, Subscription, etc." {...field} error={!!form.formState.errors.description} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Start Date</FormLabel>
                <DatePicker
                  date={field.value}
                  onSelect={field.onChange}
                  className={!!form.formState.errors.start_date ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="frequency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Frequency</FormLabel>
                <Select
                  options={frequencyOptions}
                  placeholder="Select frequency"
                  onValueChange={field.onChange}
                  value={field.value}
                  className={!!form.formState.errors.frequency ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="end_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>End Date (Optional)</FormLabel>
                <DatePicker
                  date={field.value || undefined}
                  onSelect={field.onChange}
                  className={!!form.formState.errors.end_date ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </Modal>
  );
};

export { RecurringTransactionFormModal };