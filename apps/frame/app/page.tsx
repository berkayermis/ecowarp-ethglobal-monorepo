import { validateCode } from "@/actions";
import styles from "./page.module.css";
import { getFrameMetadata } from "frog/next";
import type { Metadata } from "next";
import { Address } from "viem";
import Upload from "@/components/Upload";

export async function generateMetadata(): Promise<Metadata> {
  const url = "http://localhost:3000";
  const frameMetadata = await getFrameMetadata(`${url}/api`);
  return {
    other: frameMetadata,
  };
}

export default async function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  if (!searchParams?.code || !searchParams?.wallet_address) {
    return <main className={styles.main}>code missing</main>;
  }

  if (
    !searchParams?.name ||
    !searchParams?.description ||
    !searchParams?.unitPrice ||
    !searchParams?.supply ||
    !searchParams?.category
  ) {
    return <main className={styles.main}>metadata missing</main>;
  }

  const { isCodeValid, message } = await validateCode(
    searchParams?.code,
    searchParams?.wallet_address as Address
  );

  if (!isCodeValid) {
    return <main className={styles.main}>{message}</main>;
  }

  return (
    <main className={styles.main}>
      <Upload
        name={searchParams.name}
        description={searchParams.description}
        unitPrice={searchParams.unitPrice}
        supply={searchParams.supply}
        category={searchParams.category}
        code={searchParams.code}
        wallet_address={searchParams.wallet_address as Address}
      />
    </main>
  );
}
