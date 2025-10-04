-- Enable RLS on the audit_logs table (if not already enabled)
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to select their own audit logs
CREATE POLICY "Users can only see their own audit logs" ON public.audit_logs
FOR SELECT TO authenticated USING (auth.uid() = changed_by);

-- Prevent authenticated users from inserting, updating, or deleting audit logs directly
-- (Inserts are typically handled by database triggers, and direct modification should be restricted)
CREATE POLICY "Authenticated users cannot insert audit logs" ON public.audit_logs
FOR INSERT TO authenticated WITH CHECK (false);

CREATE POLICY "Authenticated users cannot update audit logs" ON public.audit_logs
FOR UPDATE TO authenticated USING (false);

CREATE POLICY "Authenticated users cannot delete audit logs" ON public.audit_logs
FOR DELETE TO authenticated USING (false);