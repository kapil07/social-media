import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]),
  PORT: z.preprocess(
    (value) => (value === undefined ? "4000" : value),
    z
      .string()
      .regex(/^\d+$/, "PORT must contain digits only")
      .transform(Number)
      .pipe(z.number().int().min(1).max(65535)),
  ),
  LOG_LEVEL: z.enum([
    "fatal",
    "error",
    "warn",
    "info",
    "debug",
    "trace",
    "silent",
  ]),
  CORS_ORIGINS: z
    .string()
    .default("http://localhost:5173")
    .transform((value) =>
      value
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean),
    )
    .pipe(
      z
        .array(
          z.url().refine(
            (value) => {
              const url = new URL(value);

              return (
                (url.protocol === "http:" || url.protocol === "https:") &&
                url.origin === value
              );
            },
            {
              message:
                "Each CORS origin must be an HTTP(S) origin without a path or trailing slash",
            },
          ),
        )
        .min(1),
    ),
  DATABASE_URL: z.url().refine(
    (value) => {
      const url = new URL(value);

      return url.protocol === "postgres:" || url.protocol === "postgresql:";
    },
    {
      message: "DATABASE_URL must be a PostgreSQL connection URL",
    },
  ),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error(
    "Invalid environment variables:",
    z.prettifyError(parsedEnv.error),
  );

  process.exit(1);
}

export const env = parsedEnv.data;

export type Env = z.infer<typeof envSchema>;
