
import type { RequestHandler } from "express";
import type { z } from "zod";
import { ValidationError } from "../errors/validation-error.js";

type RequestSchemas = {
  body?: z.ZodType;
  params?: z.ZodType;
  query?: z.ZodType;
};

export function validate(schemas: RequestSchemas): RequestHandler {
  return (req, _res, next) => {
    const details: Array<{ field: string; message: string }> = [];

    for (const part of ["body", "params", "query"] as const) {
      const schema = schemas[part];

      if (!schema) {
        continue;
      }

      const result = schema.safeParse(req[part]);

      if (!result.success) {
        for (const issue of result.error.issues) {
          const path = issue.path.map(String).join(".");
          details.push({
            field: path ? `${part}.${path}` : part,
            message: issue.message,
          });
        }

        continue;
      }

      // Use normalized, validated body data downstream.
      if (part === "body") {
        req.body = result.data;
      }
    }

    if (details.length > 0) {
      next(new ValidationError(details));
      return;
    }

    next();
  };
}
