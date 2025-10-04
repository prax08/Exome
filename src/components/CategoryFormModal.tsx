"use client";

import React, { useEffect, useState } from "react";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/Button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/Form";
import { Input } from "@/components/Input";
import { Select } from "@/components/Select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";
import { HexColorPicker } from "react-colorful";
import { IconPicker } from "@/components/IconPicker";
import * as LucideIcons from "lucide-react";

// Define category type for client-side
interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color?: string | null;
  icon?: string | null; // Add icon property
  created_at: string;
}

// Form schema for adding/editing categories
const categoryFormSchema = z.object({
  name: z.string().min(1, { message: "Category name is required." }).max(100, { message: "Category name is too long." }),
  type: z.enum(['income', 'expense'], {
    required_error: "Category type is required.",
  }),
  color: z.string().optional().nullable(),
  icon: z.string().optional().nullable(), // Add icon to schema
});

interface CategoryFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editingCategory?: Category | null;
}

const categoryTypeOptions = [
  { value: "income", label: "Income" },
  { value: "expense", label: "Expense" },
];

const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  isOpen,
  onOpenChange,
  onSuccess,
  editingCategory,
}) => {
  const { user } = useSession();
  const [displayColorPicker, setDisplayColorPicker] = useState(false);

  const form = useForm<z.infer<typeof categoryFormSchema>>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      type: "expense",
      color: "#60A5FA", // Default blue color
      icon: "Tag", // Default icon
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (editingCategory) {
        form.reset({
          name: editingCategory.name,
          type: editingCategory.type,
          color: editingCategory.color || "#60A5FA",
          icon: editingCategory.icon || "Tag", // Load existing icon or default
        });
      } else {
        form.reset({
          amount: 0, // This line was incorrect, should not be here for category form
          name: "",
          type: "expense",
          color: "#60A5FA",
          icon: "Tag", // Default icon for new categories
        });
      }
    }
  }, [isOpen, editingCategory, form]);

  const onSubmit = async (values: z.infer<typeof categoryFormSchema>) => {
    if (!user) {
      toast.error("You must be logged in to manage categories.");
      return;
    }

    const categoryData = {
      name: values.name,
      type: values.type,
      color: values.color || null,
      icon: values.icon || null, // Save the selected icon
    };

    if (editingCategory) {
      // Update existing category
      const { error } = await supabase
        .from('categories')
        .update(categoryData)
        .eq('id', editingCategory.id)
        .eq('user_id', user.id);

      if (error) {
        console.error("Error updating category:", error);
        toast.error(`Failed to update category: ${error.message}`);
      } else {
        toast.success("Category updated successfully!");
        onOpenChange(false);
        onSuccess();
      }
    } else {
      // Add new category
      const { error } = await supabase.from('categories').insert({
        user_id: user.id,
        ...categoryData,
      });

      if (error) {
        console.error("Error adding category:", error);
        toast.error(`Failed to add category: ${error.message}`);
      } else {
        toast.success("Category added successfully!");
        onOpenChange(false);
        onSuccess();
      }
    }
  };

  const CurrentIcon = form.watch("icon") ? (LucideIcons as any)[form.watch("icon")!] : LucideIcons.Tag;

  return (
    <Modal
      title={editingCategory ? "Edit Category" : "Add New Category"}
      description="Define a category for your transactions."
      open={isOpen}
      onOpenChange={onOpenChange}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="category-form" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? (editingCategory ? "Saving..." : "Adding...") : (editingCategory ? "Save Changes" : "Add Category")}
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form id="category-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category Name</FormLabel>
                <FormControl>
                  <Input placeholder="Groceries, Salary, Rent" {...field} error={!!form.formState.errors.name} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select
                  options={categoryTypeOptions}
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
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color (Optional)</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-full border cursor-pointer"
                      style={{ backgroundColor: field.value || "#60A5FA" }}
                      onClick={() => setDisplayColorPicker(!displayColorPicker)}
                    />
                    <Input
                      placeholder="#60A5FA"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value)}
                      error={!!form.formState.errors.color}
                    />
                  </div>
                </FormControl>
                {displayColorPicker && (
                  <div className="absolute z-10 mt-2">
                    <HexColorPicker color={field.value || "#60A5FA"} onChange={field.onChange} />
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="icon"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Icon (Optional)</FormLabel>
                <FormControl>
                  <IconPicker
                    currentIcon={field.value || "Tag"}
                    onSelectIcon={field.onChange}
                  >
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <CurrentIcon className="mr-2 h-4 w-4" />
                      {field.value || "Select an icon"}
                    </Button>
                  </IconPicker>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </Modal>
  );
};

export { CategoryFormModal };