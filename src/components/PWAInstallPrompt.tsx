"use client";

import React from 'react';
import { usePWAInstall } from '@/hooks/use-pwa-install';
import { Button } from '@/components/Button';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

const PWAInstallPrompt: React.FC = () => {
  const { deferredPrompt, installPWA, isAppInstalled } = usePWAInstall();

  const handleInstallClick = () => {
    installPWA();
    toast.info("Attempting to install Exome Instruments...", { duration: 3000 });
  };

  if (!deferredPrompt || isAppInstalled) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 p-3 bg-primary text-primary-foreground rounded-lg shadow-lg flex items-center gap-3">
      <Download className="h-5 w-5" />
      <p className="text-sm font-medium">Install Exome Instruments for a better experience!</p>
      <Button variant="secondary" size="sm" onClick={handleInstallClick}>
        Install
      </Button>
    </div>
  );
};

export { PWAInstallPrompt };