import * as React from "react";
import { EmptyState } from "@/components/EmptyState";
import { DollarSign } from "lucide-react";
import { Button } from "@/components/Button";

const TransactionsPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <EmptyState
        icon={<DollarSign size={64} />}
        title="No Transactions"
        description="You haven't recorded any transactions yet. Start by adding your first income or expense."
        action={<Button variant="primary">Add New Transaction</Button>}
      />
    </div>
  );
};

export default TransactionsPage;