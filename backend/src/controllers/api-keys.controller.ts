import { Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middlewares/auth.middleware";
import { generateApiKey } from "../utils/id";
import { NotFoundError } from "../utils/errors/app.error";
import type { Request } from "express";
import { hashPassword } from "../utils/password";

export async function listApiKeys(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req as AuthRequest;

    const keys = await prisma.apiKey.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      keys: keys.map((k) => ({
        id: k.id,
        name: k.name,
        prefix: k.prefix,
        lastUsedAt: k.lastUsedAt?.toISOString() || null,
        createdAt: k.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    next(err);
  }
}

export async function createApiKey(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req as AuthRequest;
    const { name } = req.body;

    const rawKey = generateApiKey();
    const keyHash = await hashPassword(rawKey);
    const prefix = rawKey.slice(0, 8);

    const key = await prisma.apiKey.create({
      data: {
        id: `apk_${crypto.randomUUID().slice(0, 8)}`,
        userId,
        name,
        keyHash,
        prefix,
      },
    });

    res.status(201).json({
      success: true,
      key: {
        id: key.id,
        name: key.name,
        key: rawKey, // Only returned at creation time
        prefix: key.prefix,
        createdAt: key.createdAt.toISOString(),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteApiKey(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req as AuthRequest;
    const id = req.params.id as string;

    const key = await prisma.apiKey.findFirst({ where: { id, userId } });

    if (!key) throw new NotFoundError("API key not found");

    await prisma.apiKey.delete({ where: { id } });

    res.json({ success: true, message: "API key deleted" });
  } catch (err) {
    next(err);
  }
}
