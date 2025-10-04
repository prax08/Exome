"use client";

import React, { useEffect } from "react";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/Button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/Form";
import { Input } from "@/components/Input";
import { Select } from "@/components/Select";
import { DatePicker } from "@/components/DatePicker";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";
import { format } from "date-fns";
import { CategorySelect } from "@/components/CategorySelect"; // Import CategorySelect

// Define transaction type for client-side
interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  description: string;
  date: string; // ISO date string
  category_id?: string | null; // Add category_id
  created_at: string;
}

// Form schema for adding/editing transactions
const transactionFormSchema = z.object({
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
  category_id: z.string().optional().nullable(), // Add category_id to schema
});

interface TransactionFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editingTransaction?: Transaction | null;
  initialType?: 'income' | 'expense';
}

const transactionTypeOptions = [
  { value: "income", label: "Income" },
  { value: "expense", label: "Expense" },
];

const TransactionFormModal: React.FC<TransactionFormModalProps> = ({
  isOpen,
  onOpenChange,
  onSuccess,
  editingTransaction,
  initialType = 'expense',
}) => {
  const { user } = useSession();

  const form = useForm<z.infer<typeof transactionFormSchema>>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      amount: 0,
      type: initialType,
      description: "",
      date: new Date(),
      category_id: null, // Initialize category_id
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (editingTransaction) {
        form.reset({
          amount: editingTransaction.amount,
          type: editingTransaction.type,
          description: editingTransaction.description,
          date: new Date(editingTransaction.date),
          category_id: editingTransaction.category_id || null, // Load category_id
        });
      } else {
        form.reset({
          amount: 0,
          type: initialType,
          description: "",
          date: new Date(),
          category_id: null,
        });
      }
    }
  }, [isOpen, editingTransaction, initialType, form]);

  const onSubmit = async (values: z.infer<typeof transactionFormSchema>) => {
    if (!user) {
      toast.error("You must be logged in to manage transactions.");
      return;
    }

    const transactionData = {
      amount: values.amount,
      type: values.type,
      description: values.description,
      date: format(values.date, 'yyyy-MM-dd'),
      category_id: values.category_id || null, // Ensure null if empty string
    };

    if (editingTransaction) {
      // Update existing transaction
      const { error } = await supabase
        .from('transactions')
        .update(transactionData)
        .eq('id', editingTransaction.id)
        .eq('user_id', user.id);

      if (error) {
        console.error("Error updating transaction:", error);
        toast.error(`Failed to update transaction: ${error.message}`);
      } else {
        toast.success("Transaction updated successfully!");
        onOpenChange(false);
        onSuccess();
      }
    } else {
      // Add new transaction
      const { error } = await supabase.from('transactions').insert({
        user_id: user.id,
        ...transactionData,
      });

      if (error) {
        console.error("Error adding transaction:", error);
        toast.error(`Failed to add transaction: ${error.message}`);
      } else {
        toast.success("Transaction added successfully!");
        onOpenChange(false);
        onSuccess();
      }
    }
  };

  return (
    <Modal
      title={editingTransaction ? "Edit Transaction" : "Add New Transaction"}
      description="Enter the details for your transaction."
      open={isOpen}
      onOpenChange={onOpenChange}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="transaction-form" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? (editingTransaction ? "Saving..." : "Adding...") : (editingTransaction ? "Save Changes" : "Add Transaction")}
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form id="transaction-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                  transactionType={form.watch('type')} // Filter categories based on selected transaction type
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
                  <Input placeholder="Groceries, Salary, Rent, etc." {...field} error={!!form.formState.errors.description} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date</FormLabel>
                <DatePicker
                  date={field.value}
                  onSelect={field.onChange}
                  className={!!form.formState.errors.date ? "border-destructive focus-visible:ring-destructive" : ""}
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

export { TransactionFormModal };