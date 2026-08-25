import { Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { hashPassword, comparePassword } from "../utils/password";
import { signToken } from "../utils/jwt";
import { AuthRequest } from "../middlewares/auth.middleware";
import { BadRequestError, ConflictError, NotFoundError, UnauthorizedError } from "../utils/errors/app.error";
import type { Request } from "express";

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, email, password } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictError("A user with this email already exists");
    }

    const id = `usr_${crypto.randomUUID().slice(0, 8)}`;
    const passwordHash = await hashPassword(password);
    const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0891b2&color=fff&bold=true&size=128`;

    await prisma.user.create({
      data: { id, name, email, passwordHash, avatar },
    });

    const token = signToken({ userId: id, email });

    res.status(201).json({
      success: true,
      token,
      user: {
        id,
        name,
        email,
        avatar,
        bio: "",
        provider: "local",
        plan: "hacker",
        createdAt: new Date().toISOString().split("T")[0],
        linksCreated: 0,
        totalClicks: 0,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const passwordMatch = await comparePassword(password, user.passwordHash);
    if (!passwordMatch) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const token = signToken({ userId: user.id, email: user.email });

    const [linksCount, clicksResult] = await Promise.all([
      prisma.link.count({ where: { userId: user.id } }),
      prisma.click.aggregate({
        _count: { id: true },
        where: { link: { userId: user.id } },
      }),
    ]);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        provider: user.provider,
        plan: user.plan,
        createdAt: user.createdAt.toISOString().split("T")[0],
        linksCreated: linksCount,
        totalClicks: clicksResult._count.id,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req as AuthRequest;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, avatar: true, bio: true, provider: true, plan: true, createdAt: true },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const [linksCount, clicksResult] = await Promise.all([
      prisma.link.count({ where: { userId } }),
      prisma.click.aggregate({
        _count: { id: true },
        where: { link: { userId } },
      }),
    ]);

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        provider: user.provider,
        plan: user.plan,
        createdAt: user.createdAt.toISOString().split("T")[0],
        linksCreated: linksCount,
        totalClicks: clicksResult._count.id,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req as AuthRequest;
    const { name, bio } = req.body;

    const data: Record<string, string> = {};
    if (name !== undefined) {
      data.name = name;
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { provider: true } });
      if (user?.provider === "local") {
        data.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0891b2&color=fff&bold=true&size=128`;
      }
    }
    if (bio !== undefined) {
      data.bio = bio;
    }

    if (Object.keys(data).length > 0) {
      await prisma.user.update({ where: { id: userId }, data });
    }

    res.json({ success: true, message: "Profile updated" });
  } catch (err) {
    next(err);
  }
}

export async function changePassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req as AuthRequest;
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const match = await comparePassword(currentPassword, user.passwordHash);
    if (!match) {
      throw new BadRequestError("Current password is incorrect");
    }

    const passwordHash = await hashPassword(newPassword);
    await prisma.user.update({ where: { id: userId }, data: { passwordHash } });

    res.json({ success: true, message: "Password changed" });
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true },
    });

    if (user) {
      const resetToken = crypto.randomUUID();
      const resetTokenExp = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await prisma.user.update({
        where: { id: user.id },
        data: { resetToken, resetTokenExp },
      });

      console.log(`[PasswordReset] Token for ${email}: ${resetToken}`);
    }

    res.json({
      success: true,
      message: "If an account with that email exists, a password reset link has been sent.",
    });
  } catch (err) {
    next(err);
  }
}
