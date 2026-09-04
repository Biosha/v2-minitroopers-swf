import { NextFunction, Request, Response } from "express";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  // Express requires 4-argument signature for error middleware
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
) => {
  console.error(err);
  res.status(500).json({
    status: "error",
    message: "Internal server error",
  });
};
