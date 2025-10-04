import * as React from "react";
import { Header } from "@/components/Header";
import { BottomNavigation } from "@/components/BottomNavigation";
import { cn } from "@/lib/utils";

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children, className }) => {
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