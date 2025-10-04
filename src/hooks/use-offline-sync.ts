"use client";

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useOnlineStatus } from './use-online-status';
import { offlineStore } from '@/integrations/localforage';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/contexts/SessionContext';

interface OfflineTransaction {
  id?: string; // For updates, this will be the Supabase ID
  local_id?: string; // For new inserts, a temporary local ID
  local_status: 'pending-insert' | 'pending-update' | 'pending-delete'; // Status of the offline operation
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
        toast.info("Attempting to sync offline changes...", { id: "offline-sync", duration: Infinity });
        try {
          const keys = await offlineStore.keys();
          const offlineChangesKeys = keys.filter(key => key.startsWith('offline-'));

          if (offlineChangesKeys.length === 0) {
            toast.dismiss("offline-sync");
            return;
          }

          let syncedCount = 0;
          let failedCount = 0;

          for (const key of offlineChangesKeys) {
            const change = await offlineStore.getItem<OfflineTransaction>(key);

            if (!change || change.user_id !== user.id) {
              // If the change belongs to a different user or is malformed, remove it
              await offlineStore.removeItem(key);
              continue;
            }

            try {
              if (change.local_status === 'pending-insert') {
                // Remove local_id and local_status before inserting to Supabase
                const { local_id, local_status, ...transactionToInsert } = change;
                const { error } = await supabase.from('transactions').insert(transactionToInsert);

                if (error) {
                  console.error(`Error syncing offline insert ${key}:`, error);
                  toast.error(`Failed to sync new transaction: ${error.message}`);
                  failedCount++;
                } else {
                  await offlineStore.removeItem(key);
                  syncedCount++;
                }
              } else if (change.local_status === 'pending-update') {
                if (!change.id) {
                  console.error(`Offline update ${key} missing transaction ID.`);
                  await offlineStore.removeItem(key); // Remove malformed update
                  failedCount++;
                  continue;
                }
                // Remove local_status before updating Supabase
                const { local_status, ...transactionToUpdate } = change;
                const { error } = await supabase
                  .from('transactions')
                  .update(transactionToUpdate)
                  .eq('id', change.id)
                  .eq('user_id', user.id); // Ensure user ownership

                if (error) {
                  console.error(`Error syncing offline update ${key}:`, error);
                  toast.error(`Failed to sync transaction update: ${error.message}`);
                  failedCount++;
                } else {
                  await offlineStore.removeItem(key);
                  syncedCount++;
                }
              }
              // Add 'pending-delete' handling here if implemented
            } catch (opError) {
              console.error(`Unexpected error during sync operation for ${key}:`, opError);
              toast.error(`An unexpected error occurred syncing an item: ${opError instanceof Error ? opError.message : String(opError)}`);
              failedCount++;
            }
          }

          if (syncedCount > 0) {
            toast.success(`${syncedCount} offline change(s) synced successfully!`, { id: "offline-sync", duration: 3000 });
            // Invalidate relevant queries to refetch data from Supabase
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
          } else if (failedCount > 0) {
            toast.warning(`Some offline changes failed to sync. Please check for errors.`, { id: "offline-sync", duration: 5000 });
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