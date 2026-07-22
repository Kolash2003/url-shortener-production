import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { comparePassword } from "../utils/password";
import { UnauthorizedError } from "../utils/errors/app.error";
import { AuthRequest } from "./auth.middleware";

export async function apiKeyAuthMiddleware(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization as string | undefined;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(new UnauthorizedError("Missing or invalid authorization header"));
    }

    const key = authHeader.split(" ")[1];

    if (!key.startsWith("snp_")) {
      return next();
    }

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
  } catch (err) {
    next(err);
  }
}