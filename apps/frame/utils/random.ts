import { randomBytes } from "crypto";

export async function generateSecureRandomString(
  length: number
): Promise<string> {
  const array = randomBytes(length);
  return Array.from(array, (byte) => byte.toString(36))
    .join("")
    .substring(0, length);
}
