"use client";

import * as React from "react";
import { Header } from "@/components/Header";
import { BottomNavigation } from "@/components/BottomNavigation";
import { cn } from "@/lib/utils";
import { useOnlineStatus } from "@/hooks/use-online-status"; // Import the new hook
import { toast } from "sonner"; // Import toast for notifications

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children, className }) => {
  const isOnline = useOnlineStatus();
  const [initialLoad, setInitialLoad] = React.useState(true);

  React.useEffect(() => {
    if (!initialLoad) { // Prevent toast on initial load
      if (isOnline) {
        toast.success("You are back online!", { id: "online-status", duration: 3000 });
      } else {
        toast.warning("You are currently offline. Some features may be limited.", { id: "online-status", duration: Infinity });
      }
    }
    setInitialLoad(false);
  }, [isOnline, initialLoad]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className={cn("flex-1 container py-8", className)}>
        {children}
      </main>
      <BottomNavigation />
      {/* Add padding to the bottom of the main content to prevent it from being hidden by the fixed bottom navigation */}
      <div className="block md:hidden h-16"></div> 
    </div>
  );
};

export { PageLayout };