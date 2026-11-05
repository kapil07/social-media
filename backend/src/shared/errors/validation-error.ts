import { AppError } from "./app-error.js";

export type ValidationDetail = {
  field: string;
  message: string;
};

export class ValidationError extends AppError {
  readonly details: ValidationDetail[];

  constructor(details: ValidationDetail[]) {
    super("VALIDATION_ERROR", 400, "Request validation failed");

    this.details = details;
  }
}
