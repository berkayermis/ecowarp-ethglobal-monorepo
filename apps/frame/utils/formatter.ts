import { Address } from "viem";

export function NumberFormatter({
  value,
  decimalScale,
  thousandSeparator,
}: {
  value: number;
  decimalScale: number;
  thousandSeparator: boolean;
}) {
  const formatter = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimalScale,
    maximumFractionDigits: decimalScale,
    useGrouping: thousandSeparator,
  });

  return formatter.format(value);
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
