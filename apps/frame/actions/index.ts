"use server";

import { getAddress, Address, zeroAddress, formatEther } from "viem";
import { supabaseClient } from "@/utils/client";
import {
  PINATA_USER_BY_ID_API_URL,
  PINATA_PINNING_API_URL,
  Json,
} from "@/constant";

export async function get_and_encode_wallet_address(fid: number | undefined) {
  try {
    const res = await fetch(PINATA_USER_BY_ID_API_URL + fid, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.PINATA_API_JWT}`,
      },
    });

    const response = await res.json();

    if (response.error) {
      console.log("response error", response.error);
      throw new Error("Error fetching user data");
    }

    const encoded_wallet_address = getAddress(
      await response.data.verifications[0]
    );

    const f_data = await fetch_user(encoded_wallet_address);
    return f_data;
  } catch (e) {
    console.error(e);
    return {
      ok: false,
      user: null,
      unregistered_wallet_address: null,
    };
  }
}

async function fetch_user(wallet_address: Address) {
  const pgClient = await supabaseClient();
  if (!pgClient) {
    throw new Error("Error creating pg client");
  }
  try {
    await pgClient.connect();
    const { rows } = await pgClient.query(
      "SELECT * FROM profiles WHERE wallet_address = $1",
      [wallet_address]
    );
    await pgClient.end();

    if (rows.length > 0) {
      return {
        ok: true,
        user: rows[0],
        unregistered_wallet_address: rows[0].wallet_address,
      };
    }

    return {
      ok: false,
      user: null,
      unregistered_wallet_address: wallet_address,
    };
  } catch (e) {
    console.error("error fetching user: ", e);
    return {
      ok: false,
      user: null,
      unregistered_wallet_address: wallet_address,
    };
  } finally {
    if (pgClient) {
      try {
        await pgClient.end();
      } catch (err) {
        console.error("Error closing client connection:", err);
      }
    }
  }
}

export async function sign_up(wallet_address: Address) {
  if (wallet_address === zeroAddress || !wallet_address) {
    throw new Error("Invalid wallet address");
  }

  const pgClient = await supabaseClient();
  if (!pgClient) {
    throw new Error("Error creating pg client");
  }

  try {
    await pgClient.connect();

    const res = await pgClient.query(
      "INSERT INTO profiles (wallet_address) VALUES ($1) ON CONFLICT (wallet_address) DO NOTHING RETURNING *",
      [wallet_address]
    );

    return {
      ok: true,
    };
  } catch (e) {
    console.error(e);
    return {
      ok: false,
    };
  } finally {
    if (pgClient) {
      try {
        await pgClient.end();
      } catch (err) {
        console.error("Error closing client connection:", err);
      }
    }
  }
}

export async function cdn_req(wallet_address: Address, code: string) {
  if (!code) {
    throw new Error("Hash missing");
  }

  const pgClient = await supabaseClient();
  if (!pgClient) {
    throw new Error("Error creating pg client");
  }

  try {
    await pgClient.connect();

    const res = await pgClient.query(
      "UPDATE profiles SET cdn_hash = $1 WHERE wallet_address = $2 RETURNING *",
      [
        JSON.stringify({
          hash: code,
          expAt: Math.round((new Date().getTime() + 1000 * 60 * 5) / 1000),
        }),
        wallet_address,
      ]
    );

    return {
      ok: true,
    };
  } catch (e) {
    console.error(e);
    return {
      ok: false,
    };
  } finally {
    if (pgClient) {
      try {
        await pgClient.end();
      } catch (err) {
        console.error("Error closing client connection:", err);
      }
    }
  }
}

export async function validateCode(code: Json, wallet_address: Address) {
  if (typeof code !== "string" || code.length !== 32) {
    throw new Error("Invalid code");
  }

  if (wallet_address === zeroAddress || !wallet_address) {
    throw new Error("Invalid wallet address");
  }

  const pgClient = await supabaseClient();
  if (!pgClient) {
    throw new Error("Error creating pg client");
  }

  try {
    await pgClient.connect();

    const res = await pgClient.query(
      "SELECT cdn_hash FROM profiles WHERE wallet_address = $1",
      [wallet_address]
    );

    const timestamp = new Date().getTime() / 1000;

    if (res.rows.length === 0) {
      return {
        isCodeValid: false,
        message: "User not found",
      };
    }

    const expAt = res.rows[0]?.cdn_hash?.expAt;

    if (expAt < timestamp) {
      return {
        isCodeValid: false,
        message: "Code expired",
      };
    }

    return {
      isCodeValid: res.rows[0]?.cdn_hash?.hash === code,
      message: "Code validated",
    };
  } catch (e) {
    console.error(e);
    return {
      isCodeValid: false,
      message: "Error validating code",
    };
  } finally {
    if (pgClient) {
      try {
        await pgClient.end();
      } catch (err) {
        console.error("Error closing client connection:", err);
      }
    }
  }
}

export async function pinToIPFS(
  formData: FormData,
  metadata: Json,
  code: string,
  wallet_address: Address
) {
  const files = formData.getAll("picture");
  if (files.length === 0) {
    throw new Error("No files to pin");
  }

  if (
    typeof code !== "string" ||
    code.length !== 32 ||
    !code ||
    !wallet_address ||
    wallet_address === zeroAddress
  ) {
    throw new Error("Invalid code or wallet address");
  }

  const pgClient = await supabaseClient();
  if (!pgClient) {
    throw new Error("Error creating pg client");
  }
  try {
    await pgClient.connect();
    const hashes: Array<{
      hash: string;
    }> = [];

    for (const file of files) {
      if (file instanceof File) {
        const form = new FormData();
        form.append("file", file);
        form.append("pinataMetadata", JSON.stringify({ name: file.name }));
        form.append("pinataOptions", JSON.stringify({ cidVersion: 1 }));

        const options = {
          method: "POST",
          headers: { Authorization: `Bearer ${process.env.PINATA_API_JWT}` },
          body: form,
        };

        const response = await fetch(PINATA_PINNING_API_URL, options);
        const responseData = await response.json();
        if (responseData.IpfsHash) {
          hashes.push({ hash: responseData.IpfsHash });
        }
      }
    }

    if (hashes.length > 0) {
      const refactoredMetadata = {
        ...(metadata as { [key: string]: any }),
        image: hashes,
      };
      const metadataFile = new Blob([JSON.stringify(refactoredMetadata)], {
        type: "application/json",
      });
      const metadataForm = new FormData();
      metadataForm.append("file", metadataFile, "metadata.json");

      try {
        const response = await fetch(PINATA_PINNING_API_URL, {
          method: "POST",
          headers: { Authorization: `Bearer ${process.env.PINATA_API_JWT}` },
          body: metadataForm,
        });
        const responseData = await response.json();
        console.log("Metadata IPFS Hash:", responseData.IpfsHash);

        const fetchUser = await pgClient.query(
          "SELECT * FROM profiles WHERE wallet_address = $1",
          [wallet_address]
        );

        if (fetchUser.rows.length === 0) {
          throw new Error("User not found");
        }

        const user_cdn_info = fetchUser.rows[0]?.cdn_hash;

        if (user_cdn_info.hash !== code) {
          throw new Error("Invalid code");
        }

        if (user_cdn_info.expAt < new Date().getTime() / 1000) {
          throw new Error("Code expired");
        }

        const res = await pgClient.query(
          "UPDATE profiles SET cdn_hash = $1 WHERE wallet_address = $2 RETURNING *",
          [
            JSON.stringify({
              hash: user_cdn_info.hash,
              expAt: user_cdn_info.expAt,
              ipfsHash: responseData.IpfsHash,
            }),
            wallet_address,
          ]
        );

        if (res.rows.length === 0) {
          throw new Error("Error updating user");
        }

        return {
          ok: true,
        };
      } catch (err) {
        console.error("Error pinning metadata:", err);
      }
    }

    return {
      ok: false,
    };
  } catch (e) {
    console.error(e);
    return {
      ok: false,
    };
  } finally {
    if (pgClient) {
      try {
        await pgClient.end();
      } catch (err) {
        console.error("Error closing client connection:", err);
      }
    }
  }
}
