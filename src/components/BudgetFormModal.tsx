"use client";

import React, { useEffect } from "react";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/Button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/Form";
import { Input } from "@/components/Input";
// import { Select } from "@/components/Select"; // Removed unused import
import { DatePicker } from "@/components/DatePicker";
import { CategorySelect } from "@/components/CategorySelect";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";
import { format } from "date-fns";

// Define budget type for client-side
interface Budget {
  id: string;
  name: string;
  amount: number;
  spent: number;
  start_date: string; // ISO date string
  end_date: string; // ISO date string
  category_id?: string | null;
  created_at: string;
}

// Form schema for adding/editing budgets
const budgetFormSchema = z.object({
  name: z.string().min(1, { message: "Budget name is required." }).max(100, { message: "Budget name is too long." }),
  amount: z.preprocess(
    (val) => Number(val),
    z.number().positive({ message: "Amount must be positive." })
  ),
  start_date: z.date({
    required_error: "A start date is required.",
  }),
  end_date: z.date({
    required_error: "An end date is required.",
  }),
  category_id: z.string().optional().nullable(),
}).refine((data) => data.end_date >= data.start_date, {
  message: "End date cannot be before start date.",
  path: ["end_date"],
});

interface BudgetFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editingBudget?: Budget | null;
}

const BudgetFormModal: React.FC<BudgetFormModalProps> = ({
  isOpen,
  onOpenChange,
  onSuccess,
  editingBudget,
}) => {
  const { user } = useSession();

  const form = useForm<z.infer<typeof budgetFormSchema>>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: {
      name: "",
      amount: 0,
      start_date: new Date(),
      end_date: new Date(),
      category_id: null,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (editingBudget) {
        form.reset({
          name: editingBudget.name,
          amount: editingBudget.amount,
          start_date: new Date(editingBudget.start_date),
          end_date: new Date(editingBudget.end_date),
          category_id: editingBudget.category_id || null,
        });
      } else {
        form.reset({
          name: "",
          amount: 0,
          start_date: new Date(),
          end_date: new Date(),
          category_id: null,
        });
      }
    }
  }, [isOpen, editingBudget, form]);

  const onSubmit = async (values: z.infer<typeof budgetFormSchema>) => {
    if (!user) {
      toast.error("You must be logged in to manage budgets.");
      return;
    }

    const budgetData = {
      name: values.name,
      amount: values.amount,
      start_date: format(values.start_date, 'yyyy-MM-dd'),
      end_date: format(values.end_date, 'yyyy-MM-dd'),
      category_id: values.category_id || null,
    };

    if (editingBudget) {
      // Update existing budget
      const { error } = await supabase
        .from('budgets')
        .update(budgetData)
        .eq('id', editingBudget.id)
        .eq('user_id', user.id);

      if (error) {
        console.error("Error updating budget:", error);
        toast.error(`Failed to update budget: ${error.message}`);
      } else {
        toast.success("Budget updated successfully!");
        onOpenChange(false);
        onSuccess();
      }
    } else {
      // Add new budget
      const { error } = await supabase.from('budgets').insert({
        user_id: user.id,
        ...budgetData,
      });

      if (error) {
        console.error("Error adding budget:", error);
        toast.error(`Failed to add budget: ${error.message}`);
      } else {
        toast.success("Budget added successfully!");
        onOpenChange(false);
        onSuccess();
      }
    }
  };

  return (
    <Modal
      title={editingBudget ? "Edit Budget" : "Create New Budget"}
      description="Set up a budget to track your spending."
      open={isOpen}
      onOpenChange={onOpenChange}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="budget-form" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? (editingBudget ? "Saving..." : "Creating...") : (editingBudget ? "Save Changes" : "Create Budget")}
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form id="budget-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Budget Name</FormLabel>
                <FormControl>
                  <Input placeholder="Monthly Groceries" {...field} error={!!form.formState.errors.name} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Budget Amount</FormLabel>
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
            name="category_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category (Optional)</FormLabel>
                <CategorySelect
                  transactionType="expense" // Budgets are typically for expenses
                  value={field.value || ""}
                  onValueChange={field.onChange}
                  placeholder="Select a category"
                  className={!!form.formState.errors.category_id ? "border-destructive focus-visible:ring-destructive" : ""}
                />
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
            name="end_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>End Date</FormLabel>
                <DatePicker
                  date={field.value}
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

export { BudgetFormModal };