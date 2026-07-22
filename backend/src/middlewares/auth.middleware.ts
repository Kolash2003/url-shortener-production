import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { prisma } from "../lib/prisma";
import { comparePassword } from "../utils/password";
import { UnauthorizedError } from "../utils/errors/app.error";

export interface AuthRequest extends Request {
  userId: string;
  userEmail: string;
}

export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization as string | undefined;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new UnauthorizedError("Missing or invalid authorization header"));
  }

  const token = authHeader.split(" ")[1];

  // Try API key auth first (keys start with snp_)
  if (token.startsWith("snp_")) {
    apiKeyAuth(req, next).catch(next);
    return;
  }

  // Fall back to JWT
  try {
    const payload = verifyToken(token);
    (req as AuthRequest).userId = payload.userId;
    (req as AuthRequest).userEmail = payload.email;
    next();
  } catch {
    next(new UnauthorizedError("Invalid or expired token"));
  }
}

async function apiKeyAuth(req: Request, next: NextFunction): Promise<void> {
  const key = req.headers.authorization!.split(" ")[1];

  const keys = await prisma.apiKey.findMany({
    select: { id: true, userId: true, keyHash: true },
  });

  for (const apiKey of keys) {
    const match = await comparePassword(key, apiKey.keyHash);
    if (match) {
      await prisma.apiKey.update({
        where: { id: apiKey.id },
        data: { lastUsedAt: new Date() },
      });
      (req as AuthRequest).userId = apiKey.userId;
      (req as AuthRequest).userEmail = "";
      return next();
    }
  }

  return next(new UnauthorizedError("Invalid API key"));
}

export function optionalAuthMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization as string | undefined;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      if (token.startsWith("snp_")) {
        apiKeyAuth(req, () => {}).catch(() => {});
        return next();
      }
      const payload = verifyToken(token);
      (req as AuthRequest).userId = payload.userId;
      (req as AuthRequest).userEmail = payload.email;
    } catch {
      // Token invalid, continue unauthenticated
    }
  }

  next();
}
