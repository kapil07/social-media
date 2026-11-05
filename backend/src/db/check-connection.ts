
import { pool } from "./index.js";

async function checkConnection(): Promise<void> {
  try {
    const result = await pool.query<{
      database: string;
      user: string;
      server_version: string;
    }>(`
      SELECT
        current_database() AS database,
        current_user AS user,
        current_setting('server_version') AS server_version
    `);

    console.log("PostgreSQL connection successful:", result.rows[0]);
  } catch (error) {
    console.error("PostgreSQL connection failed.");
    console.error(error instanceof Error ? error : "Unknown error");
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

await checkConnection();
