"use client";

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/contexts/SessionContext';
import { toast } from 'sonner';

// Replace with your Supabase project ID and the VAPID Public Key you set as a secret
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY; // Will be loaded from .env or Vercel env

const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

const usePushNotifications = () => {
  const { user } = useSession();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>(Notification.permission);

  const getSubscription = useCallback(async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications are not supported by this browser.');
      setIsLoading(false);
      return null;
    }

    const registration = await navigator.serviceWorker.ready;
    return registration.pushManager.getSubscription();
  }, [setIsLoading]);

  const updateSubscriptionStatus = useCallback(async () => {
    setIsLoading(true);
    const subscription = await getSubscription();
    setIsSubscribed(!!subscription);
    setPermissionStatus(Notification.permission);
    setIsLoading(false);
  }, [getSubscription]);

  useEffect(() => {
    updateSubscriptionStatus();
  }, [updateSubscriptionStatus]);

  const subscribe = useCallback(async () => {
    if (!user) {
      toast.error('You must be logged in to enable notifications.');
      return;
    }
    if (permissionStatus === 'denied') {
      toast.error('Notification permission denied. Please enable it in your browser settings.');
      return;
    }
    if (isSubscribed) {
      toast.info('You are already subscribed to notifications.');
      return;
    }

    setIsLoading(true);
    try {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);

      if (permission !== 'granted') {
        toast.error('Notification permission not granted.');
        setIsLoading(false);
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey,
      });

      // Save subscription to Supabase
      const { error } = await supabase.from('user_subscriptions').insert({
        user_id: user.id,
        subscription_data: subscription,
      });

      if (error) {
        console.error('Error saving subscription to Supabase:', error);
        toast.error(`Failed to subscribe: ${error.message}`);
        // If saving fails, unsubscribe locally to keep state consistent
        await subscription.unsubscribe();
      } else {
        setIsSubscribed(true);
        toast.success('Successfully subscribed to notifications!');
      }
    } catch (error: any) {
      console.error('Error subscribing to push notifications:', error);
      toast.error(`Failed to subscribe: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [user, isSubscribed, permissionStatus, VAPID_PUBLIC_KEY]);

  const unsubscribe = useCallback(async () => {
    if (!user) {
      toast.error('You must be logged in to disable notifications.');
      return;
    }
    if (!isSubscribed) {
      toast.info('You are not currently subscribed to notifications.');
      return;
    }

    setIsLoading(true);
    try {
      const subscription = await getSubscription();
      if (subscription) {
        await subscription.unsubscribe();

        // Remove subscription from Supabase
        const { error } = await supabase
          .from('user_subscriptions')
          .delete()
          .eq('user_id', user.id)
          .eq('subscription_data', subscription as any); // Supabase might need exact match or a different way to identify

        if (error) {
          console.error('Error deleting subscription from Supabase:', error);
          toast.error(`Failed to unsubscribe: ${error.message}`);
          // If deleting from DB fails, re-subscribe locally to keep state consistent
          await subscribe(); // This might re-create a new subscription if the old one is gone
        } else {
          setIsSubscribed(false);
          toast.success('Successfully unsubscribed from notifications.');
        }
      }
    } catch (error: any) {
      console.error('Error unsubscribing from push notifications:', error);
      toast.error(`Failed to unsubscribe: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [user, isSubscribed, getSubscription, subscribe]);

  // Function to send a test notification (for development/testing)
  const sendTestNotification = useCallback(async () => {
    if (!user) {
      toast.error('You must be logged in to send a test notification.');
      return;
    }
    if (!isSubscribed) {
      toast.warning('You need to subscribe to notifications first.');
      return;
    }

    toast.info('Sending test notification...');

    try {
      const { data: subscriptions, error: fetchError } = await supabase
        .from('user_subscriptions')
        .select('subscription_data')
        .eq('user_id', user.id);

      if (fetchError || !subscriptions || subscriptions.length === 0) {
        console.error('Error fetching user subscriptions:', fetchError);
        toast.error('Could not find your subscription to send a test notification.');
        return;
      }

      const userSubscription = subscriptions[0].subscription_data; // Assuming one subscription per user for simplicity

      const response = await supabase.functions.invoke('send-notification', {
        body: {
          subscription: userSubscription,
          payload: {
            title: 'Test Notification',
            body: 'This is a test push notification from Exome Instruments!',
            icon: '/placeholder.svg',
            url: '/settings', // Example URL to open on click
          },
        },
      });

      if (response.error) {
        console.error('Error invoking send-notification function:', response.error);
        toast.error(`Failed to send test notification: ${response.error.message}`);
      } else {
        toast.success('Test notification sent! Check your device.');
      }
    } catch (error: any) {
      console.error('Unexpected error sending test notification:', error);
      toast.error(`Failed to send test notification: ${error.message}`);
    }
  }, [user, isSubscribed]);


  return {
    isSubscribed,
    isLoading,
    permissionStatus,
    subscribe,
    unsubscribe,
    sendTestNotification,
  };
};

export { usePushNotifications };