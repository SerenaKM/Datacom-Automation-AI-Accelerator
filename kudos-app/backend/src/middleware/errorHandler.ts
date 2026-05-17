import { Request, Response, NextFunction } from "express";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error("Error:", err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      statusCode: err.statusCode,
    });
  }

  // Prisma errors
  if (err.name === "PrismaClientValidationError") {
    return res.status(400).json({
      error: "Invalid input data",
      statusCode: 400,
    });
  }

  if (err.name === "PrismaClientKnownRequestError") {
    return res.status(400).json({
      error: "Database error",
      statusCode: 400,
    });
  }

  // Default error
  res.status(500).json({
    error: "Internal server error",
    statusCode: 500,
  });
};
