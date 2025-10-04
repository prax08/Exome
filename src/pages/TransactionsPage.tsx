import * as React from "react";
import { EmptyState } from "@/components/EmptyState";
import { IndianRupee } from "lucide-react"; // Changed DollarSign to IndianRupee
import { Button } from "@/components/Button";

const TransactionsPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <EmptyState
        icon={<IndianRupee size={64} />} // Using IndianRupee
        title="No Transactions"
        description="You haven't recorded any transactions yet. Start by adding your first income or expense."
        action={<Button variant="primary">Add New Transaction</Button>}
      />
    </div>
  );
};

export default TransactionsPage;