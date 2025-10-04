import * as React from "react";
import { Link } from "react-router-dom";
import { Bell, Menu } from "lucide-react";
import { Button } from "@/components/Button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface HeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  // You can add props for user info, notification count, etc.
  userName?: string;
  userAvatarUrl?: string;
  notificationCount?: number;
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  userName = "User",
  userAvatarUrl,
  notificationCount = 0,
  onMenuClick,
  className,
  ...props
}) => {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm",
        className,
      )}
      {...props}
    >
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Hamburger Menu for mobile */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="flex h-16 items-center px-6">
                <Link to="/" className="font-bold text-lg">
                  Exome Instruments
                </Link>
              </div>
              <Separator />
              <nav className="flex flex-col p-4 space-y-2">
                {/* Placeholder for menu items */}
                <Link to="/" className="block px-4 py-2 text-sm hover:bg-accent rounded-md">
                  Dashboard
                </Link>
                <Link to="/transactions" className="block px-4 py-2 text-sm hover:bg-accent rounded-md">
                  Transactions
                </Link>
                <Link to="/reports" className="block px-4 py-2 text-sm hover:bg-accent rounded-md">
                  Reports
                </Link>
                <Link to="/settings" className="block px-4 py-2 text-sm hover:bg-accent rounded-md">
                  Settings
                </Link>
              </nav>
            </SheetContent>
          </Sheet>

          {/* Desktop Navigation (hidden on mobile) */}
          <Link to="/" className="hidden md:block font-bold text-lg">
            Exome Instruments
          </Link>
          <nav className="hidden md:flex items-center space-x-4 text-sm font-medium">
            <Link to="/" className="hover:text-primary">Dashboard</Link>
            <Link to="/transactions" className="hover:text-primary">Transactions</Link>
            <Link to="/reports" className="hover:text-primary">Reports</Link>
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
            {notificationCount > 0 && (
              <span className="absolute top-2 right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                {notificationCount}
              </span>
            )}
            <span className="sr-only">Notifications</span>
          </Button>
          <Avatar>
            <AvatarImage src={userAvatarUrl} alt={userName} />
            <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
};

export { Header };