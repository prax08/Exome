import * as React from "react";
import { EmptyState } from "@/components/EmptyState";
import { Settings } from "lucide-react";
import { Button } from "@/components/Button";

const SettingsPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <EmptyState
        icon={<Settings size={64} />}
        title="Settings"
        description="Manage your profile, preferences, and application settings here."
        action={<Button variant="primary">Edit Profile</Button>}
      />
    </div>
  );
};

export default SettingsPage;