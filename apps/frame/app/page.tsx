import styles from "./page.module.css";
import { getFrameMetadata } from "frog/next";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const url = "http://localhost:3000";
  const frameMetadata = await getFrameMetadata(`${url}/api`);
  return {
    other: frameMetadata,
  };
}

export default function Home() {
  return <main className={styles.main}>hello ethglobal</main>;
}
