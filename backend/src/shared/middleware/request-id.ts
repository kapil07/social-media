import { randomUUID } from "node:crypto";
import type { Request, Response, NextFunction } from "express";

const REQUEST_ID_HEADER = "x-request-id";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function requestIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const suppliedId = req.get(REQUEST_ID_HEADER);

  const requestId =
    suppliedId && UUID_PATTERN.test(suppliedId) ? suppliedId : randomUUID();

  res.setHeader(REQUEST_ID_HEADER, requestId);
  res.locals.requestId = requestId;

  next();
}
