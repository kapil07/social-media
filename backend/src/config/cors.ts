import cors, { type CorsOptions } from "cors";

import { env } from "./env.js";

const allowedOrigins = new Set(env.CORS_ORIGINS);

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }

    callback(null, false);
  },

  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Request-Id",
  ],

  optionsSuccessStatus: 204,
};

export const corsMiddleware = cors(corsOptions);