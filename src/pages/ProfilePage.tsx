"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "@/contexts/SessionContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/Card";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { Loading } from "@/components/Loading";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Removed unused import
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/Form";
import { toast } from "sonner";
// import { User as UserIcon } from "lucide-react"; // Removed unused import
import { Modal } from "@/components/Modal";
import { AvatarUpload } from "@/components/AvatarUpload"; // Import AvatarUpload

const profileSchema = z.object({
  first_name: z.string().min(1, { message: "First name is required." }).optional().or(z.literal("")),
  last_name: z.string().min(1, { message: "Last name is required." }).optional().or(z.literal("")),
  // avatar_url is now managed by AvatarUpload component, not direct input
});

const passwordChangeSchema = z.object({
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match.",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileSchema> & { avatar_url?: string | null }; // Add avatar_url back for form state
type PasswordChangeFormValues = z.infer<typeof passwordChangeSchema>;

const ProfilePage: React.FC = () => {
  const { user, isLoading: isSessionLoading } = useSession();
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      avatar_url: "", // Keep in defaultValues for initial display
    },
  });

  const passwordForm = useForm<PasswordChangeFormValues>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (user && !isSessionLoading) {
      fetchProfile();
    } else if (!user && !isSessionLoading) {
      setLoadingProfile(false);
    }
  }, [user, isSessionLoading]);

  const fetchProfile = async () => {
    if (!user) return;
    setLoadingProfile(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("first_name, last_name, avatar_url")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile.");
    } else if (data) {
      profileForm.reset(data);
    }
    setLoadingProfile(false);
  };

  const onProfileSubmit = async (values: ProfileFormValues) => {
    if (!user) {
      toast.error("You must be logged in to update your profile.");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: values.first_name || null,
        last_name: values.last_name || null,
        avatar_url: values.avatar_url || null, // Ensure avatar_url is updated if changed by AvatarUpload
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile.");
    } else {
      toast.success("Profile updated successfully!");
    }
  };

  const onPasswordChangeSubmit = async (values: PasswordChangeFormValues) => {
    if (!user) {
      toast.error("You must be logged in to change your password.");
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: values.password,
    });

    if (error) {
      console.error("Error changing password:", error);
      toast.error(`Failed to change password: ${error.message}`);
    } else {
      toast.success("Password changed successfully!");
      setIsPasswordModalOpen(false);
      passwordForm.reset();
    }
  };

  const handleAvatarUploadSuccess = (newUrl: string) => {
    profileForm.setValue("avatar_url", newUrl);
    // Immediately save the new avatar URL to the database
    onProfileSubmit({
      ...profileForm.getValues(),
      avatar_url: newUrl,
    });
  };

  if (isSessionLoading || loadingProfile) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-160px)]">
        <Loading count={5} className="w-64" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-160px)]">
        <Card className="w-full max-w-md text-center p-6">
          <CardTitle>Access Denied</CardTitle>
          <CardDescription className="mt-2">Please log in to view your profile.</CardDescription>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>Manage your personal information and preferences.</CardDescription>
        </CardHeader>
        <CardContent>
          <AvatarUpload
            userId={user.id}
            currentAvatarUrl={profileForm.watch("avatar_url")}
            onUploadSuccess={handleAvatarUploadSuccess}
            className="mb-6"
          />
          <p className="text-lg font-semibold text-center mb-6">{user.email}</p>

          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
              <FormField
                control={profileForm.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} error={!!profileForm.formState.errors.first_name} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={profileForm.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} error={!!profileForm.formState.errors.last_name} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <h4 className="text-md font-semibold mb-2">Password Management</h4>
                <Button variant="outline" type="button" onClick={() => setIsPasswordModalOpen(true)}>
                  Change Password
                </Button>
              </div>

              <div>
                <h4 className="text-md font-semibold mb-2">Notification Preferences</h4>
                <Button variant="outline" type="button" onClick={() => toast.info("Notification preferences coming soon!")}>
                  Manage Notifications
                </Button>
              </div>

              <Button type="submit" className="w-full" disabled={profileForm.formState.isSubmitting}>
                {profileForm.formState.isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Password Change Modal */}
      <Modal
        title="Change Password"
        description="Enter your new password."
        open={isPasswordModalOpen}
        onOpenChange={setIsPasswordModalOpen}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsPasswordModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="password-change-form" disabled={passwordForm.formState.isSubmitting}>
              {passwordForm.formState.isSubmitting ? "Changing..." : "Change Password"}
            </Button>
          </div>
        }
      >
        <Form {...passwordForm}>
          <form id="password-change-form" onSubmit={passwordForm.handleSubmit(onPasswordChangeSubmit)} className="space-y-4">
            <FormField
              control={passwordForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} error={!!passwordForm.formState.errors.password} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={passwordForm.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} error={!!passwordForm.formState.errors.confirmPassword} />
                  </FormControl>
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

export default ProfilePage;