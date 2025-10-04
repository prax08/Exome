import * as React from "react";
import { EmptyState } from "@/components/EmptyState";
import { BarChart } from "lucide-react";
import { Button } from "@/components/Button";

const ReportsPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <EmptyState
        icon={<BarChart size={64} />}
        title="No Reports Available"
        description="Generate reports to visualize your financial data. Add some transactions first!"
        action={<Button variant="primary">View Transactions</Button>}
      />
    </div>
  );
};

export default ReportsPage;