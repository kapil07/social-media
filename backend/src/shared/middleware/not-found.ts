
import type { RequestHandler } from "express";
import { AppError } from "../errors/app-error.js";

export const notFoundMiddleware: RequestHandler = (
  req,
  _res,
  next,
) => {
  next(
    new AppError(
      `Route ${req.method} ${req.path} not found`,
      404,
      "ROUTE_NOT_FOUND",
    ),
  );
};
