-- Create audit_logs table
CREATE TABLE public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name TEXT NOT NULL,
  record_id UUID,
  operation_type TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
  old_data JSONB,
  new_data JSONB,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for audit_logs (only admins should typically view, but for now, no policies needed for user interaction)
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create a function to log changes to the transactions table
CREATE OR REPLACE FUNCTION public.log_transaction_changes()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.audit_logs (table_name, record_id, operation_type, new_data, changed_by)
    VALUES ('transactions', NEW.id, 'INSERT', to_jsonb(NEW), NEW.user_id);
    RETURN NEW;
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO public.audit_logs (table_name, record_id, operation_type, old_data, new_data, changed_by)
    VALUES ('transactions', NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), NEW.user_id);
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    INSERT INTO public.audit_logs (table_name, record_id, operation_type, old_data, changed_by)
    VALUES ('transactions', OLD.id, 'DELETE', to_jsonb(OLD), OLD.user_id);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Create a trigger for the transactions table
DROP TRIGGER IF EXISTS audit_transactions ON public.transactions;
CREATE TRIGGER audit_transactions
AFTER INSERT OR UPDATE OR DELETE ON public.transactions
FOR EACH ROW EXECUTE FUNCTION public.log_transaction_changes();

-- Add indexes for performance optimization on frequently queried columns
CREATE INDEX IF NOT EXISTS transactions_user_id_idx ON public.transactions (user_id);
CREATE INDEX IF NOT EXISTS transactions_date_idx ON public.transactions (date);
CREATE INDEX IF NOT EXISTS transactions_category_id_idx ON public.transactions (category_id);
CREATE INDEX IF NOT EXISTS accounts_user_id_idx ON public.accounts (user_id);
CREATE INDEX IF NOT EXISTS categories_user_id_idx ON public.categories (user_id);
CREATE INDEX IF NOT EXISTS recurring_transactions_user_id_idx ON public.recurring_transactions (user_id);
CREATE INDEX IF NOT EXISTS recurring_transactions_start_date_idx ON public.recurring_transactions (start_date);