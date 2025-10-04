import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xxgqbdyhxgaqilhpbmsq.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4Z3FiZHloeGdhcWlsaHBibXNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1ODczODIsImV4cCI6MjA3NTE2MzM4Mn0.V0tpKKb73OMzC17VynTW_uxdoLRnaNyOXLqd-Bd8uGc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);