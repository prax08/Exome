import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, IndianRupee, BarChart, Settings, Wallet } from "lucide-react"; // Changed DollarSign to IndianRupee
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
}

const navItems: NavItem[] = [
  { label: "Home", icon: Home, path: "/" },
  { label: "Transactions", icon: IndianRupee, path: "/transactions" }, // Using IndianRupee
  { label: "Accounts", icon: Wallet, path: "/accounts" },
  { label: "Reports", icon: BarChart, path: "/reports" },
  { label: "Settings", icon: Settings, path: "/settings" },
];

const BottomNavigation: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 block md:hidden bg-background border-t shadow-lg">
      <div className="flex h-16 items-center justify-around">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-primary",
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export { BottomNavigation };