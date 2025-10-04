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
import { CategorySelect } from "@/components/CategorySelect";
import { ReceiptUpload } from "@/components/ReceiptUpload";
import { useOnlineStatus } from "@/hooks/use-online-status"; // Import useOnlineStatus
import { offlineStore } from "@/integrations/localforage"; // Import offlineStore

// Define transaction type for client-side
interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  description: string;
  date: string; // ISO date string
  category_id?: string | null;
  receipt_url?: string | null;
  vendor?: string | null;
  payment_method?: string | null; // Add payment_method
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
  category_id: z.string().optional().nullable(),
  receipt_url: z.string().optional().nullable(),
  vendor: z.string().max(100, { message: "Vendor name is too long." }).optional().nullable(),
  payment_method: z.string().optional().nullable(), // Add payment_method to schema
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

const paymentMethodOptions = [
  { value: "cash", label: "Cash" },
  { value: "credit_card", label: "Credit Card" },
  { value: "debit_card", label: "Debit Card" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "upi", label: "UPI" },
  { value: "other", label: "Other" },
];

const TransactionFormModal: React.FC<TransactionFormModalProps> = ({
  isOpen,
  onOpenChange,
  onSuccess,
  editingTransaction,
  initialType = 'expense',
}) => {
  const { user } = useSession();
  const isOnline = useOnlineStatus(); // Get online status

  const form = useForm<z.infer<typeof transactionFormSchema>>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      amount: 0,
      type: initialType,
      description: "",
      date: new Date(),
      category_id: null,
      receipt_url: null,
      vendor: null,
      payment_method: null, // Initialize payment_method
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
          category_id: editingTransaction.category_id || null,
          receipt_url: editingTransaction.receipt_url || null,
          vendor: editingTransaction.vendor || null,
          payment_method: editingTransaction.payment_method || null, // Load payment_method
        });
      } else {
        form.reset({
          amount: 0,
          type: initialType,
          description: "",
          date: new Date(),
          category_id: null,
          receipt_url: null,
          vendor: null,
          payment_method: null,
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
      user_id: user.id, // Include user_id for offline storage
      amount: values.amount,
      type: values.type,
      description: values.description,
      date: format(values.date, 'yyyy-MM-dd'),
      category_id: values.category_id || null,
      receipt_url: values.receipt_url || null,
      vendor: values.vendor || null,
      payment_method: values.payment_method || null, // Save payment_method
    };

    if (editingTransaction) {
      // Update existing transaction
      if (!isOnline) {
        toast.warning("You are offline. Cannot update existing transactions at this time.");
        return;
      }
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
      if (!isOnline) {
        // Save to localforage if offline
        try {
          const offlineTransactionKey = `offline-transaction-${Date.now()}`;
          await offlineStore.setItem(offlineTransactionKey, transactionData);
          toast.success("Transaction saved offline. It will sync when you are back online!");
          onOpenChange(false);
          onSuccess(); // Trigger refetch to potentially show a placeholder or update UI
        } catch (localforageError) {
          console.error("Error saving transaction offline:", localforageError);
          toast.error("Failed to save transaction offline.");
        }
        return;
      }

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

  const handleReceiptUploadSuccess = (newUrl: string) => {
    form.setValue("receipt_url", newUrl, { shouldDirty: true, shouldValidate: true });
  };

  const handleReceiptRemoveSuccess = () => {
    form.setValue("receipt_url", null, { shouldDirty: true, shouldValidate: true });
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
          <Button type="submit" form="transaction-form" disabled={form.formState.isSubmitting || (!isOnline && !!editingTransaction)}>
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
                  <Input placeholder="Groceries, Salary, Rent, etc." {...field} error={!!form.formState.errors.description} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="vendor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vendor (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Amazon, Starbucks, Employer" {...field} error={!!form.formState.errors.vendor} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="payment_method"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Method (Optional)</FormLabel>
                <Select
                  options={paymentMethodOptions}
                  placeholder="Select payment method"
                  onValueChange={field.onChange}
                  value={field.value || ""}
                  className={!!form.formState.errors.payment_method ? "border-destructive focus-visible:ring-destructive" : ""}
                />
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
          {user && editingTransaction && ( // Only show ReceiptUpload for existing transactions
            <FormItem>
              <FormLabel>Receipt</FormLabel>
              <FormControl>
                <ReceiptUpload
                  userId={user.id}
                  transactionId={editingTransaction.id}
                  currentReceiptUrl={form.watch("receipt_url")}
                  onUploadSuccess={handleReceiptUploadSuccess}
                  onRemoveSuccess={handleReceiptRemoveSuccess}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        </form>
      </Form>
    </Modal>
  );
};

export { TransactionFormModal };