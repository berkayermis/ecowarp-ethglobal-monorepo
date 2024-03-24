import { Address } from "viem";

export const PINATA_USER_BY_ID_API_URL =
  "https://api.pinata.cloud/v3/farcaster/users/";
export const PINATA_PINNING_API_URL =
  "https://api.pinata.cloud/pinning/pinFileToIPFS";
export const PINATA_HUB_USER_CASTS_BY_FID_API_URL =
  "https://hub.pinata.cloud/v1/castsByFid?fid=";
export const PINATA_IPFS_GATEWAY = "https://gateway.pinata.cloud/ipfs/";

export const RAILWAY_ML_PREDICTION_API_URL =
  "https://ecowarp-ethglobal-monorepo-production.up.railway.app/predict";
export const SUBGRAPH_API_URL =
  "https://api.studio.thegraph.com/proxy/68853/ecowarp/version/latest";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export const CONTRACT_ADDRESS: Address = "0x0";

export const CONSTANT_ETH_USD_PRICE = 4000;

export const CONTRACT_ABI = [];
