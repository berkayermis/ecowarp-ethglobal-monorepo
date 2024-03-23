import { Client } from "pg";

export async function supabaseClient(): Promise<Client | null> {
  try {
    return new Client({
      connectionString: process.env.SUPABASE_CONNECTION_STRING as string,
      ssl: {
        rejectUnauthorized: false,
      },
    });
  } catch (e) {
    console.error(e);
    return null;
  }
}
