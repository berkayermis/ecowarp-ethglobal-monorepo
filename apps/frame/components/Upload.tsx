"use client";

import React, { useEffect } from "react";
import { Input, Label, Button } from "@repo/shadcn";
import { pinToIPFS } from "@/actions";
import { Address } from "viem";

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

  const metadata = {
    name,
    description,
    unitPrice,
    supply,
    category,
  };

  const handleAction = async (formData: FormData) => {
    const { ok } = await pinToIPFS(formData, metadata, code, wallet_address);

    if (ok) {
      setSuccess(true);
    } else {
      setSuccess(false);
    }
  };

  return (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="picture">Product Image(s)</Label>
      <form action={(formData) => handleAction(formData)}>
        <Input
          type="file"
          multiple
          name="picture"
          onChange={(e) => setFile(Array.from(e.target.files || []))}
          id="picture"
          accept="image/*"
        />
        <Button variant="outline" type="submit">
          Upload
        </Button>
      </form>
      {success && (
        <p>
          Success, please go back to the frame and click on the Mint button!{" "}
        </p>
      )}
    </div>
  );
};

export default Upload;
