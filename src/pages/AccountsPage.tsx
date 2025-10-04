import * as React from "react";
import { EmptyState } from "@/components/EmptyState";
import { Wallet } from "lucide-react";
import { Button } from "@/components/Button";

const AccountsPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <EmptyState
        icon={<Wallet size={64} />}
        title="No Accounts"
        description="You haven't added any financial accounts yet. Add one to start tracking your money."
        action={<Button variant="primary">Add New Account</Button>}
      />
    </div>
  );
};

export default AccountsPage;