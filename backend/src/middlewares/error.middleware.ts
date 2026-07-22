import { NextFunction, Request, Response } from "express";

export const appErrorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const statusCode = (err as any)?.statusCode || 500;
  const message = (err as any)?.message || String(err || "Unknown error");

  console.error(`[Error ${statusCode}]`, message);

  if (!res.headersSent) {
    res.status(statusCode).json({
      success: false,
      message: statusCode === 500 ? "Internal Server Error" : message,
    });
  }
};

export const genericErrorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error("[Fatal Error]", err);

  if (!res.headersSent) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
