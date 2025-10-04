"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";
import { Select } from "@/components/Select";
import { Loading } from "@/components/Loading";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color?: string;
}

interface CategorySelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  transactionType?: 'income' | 'expense' | 'all'; // Filter categories by transaction type
  className?: string;
  disabled?: boolean;
}

const CategorySelect: React.FC<CategorySelectProps> = ({
  value,
  onValueChange,
  placeholder = "Select a category",
  transactionType = 'all',
  className,
  disabled,
}) => {
  const { user } = useSession();

  const fetchCategories = async () => {
    if (!user) return [];

    let query = supabase
      .from('categories')
      .select('id, name, type, color')
      .eq('user_id', user.id)
      .order('name', { ascending: true });

    if (transactionType !== 'all') {
      query = query.eq('type', transactionType);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories.");
      throw new Error("Failed to fetch categories.");
    }
    return data as Category[];
  };

  const { data: categories, isLoading, error } = useQuery({
    queryKey: ['categories', user?.id, transactionType],
    queryFn: fetchCategories,
    enabled: !!user,
  });

  if (isLoading) {
    return <Loading count={1} className="h-10 w-full" />;
  }

  if (error) {
    return (
      <Select
        options={[{ value: "", label: "Error loading categories", disabled: true }]}
        placeholder="Error loading categories"
        className={className}
        disabled={true}
      />
    );
  }

  const options = categories?.map((category) => ({
    value: category.id,
    label: category.name,
  })) || [];

  return (
    <Select
      options={options}
      placeholder={placeholder}
      value={value}
      onValueChange={onValueChange}
      className={className}
      disabled={disabled || options.length === 0}
    />
  );
};

export { CategorySelect };