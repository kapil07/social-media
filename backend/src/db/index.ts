import { Pool } from "pg";
import { env } from "../config/env.js";
import { drizzle } from "drizzle-orm/node-postgres";

export const pool = new Pool({
    connectionString: env.DATABASE_URL,
    max:10,
    connectionTimeoutMillis: 5_000,
    idleTimeoutMillis: 30_000
});

export const db = drizzle({client: pool})