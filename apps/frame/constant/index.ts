import { Address } from "viem";

export const PINATA_USER_BY_ID_API_URL =
  "https://api.pinata.cloud/v3/farcaster/users/";
export const PINATA_PINNING_API_URL =
  "https://api.pinata.cloud/pinning/pinFileToIPFS";
export const IPFS_GATEWAY = "https://cloudflare-ipfs.com/ipfs/";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export const CONTRACT_ADDRESS: Address = "0x0";

export const CONTRACT_ABI = [];
