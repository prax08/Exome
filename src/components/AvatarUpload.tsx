"use client";

import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/Button";
// import { Input } from "@/components/Input"; // Removed unused import
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User as UserIcon, UploadCloud, XCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AvatarUploadProps {
  userId: string;
  currentAvatarUrl?: string | null;
  onUploadSuccess: (newUrl: string) => void;
  className?: string;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({
  userId,
  currentAvatarUrl,
  onUploadSuccess,
  className,
}) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(currentAvatarUrl || null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setAvatarUrl(currentAvatarUrl || null);
  }, [currentAvatarUrl]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      toast.error("Please select an image to upload.");
      return;
    }

    const file = event.target.files[0];
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}-${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    setUploading(true);

    // Delete old avatar if it exists
    if (avatarUrl && avatarUrl.includes('avatars/')) {
      const oldFileName = avatarUrl.split('/').pop();
      if (oldFileName) {
        const { error: deleteError } = await supabase.storage
          .from('avatars')
          .remove([oldFileName]);
        if (deleteError) {
          console.warn("Failed to delete old avatar:", deleteError.message);
          // Don't block upload if old avatar deletion fails
        }
      }
    }

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Error uploading avatar:", uploadError);
      toast.error(`Avatar upload failed: ${uploadError.message}`);
      setUploading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    if (publicUrlData?.publicUrl) {
      setAvatarUrl(publicUrlData.publicUrl);
      onUploadSuccess(publicUrlData.publicUrl);
      toast.success("Avatar uploaded successfully!");
    } else {
      toast.error("Failed to get public URL for avatar.");
    }
    setUploading(false);
  };

  const handleRemoveAvatar = async () => {
    if (!avatarUrl || !avatarUrl.includes('avatars/')) {
      toast.info("No avatar to remove.");
      return;
    }

    const fileName = avatarUrl.split('/').pop();
    if (!fileName) {
      toast.error("Could not determine avatar file name.");
      return;
    }

    setUploading(true);
    const { error } = await supabase.storage
      .from('avatars')
      .remove([fileName]);

    if (error) {
      console.error("Error removing avatar:", error);
      toast.error(`Failed to remove avatar: ${error.message}`);
    } else {
      setAvatarUrl(null);
      onUploadSuccess(""); // Clear the avatar URL in the parent component
      toast.success("Avatar removed successfully!");
    }
    setUploading(false);
  };

  return (
    <div className={cn("flex flex-col items-center space-y-4", className)}>
      <Avatar className="h-24 w-24">
        <AvatarImage src={avatarUrl || undefined} alt="User Avatar" />
        <AvatarFallback>
          <UserIcon className="h-12 w-12 text-muted-foreground" />
        </AvatarFallback>
      </Avatar>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        disabled={uploading}
      />
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          <UploadCloud className="mr-2 h-4 w-4" />
          {uploading ? "Uploading..." : "Upload Avatar"}
        </Button>
        {avatarUrl && (
          <Button
            type="button"
            variant="destructive"
            onClick={handleRemoveAvatar}
            disabled={uploading}
          >
            <XCircle className="mr-2 h-4 w-4" />
            Remove Avatar
          </Button>
        )}
      </div>
    </div>
  );
};

export { AvatarUpload };