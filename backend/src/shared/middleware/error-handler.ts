import type { ErrorRequestHandler } from "express";
import { AppError } from "../errors/app-error.js";
import { logger } from "../logger.js";
import { ValidationError } from "../errors/validation-error.js";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const requestId = res.locals.requestId as string | undefined;

  if (res.headersSent) {
    logger.error(
      { err, requestId },
      "Error occurred after response headers were sent",
    );
    return;
  }

  // Handle oversized request bodies.
  if (
    typeof err === "object" &&
    err !== null &&
    "type" in err &&
    err.type === "entity.too.large"
  ) {
    logger.warn(
      { requestId, statusCode: 413 },
      "Request body exceeds the allowed size",
    );

    res.status(413).json({
      error: {
        code: "PAYLOAD_TOO_LARGE",
        message: "Request body exceeds the allowed size",
        requestId: requestId ?? null,
      },
    });

    return;
  }

  // Handle malformed JSON request bodies.
  if (
    typeof err === "object" &&
    err !== null &&
    "type" in err &&
    err.type === "entity.parse.failed"
  ) {
    logger.warn({ requestId, statusCode: 400 }, "Malformed request body");

    res.status(400).json({
      error: {
        code: "INVALID_REQUEST_BODY",
        message: "Request body contains invalid JSON",
        requestId: requestId ?? null,
      },
    });

    return;
  }

  const isValidationError = err instanceof ValidationError;
  const isAppError = err instanceof AppError;

  const statusCode = isAppError ? err.statusCode : 500;

  const code = isAppError ? err.code : "INTERNAL_SERVER_ERROR";

  const message =
    isAppError && err.isOperational
      ? err.message
      : "An unexpected error occurred";

  if (statusCode >= 500 || !isAppError) {
    logger.error({ err, requestId, statusCode, code }, "Request failed");
  } else {
    logger.warn({ requestId, statusCode, code }, "Request rejected");
  }

  const response = {
    error: {
      code,
      message,
      ...(isValidationError ? { details: err.details } : {}),
      requestId: requestId ?? null,
    },
  };

  res.status(statusCode).json(response);
};
