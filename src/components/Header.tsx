import * as React from "react";
import { Link } from "react-router-dom";
import { Bell, Menu, User as UserIcon } from "lucide-react"; // Removed unused imports
import { Button } from "@/components/Button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useSession } from "@/contexts/SessionContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client"; // Import supabase client

interface HeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  notificationCount?: number;
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  notificationCount = 0,
  onMenuClick,
  className,
  ...props
}) => {
  const { user } = useSession(); // Removed unused 'session'

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error);
      toast.error("Failed to log out.");
    } else {
      toast.success("Logged out successfully!");
    }
  };

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
                <Link to="/" className="block px-4 py-2 text-sm hover:bg-accent rounded-md">
                  Dashboard
                </Link>
                <Link to="/transactions" className="block px-4 py-2 text-sm hover:bg-accent rounded-md">
                  Transactions
                </Link>
                <Link to="/recurring-transactions" className="block px-4 py-2 text-sm hover:bg-accent rounded-md">
                  Recurring
                </Link>
                <Link to="/accounts" className="block px-4 py-2 text-sm hover:bg-accent rounded-md">
                  Accounts
                </Link>
                <Link to="/categories" className="block px-4 py-2 text-sm hover:bg-accent rounded-md">
                  Categories
                </Link>
                <Link to="/budgets" className="block px-4 py-2 text-sm hover:bg-accent rounded-md">
                  Budgets
                </Link>
                <Link to="/reports" className="block px-4 py-2 text-sm hover:bg-accent rounded-md">
                  Reports
                </Link>
                <Link to="/settings" className="block px-4 py-2 text-sm hover:bg-accent rounded-md">
                  Settings
                </Link>
                {user && (
                  <>
                    <Separator />
                    <Link to="/profile" className="block px-4 py-2 text-sm hover:bg-accent rounded-md">
                      Profile
                    </Link>
                    <Button variant="ghost" className="w-full justify-start px-4 py-2 text-sm hover:bg-accent rounded-md" onClick={handleLogout}>
                      Logout
                    </Button>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>

          <Link to="/" className="hidden md:block font-bold text-lg">
            Exome Instruments
          </Link>
          <nav className="hidden md:flex items-center space-x-4 text-sm font-medium">
            <Link to="/" className="hover:text-primary">Dashboard</Link>
            <Link to="/transactions" className="hover:text-primary">Transactions</Link>
            <Link to="/recurring-transactions" className="hover:text-primary">Recurring</Link>
            <Link to="/categories" className="hover:text-primary">Categories</Link>
            <Link to="/budgets" className="hover:text-primary">Budgets</Link> {/* New Link */}
            <Link to="/accounts" className="hover:text-primary">Accounts</Link>
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

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.user_metadata?.avatar_url || undefined} alt={user.email || "User"} />
                    <AvatarFallback>{user.email?.charAt(0).toUpperCase() || <UserIcon className="h-4 w-4" />}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.email}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild>
              <Link to="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export { Header };