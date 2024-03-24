import { CONSTANT_ETH_USD_PRICE } from "@/constant";
import { Address } from "viem";

export function NumberFormatter({
  value,
  decimalScale,
  thousandSeparator,
  convertToUSD,
}: {
  value: number;
  decimalScale: number;
  thousandSeparator: boolean;
  convertToUSD?: boolean;
}) {
  const formatter = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimalScale,
    maximumFractionDigits: decimalScale,
    useGrouping: thousandSeparator,
  });

  return convertToUSD
    ? `$${parseFloat(formatter.format(value)) * CONSTANT_ETH_USD_PRICE}`
    : formatter.format(value);
}

export const extractParamsFromUrl = async (
  url: string
): Promise<{
  extractedCode: string | null;
  wallet_address: Address | null;
}> => {
  const queryString = url.split("?")[1];
  const urlParams = new URLSearchParams(queryString);

  const code = urlParams.get("code");
  const wallet_address = urlParams.get("wallet_address") as Address;

  return { extractedCode: code, wallet_address };
};
