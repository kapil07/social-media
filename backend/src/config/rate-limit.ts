
import { rateLimit } from "express-rate-limit";

export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,

  standardHeaders: "draft-8",
  legacyHeaders: false,

  handler: (_req, res, _next, options) => {
    res.status(options.statusCode).json({
      error: {
        code: "RATE_LIMIT_EXCEEDED",
        message: "Too many requests. Please try again later.",
        requestId: res.locals.requestId ?? null,
      },
    });
  },

  // Keep health checks available for monitoring.
  skip: (req) => req.path.startsWith("/health/"),
});
