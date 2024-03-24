"use client";

import React, { useEffect } from "react";
import { Input, Label, Button } from "@repo/shadcn";
import { pinToIPFS } from "@/actions";
import { Address } from "viem";
import styles from "@/app/page.module.css";

const Upload = ({
  name,
  description,
  unitPrice,
  supply,
  category,
  code,
  wallet_address,
}: {
  name: string;
  description: string;
  unitPrice: string;
  supply: string;
  category: string;
  code: string;
  wallet_address: Address;
}) => {
  const [file, setFile] = React.useState<File[] | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = React.useState<string | null>(
    null
  );
  const [loading, setLoading] = React.useState(false);

  useEffect(() => {
    // Generate preview URL for the first file if files are selected
    if (file && file[0]) {
      const fileUrl = URL.createObjectURL(file[0]);
      setImagePreviewUrl(fileUrl);

      // Cleanup function to revoke URL to avoid memory leaks
      return () => URL.revokeObjectURL(fileUrl);
    }
  }, [file]);

  const metadata = {
    name,
    description,
    unitPrice,
    supply,
    category,
    image: [] as Array<{
      hash: string;
    }>,
  };

  const handleAction = async (formData: FormData) => {
    if (!file) return;
    setLoading(true);
    const { ok } = await pinToIPFS(formData, metadata, code, wallet_address);

    if (ok) {
      setSuccess(true);
    } else {
      setSuccess(false);
    }
    setLoading(false);
  };

  return (
    <div className={styles.card}>
      <Label htmlFor="picture" className={styles.label}>
        Product Image(s)
      </Label>
      {imagePreviewUrl && (
        <img
          src={imagePreviewUrl}
          alt="Preview"
          className={styles.imagePreview}
          style={{ width: "100%", maxHeight: "200px", objectFit: "contain" }}
        />
      )}
      <form
        className={styles.form}
        action={(formData) => handleAction(formData)}
      >
        <Input
          type="file"
          multiple
          name="picture"
          onChange={(e) => setFile(Array.from(e.target.files || []))}
          id="picture"
          accept="image/*"
        />
        <Button className={styles.button} variant="outline" type="submit">
          {loading ? "Uploading..." : "Upload"}
        </Button>
        {success && (
          <div className={styles.container}>
            <p>
              Success, please go back to the frame and click on the Mint button!
            </p>
          </div>
        )}
      </form>
    </div>
  );
};

export default Upload;
