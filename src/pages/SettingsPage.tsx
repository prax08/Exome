import * as React from "react";
import { EmptyState } from "@/components/EmptyState";
import { Settings, BellRing, BellOff } from "lucide-react";
import { Button } from "@/components/Button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/Card";
import { usePushNotifications } from "@/hooks/use-push-notifications"; // Import the new hook
import { Switch } from "@/components/ui/switch"; // Import Switch component
import { Label } from "@/components/ui/label"; // Import Label component
import { useSession } from "@/contexts/SessionContext"; // Import useSession

const SettingsPage: React.FC = () => {
  const { user } = useSession();
  const { isSubscribed, isLoading, permissionStatus, subscribe, unsubscribe, sendTestNotification } = usePushNotifications();

  const handleToggleNotifications = async (checked: boolean) => {
    if (!user) {
      // This case should ideally be handled by ProtectedRoute, but good to have a fallback
      return;
    }
    if (checked) {
      await subscribe();
    } else {
      await unsubscribe();
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h2 className="text-2xl font-bold mb-6">Settings</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Manage your personal information.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="primary" asChild>
              <a href="/profile">Edit Profile</a>
            </Button>
          </CardContent>
        </Card>

        {/* Notification Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Manage your push notification preferences.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="push-notifications-toggle" className="flex items-center gap-2">
                {isSubscribed ? <BellRing className="h-5 w-5 text-green-500" /> : <BellOff className="h-5 w-5 text-muted-foreground" />}
                <span>Enable Push Notifications</span>
              </Label>
              <Switch
                id="push-notifications-toggle"
                checked={isSubscribed}
                onCheckedChange={handleToggleNotifications}
                disabled={isLoading || permissionStatus === 'denied' || !user}
              />
            </div>
            {permissionStatus === 'denied' && (
              <p className="text-sm text-destructive">
                Notification permission is blocked. Please enable it in your browser settings to receive push notifications.
              </p>
            )}
            {isSubscribed && (
              <Button onClick={sendTestNotification} variant="outline" disabled={isLoading}>
                Send Test Notification
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Other Settings (Placeholder) */}
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Adjust application-wide preferences.</CardDescription>
          </CardHeader>
          <CardContent>
            <EmptyState
              icon={<Settings size={48} />}
              title="More Settings Coming Soon"
              description="We're constantly adding new ways to customize your experience."
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;