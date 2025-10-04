"use client";

import * as React from "react";
import { EmptyState } from "@/components/EmptyState";
import { Wallet, PlusCircle, MoreHorizontal, Banknote, PiggyBank, CreditCard, Landmark, TrendingUp, HandCoins, CircleDollarSign } from "lucide-react";
import { Button } from "@/components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { ResponsiveGrid } from "@/components/ResponsiveGrid";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";
import { Loading } from "@/components/Loading";
import { Modal } from "@/components/Modal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/Form";
import { Input } from "@/components/Input";
import { Select } from "@/components/Select";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile"; // Import useIsMobile
import { MobileActionSheet } from "@/components/MobileActionSheet"; // Import MobileActionSheet

// Define account type for client-side
interface Account {
  id: string;
  name: string;
  balance: number;
  type: 'checking' | 'savings' | 'credit_card' | 'cash' | 'investment' | 'loan' | 'other';
  created_at: string;
}

// Form schema for adding/editing accounts
const accountSchema = z.object({
  name: z.string().min(1, { message: "Account name is required." }).max(100, { message: "Account name is too long." }),
  balance: z.preprocess(
    (val) => Number(val),
    z.number({ invalid_type_error: "Balance must be a number." }).min(0, { message: "Balance cannot be negative." })
  ),
  type: z.enum(['checking', 'savings', 'credit_card', 'cash', 'investment', 'loan', 'other'], {
    required_error: "Account type is required.",
  }),
});

const accountTypeOptions = [
  { value: "checking", label: "Checking" },
  { value: "savings", label: "Savings" },
  { value: "credit_card", label: "Credit Card" },
  { value: "cash", label: "Cash" },
  { value: "investment", label: "Investment" },
  { value: "loan", label: "Loan" },
  { value: "other", label: "Other" },
];

const getAccountIcon = (type: Account['type']) => {
  switch (type) {
    case 'checking': return <Banknote className="h-5 w-5 text-muted-foreground" />;
    case 'savings': return <PiggyBank className="h-5 w-5 text-muted-foreground" />;
    case 'credit_card': return <CreditCard className="h-5 w-5 text-muted-foreground" />;
    case 'cash': return <HandCoins className="h-5 w-5 text-muted-foreground" />;
    case 'investment': return <TrendingUp className="h-5 w-5 text-muted-foreground" />;
    case 'loan': return <Landmark className="h-5 w-5 text-muted-foreground" />;
    default: return <CircleDollarSign className="h-5 w-5 text-muted-foreground" />;
  }
};

