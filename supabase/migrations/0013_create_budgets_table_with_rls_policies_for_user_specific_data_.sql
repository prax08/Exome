-- Create budgets table
CREATE TABLE public.budgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  spent NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL, -- Optional: budget for a specific category
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (REQUIRED)
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

-- Create policies for each operation
CREATE POLICY "Users can only see their own budgets" ON public.budgets
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own budgets" ON public.budgets
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own budgets" ON public.budgets
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own budgets" ON public.budgets
FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Add indexes for performance optimization
CREATE INDEX IF NOT EXISTS budgets_user_id_idx ON public.budgets (user_id);
CREATE INDEX IF NOT EXISTS budgets_category_id_idx ON public.budgets (category_id);
CREATE INDEX IF NOT EXISTS budgets_date_range_idx ON public.budgets (start_date, end_date);