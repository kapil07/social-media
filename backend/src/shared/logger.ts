import pino from "pino";

import { env } from "../config/env.js";

export const logger = pino({
  transport:
    env.NODE_ENV === "development"
      ? {
          target: "pino-pretty",
        }
      : undefined,
  level: env.LOG_LEVEL,
  base: {
    service: "social-media-backend",
  },
  redact: {
    paths: [
      "password",
      "*.password",
      "token",
      "*.token",
      "accessToken",
      "*.accessToken",
      "refreshToken",
      "*.refreshToken",
      "authorization",
      "req.headers.authorization",
      "req.headers.cookie",
      "headers.authorization",
      "headers.cookie",
    ],
    censor: "[REDACTED]",
  },
});
