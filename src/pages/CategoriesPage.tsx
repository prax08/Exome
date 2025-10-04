"use client";

import React, { useState } from "react";
import { PlusCircle, Tag, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/Button";
import { Card, CardContent } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { Loading } from "@/components/Loading";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";
import { CategoryFormModal } from "@/components/CategoryFormModal";
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
import * as LucideIcons from "lucide-react"; // Import all Lucide icons

// Define category type for client-side
interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color?: string | null;
  icon?: string | null; // Add icon property
  created_at: string;
}

const CategoriesPage: React.FC = () => {
  const { user } = useSession();
  const isMobile = useIsMobile();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const fetchCategories = async () => {
    if (!user) return [];

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id)
      .order('name', { ascending: true });

    if (error) {
      console.error("Error fetching categories:", error);
      throw new Error("Failed to fetch categories.");
    }
    return data as Category[];
  };

  const { data: categories, isLoading, error, refetch } = useQuery({
    queryKey: ['categories', user?.id],
    queryFn: fetchCategories,
    enabled: !!user,
  });

  const handleAddCategory = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!user) {
      toast.error("You must be logged in to delete categories.");
      return;
    }

    if (window.confirm("Are you sure you want to delete this category? This action cannot be undone and will remove it from all associated transactions.")) {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId)
        .eq('user_id', user.id);

      if (error) {
        console.error("Error deleting category:", error);
        toast.error(`Failed to delete category: ${error.message}`);
      } else {
        toast.success("Category deleted successfully!");
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
        title="Error loading categories"
        description={error.message}
        action={<Button onClick={() => refetch()}>Try Again</Button>}
      />
    );
  }

  const hasCategories = categories && categories.length > 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Manage Categories</h2>
        <Button onClick={handleAddCategory} variant="primary">
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Category
        </Button>
      </div>

      {hasCategories ? (
        <>
          {isMobile ? (
            // Mobile view: Cards
            <div className="space-y-4">
              {categories.map((category) => {
                const IconComponent = category.icon ? (LucideIcons as any)[category.icon] : LucideIcons.Tag;
                return (
                  <Card key={category.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <IconComponent className="h-5 w-5" style={{ color: category.color || undefined }} />
                          <div>
                            <p className="font-medium">{category.name}</p>
                            <p className="text-sm text-muted-foreground capitalize">{category.type}</p>
                          </div>
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
                            <DropdownMenuItem onClick={() => handleEditCategory(category)}>Edit</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDeleteCategory(category.id)} className="text-destructive">
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            // Desktop view: Table
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Icon</TableHead>
                    <TableHead className="w-[50px]">Color</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => {
                    const IconComponent = category.icon ? (LucideIcons as any)[category.icon] : LucideIcons.Tag;
                    return (
                      <TableRow key={category.id}>
                        <TableCell>
                          <IconComponent className="h-5 w-5" style={{ color: category.color || undefined }} />
                        </TableCell>
                        <TableCell>
                          <div className="h-5 w-5 rounded-full border" style={{ backgroundColor: category.color || undefined }} />
                        </TableCell>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell className="capitalize">{category.type}</TableCell>
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
                              <DropdownMenuItem onClick={() => handleEditCategory(category)}>Edit</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleDeleteCategory(category.id)} className="text-destructive">
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      ) : (
        <EmptyState
          icon={<Tag size={64} />}
          title="No Categories"
          description="Organize your finances by creating categories for income and expenses."
          action={<Button onClick={handleAddCategory} variant="primary">Add New Category</Button>}
        />
      )}

      <CategoryFormModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSuccess={refetch}
        editingCategory={editingCategory}
      />
    </div>
  );
};

export default CategoriesPage;