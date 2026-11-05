import express from "express";
import type { Request, Response } from "express";
import { env } from "./config/env.js";
import { logger } from "./shared/logger.js";
import { requestIdMiddleware } from "./shared/middleware/request-id.js";
import { pinoHttp } from "pino-http";
import { notFoundMiddleware } from "./shared/middleware/not-found.js";
import { errorHandler } from "./shared/middleware/error-handler.js";
import type { Server } from "node:http";
import helmet from "helmet";
import { corsMiddleware } from "./config/cors.js";
import { apiRateLimiter } from "./config/rate-limit.js";
import { pool } from "./db/index.js";

const app = express();

app.use(helmet());
app.use(corsMiddleware);
app.use(express.json({ limit: "100kb" }));

app.use(
  express.urlencoded({
    extended: false,
    limit: "10kb",
  }),
);
app.use(requestIdMiddleware);

app.use(
  pinoHttp({
    logger,

    genReqId: (_req, res) => {
      const requestId = res.getHeader("X-Request-ID");

      if (typeof requestId !== "string") {
        throw new Error("Request ID middleware must run before pino-http");
      }

      return requestId;
    },

    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0] ?? "/",
        };
      },

      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(apiRateLimiter);

// Liveness: the process can respond to requests.
app.get("/health/live", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "alive",
  });
});

app.get("/health/ready", async (_req: Request, res: Response) => {
  try {
    await pool.query("SELECT 1");
    return res.status(200).json({
      status: "ready",
    });
  } catch (error) {
    logger.error(
      { err: error },
      "Readiness check failed: PostgreSQL unavailable",
    );
  }

  return res.status(503).json({
    status: "not_ready",
  });
});

app.use(notFoundMiddleware);
app.use(errorHandler);

const server: Server = app.listen(env.PORT, () => {
  logger.info(
    { port: env.PORT, nodeEnv: env.NODE_ENV },
    "Server started successfully",
  );
});

let isShuttingDown = false;

function shutdown(signal: string): void {
  if (isShuttingDown) {
    logger.warn({ signal }, "Shutdown already in progress");
    return;
  }

  isShuttingDown = true;

  logger.info({ signal }, "Graceful shutdown started");

  server.close(async (error) => {
    if (error) {
      logger.error({ err: error }, "HTTP server close failed");
      process.exitCode = 1;
    } else {
      logger.info("HTTP server closed successfully");
    }

    try {
      await pool.end();
      logger.info("PostgreSQL pool closed successfully");
    } catch (poolError) {
      logger.error({ err: poolError }, "PostgreSQL pool close failed");
      process.exitCode = 1;
    }
  });

  // Safety timeout: don't let shutdown hang indefinitely.
  const shutdownTimeout = setTimeout(() => {
    logger.error("Graceful shutdown timed out");

    process.exitCode = 1;
    server.closeAllConnections();
  }, 10_000);

  shutdownTimeout.unref();

  server.once("close", () => {
    clearTimeout(shutdownTimeout);
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