const AccountsPage: React.FC = () => {
  const { user } = useSession();
  const isMobile = useIsMobile(); // Use the hook
  const [isAccountModalOpen, setIsAccountModalOpen] = React.useState(false);
  const [editingAccount, setEditingAccount] = React.useState<Account | null>(null);

  const accountForm = useForm<z.infer<typeof accountSchema>>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: "",
      balance: 0,
      type: "checking",
    },
  });

  const fetchAccounts = async () => {
    if (!user) return [];
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', user.id)
      .order('name', { ascending: true });

    if (error) {
      console.error("Error fetching accounts:", error);
      throw new Error("Failed to fetch accounts.");
    }
    return data as Account[];
  };

  const { data: accounts, isLoading, error, refetch } = useQuery({
    queryKey: ['accounts', user?.id],
    queryFn: fetchAccounts,
    enabled: !!user,
  });

  const openAddAccountModal = () => {
    setEditingAccount(null);
    accountForm.reset({
      name: "",
      balance: 0,
      type: "checking",
    });
    setIsAccountModalOpen(true);
  };

  const openEditAccountModal = (account: Account) => {
    setEditingAccount(account);
    accountForm.reset({
      name: account.name,
      balance: account.balance,
      type: account.type,
    });
    setIsAccountModalOpen(true);
  };

  const onSubmitAccount = async (values: z.infer<typeof accountSchema>) => {
    if (!user) {
      toast.error("You must be logged in to manage accounts.");
      return;
    }

    if (editingAccount) {
      // Update existing account
      const { error } = await supabase
        .from('accounts')
        .update({
          name: values.name,
          balance: values.balance,
          type: values.type,
        })
        .eq('id', editingAccount.id)
        .eq('user_id', user.id);

      if (error) {
        console.error("Error updating account:", error);
        toast.error(`Failed to update account: ${error.message}`);
      } else {
        toast.success("Account updated successfully!");
        setIsAccountModalOpen(false);
        refetch();
      }
    } else {
      // Add new account
      const { error } = await supabase.from('accounts').insert({
        user_id: user.id,
        name: values.name,
        balance: values.balance,
        type: values.type,
      });

      if (error) {
        console.error("Error adding account:", error);
        toast.error(`Failed to add account: ${error.message}`);
      } else {
        toast.success("Account added successfully!");
        setIsAccountModalOpen(false);
        refetch();
      }
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    if (!user) {
      toast.error("You must be logged in to delete accounts.");
      return;
    }

    if (window.confirm("Are you sure you want to delete this account? This action cannot be undone.")) {
      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', accountId)
        .eq('user_id', user.id);

      if (error) {
        console.error("Error deleting account:", error);
        toast.error(`Failed to delete account: ${error.message}`);
      } else {
        toast.success("Account deleted successfully!");
        refetch();
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-160px)]">
        <Loading count={3} className="w-full max-w-md" />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        title="Error loading accounts"
        description={error.message}
        action={<Button onClick={() => refetch()}>Try Again</Button>}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Accounts</h2>
        <Button onClick={openAddAccountModal} variant="primary">
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Account
        </Button>
      </div>

      {accounts && accounts.length > 0 ? (
        <ResponsiveGrid cols={{ default: 1, sm: 2, md: 3 }} gap={6}>
          {accounts.map((account) => (
            <Card key={account.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center space-x-2">
                  {getAccountIcon(account.type)}
                  <CardTitle className="text-lg font-medium">{account.name}</CardTitle>
                </div>
                {isMobile ? (
                  <MobileActionSheet title="Account Actions" description={`Actions for ${account.name}`}>
                    <Button variant="ghost" onClick={() => openEditAccountModal(account)}>Edit</Button>
                    <Button variant="destructive" onClick={() => handleDeleteAccount(account.id)}>Delete</Button>
                  </MobileActionSheet>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => openEditAccountModal(account)}>Edit</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDeleteAccount(account.id)} className="text-destructive">
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{account.balance.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground capitalize">
                  {account.type.replace('_', ' ')}
                </p>
              </CardContent>
            </Card>
          ))}
        </ResponsiveGrid>
      ) : (
        <EmptyState
          icon={<Wallet size={64} />}
          title="No Accounts"
          description="You haven't added any financial accounts yet. Add one to start tracking your money."
          action={<Button onClick={openAddAccountModal} variant="primary">Add New Account</Button>}
        />
      )}

      {/* Add/Edit Account Modal */}
      <Modal
        title={editingAccount ? "Edit Account" : "Add New Account"}
        description={editingAccount ? "Update the details for your account." : "Enter the details for your new financial account."}
        open={isAccountModalOpen}
        onOpenChange={setIsAccountModalOpen}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsAccountModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="account-form" disabled={accountForm.formState.isSubmitting}>
              {accountForm.formState.isSubmitting ? (editingAccount ? "Saving..." : "Adding...") : (editingAccount ? "Save Changes" : "Add Account")}
            </Button>
          </div>
        }
      >
        <Form {...accountForm}>
          <form id="account-form" onSubmit={accountForm.handleSubmit(onSubmitAccount)} className="space-y-4">
            <FormField
              control={accountForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My Savings" {...field} error={!!accountForm.formState.errors.name} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={accountForm.control}
              name="balance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Initial Balance</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0.00"
                      {...field}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.onChange(parseFloat(e.target.value))}
                      error={!!accountForm.formState.errors.balance}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={accountForm.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Type</FormLabel>
                  <Select
                    options={accountTypeOptions}
                    placeholder="Select account type"
                    onValueChange={field.onChange}
                    value={field.value}
                    className={!!accountForm.formState.errors.type ? "border-destructive focus-visible:ring-destructive" : ""}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </Modal>
    </div>
  );
};

export default AccountsPage;