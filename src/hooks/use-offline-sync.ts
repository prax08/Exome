"use client";

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useOnlineStatus } from './use-online-status';
import { offlineStore } from '@/integrations/localforage';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/contexts/SessionContext';

interface OfflineTransaction {
  user_id: string;
  amount: number;
  type: 'income' | 'expense';
  description: string;
  date: string;
  category_id?: string | null;
  receipt_url?: string | null;
  vendor?: string | null;
  payment_method?: string | null;
}

const useOfflineSync = () => {
  const isOnline = useOnlineStatus();
  const { user } = useSession();
  const queryClient = useQueryClient();

  useEffect(() => {
    const syncOfflineTransactions = async () => {
      if (isOnline && user) {
        toast.info("Attempting to sync offline transactions...", { id: "offline-sync", duration: Infinity });
        try {
          const keys = await offlineStore.keys();
          const offlineTransactionKeys = keys.filter(key => key.startsWith('offline-transaction-'));

          if (offlineTransactionKeys.length === 0) {
            toast.dismiss("offline-sync");
            return;
          }

          let syncedCount = 0;
          for (const key of offlineTransactionKeys) {
            const transaction = await offlineStore.getItem<OfflineTransaction>(key);
            if (transaction && transaction.user_id === user.id) {
              const { error } = await supabase.from('transactions').insert(transaction);

              if (error) {
                console.error(`Error syncing offline transaction ${key}:`, error);
                toast.error(`Failed to sync an offline transaction: ${error.message}`);
              } else {
                await offlineStore.removeItem(key);
                syncedCount++;
              }
            } else if (transaction && transaction.user_id !== user.id) {
                // If the transaction belongs to a different user, remove it (e.g., after logout/login as different user)
                await offlineStore.removeItem(key);
            }
          }

          if (syncedCount > 0) {
            toast.success(`${syncedCount} offline transaction(s) synced successfully!`, { id: "offline-sync", duration: 3000 });
            // Invalidate relevant queries to refetch data from Supabase
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
          } else {
            toast.dismiss("offline-sync");
          }
        } catch (error) {
          console.error("Error during offline sync process:", error);
          toast.error("An error occurred during offline synchronization.", { id: "offline-sync" });
        }
      }
    };

    syncOfflineTransactions();
  }, [isOnline, user, queryClient]);
};

export { useOfflineSync };