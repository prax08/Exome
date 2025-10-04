ALTER TABLE public.transactions
ADD COLUMN category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL;

-- Update RLS policies for transactions table to include category_id
-- Existing policies already check user_id, so no change needed for basic RLS.
-- However, if you want to ensure users can only link to their own categories,
-- you might add a check in the INSERT/UPDATE policies, but for now,
-- the foreign key constraint handles existence, and category RLS handles ownership.