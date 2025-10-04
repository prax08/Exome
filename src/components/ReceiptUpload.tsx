"use client";

import React, { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/Button";
import { UploadCloud, XCircle, FileText } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ReceiptUploadProps {
  userId: string;
  transactionId: string; // Unique identifier for the transaction
  currentReceiptUrl?: string | null;
  onUploadSuccess: (newUrl: string) => void;
  onRemoveSuccess: () => void;
  className?: string;
}

const ReceiptUpload: React.FC<ReceiptUploadProps> = ({
  userId,
  transactionId,
  currentReceiptUrl,
  onUploadSuccess,
  onRemoveSuccess,
  className,
}) => {
  const [receiptUrl, setReceiptUrl] = useState<string | null>(currentReceiptUrl || null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setReceiptUrl(currentReceiptUrl || null);
  }, [currentReceiptUrl]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      toast.error("Please select a file to upload.");
      return;
    }

    const file = event.target.files[0];
    const fileExt = file.name.split(".").pop();
    // Use transactionId to ensure unique and identifiable file paths
    const fileName = `${transactionId}-${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`; // Store under user's folder

    setUploading(true);

    // If there's an existing receipt, remove it first
    if (receiptUrl) {
      const oldFilePath = receiptUrl.split('receipts/')[1]; // Extract path after bucket name
      if (oldFilePath) {
        const { error: deleteError } = await supabase.storage
          .from('receipts')
          .remove([oldFilePath]);
        if (deleteError) {
          console.warn("Failed to delete old receipt:", deleteError.message);
          // Don't block upload if old receipt deletion fails
        }
      }
    }

    const { error: uploadError } = await supabase.storage
      .from("receipts")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Error uploading receipt:", uploadError);
      toast.error(`Receipt upload failed: ${uploadError.message}`);
      setUploading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("receipts")
      .getPublicUrl(filePath);

    if (publicUrlData?.publicUrl) {
      setReceiptUrl(publicUrlData.publicUrl);
      onUploadSuccess(publicUrlData.publicUrl);
      toast.success("Receipt uploaded successfully!");
    } else {
      toast.error("Failed to get public URL for receipt.");
    }
    setUploading(false);
  };

  const handleRemoveReceipt = async () => {
    if (!receiptUrl) {
      toast.info("No receipt to remove.");
      return;
    }

    const filePath = receiptUrl.split('receipts/')[1]; // Extract path after bucket name
    if (!filePath) {
      toast.error("Could not determine receipt file path.");
      return;
    }

    setUploading(true);
    const { error } = await supabase.storage
      .from('receipts')
      .remove([filePath]);

    if (error) {
      console.error("Error removing receipt:", error);
      toast.error(`Failed to remove receipt: ${error.message}`);
    } else {
      setReceiptUrl(null);
      onRemoveSuccess(); // Notify parent component that receipt is removed
      toast.success("Receipt removed successfully!");
    }
    setUploading(false);
  };

  return (
    <div className={cn("flex flex-col items-center space-y-4", className)}>
      {receiptUrl ? (
        <div className="flex flex-col items-center space-y-2">
          <FileText className="h-12 w-12 text-muted-foreground" />
          <a
            href={receiptUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline"
          >
            View Receipt
          </a>
        </div>
      ) : (
        <div className="flex flex-col items-center text-muted-foreground">
          <FileText className="h-12 w-12" />
          <p className="text-sm">No receipt attached</p>
        </div>
      )}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*,application/pdf"
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
          {uploading ? "Uploading..." : (receiptUrl ? "Replace Receipt" : "Upload Receipt")}
        </Button>
        {receiptUrl && (
          <Button
            type="button"
            variant="destructive"
            onClick={handleRemoveReceipt}
            disabled={uploading}
          >
            <XCircle className="mr-2 h-4 w-4" />
            Remove Receipt
          </Button>
        )}
      </div>
    </div>
  );
};

export { ReceiptUpload };