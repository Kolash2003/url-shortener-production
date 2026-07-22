import { Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middlewares/auth.middleware";
import { generateSlug } from "../utils/id";
import { hashPassword } from "../utils/password";
import { BadRequestError, ConflictError, NotFoundError } from "../utils/errors/app.error";
import { serverConfig } from "../config";
import type { Request } from "express";

export async function listLinks(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req as AuthRequest;
    const q = req.query as Record<string, string>;
    const { search, status, tag, sort, order = "desc", page = "1", limit = "20" } = q;

    const pageNum = Math.max(1, parseInt(page || "1"));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit || "20")));
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = { userId };

    if (status) where.status = status;
    if (search) {
      where.OR = [
        { originalUrl: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
        { title: { contains: search, mode: "insensitive" } },
      ];
    }
    if (tag) {
      where.linkTags = { some: { tag: { name: tag } } };
    }

    const orderBy: Record<string, string> = {};
    if (sort === "clicks") {
      orderBy.clicks = order === "asc" ? "asc" : "desc";
    } else {
      orderBy[sort === "slug" ? "slug" : "createdAt"] = order === "asc" ? "asc" : "desc";
    }

    const [links, total] = await Promise.all([
      prisma.link.findMany({
        where: where as any,
        orderBy,
        skip,
        take: limitNum,
        include: {
          linkTags: { include: { tag: true } },
          _count: { select: { clicks: true } },
        },
      }),
      prisma.link.count({ where: where as any }),
    ]);

    const mapped = links.map((l) => ({
      id: l.id,
      original: l.originalUrl,
      short: `${serverConfig.SHORT_BASE_URL}/${l.slug}`,
      slug: l.slug,
      clicks: l._count.clicks,
      created: l.createdAt.toISOString().split("T")[0],
      expires: l.expiresAt ? l.expiresAt.toISOString().split("T")[0] : "—",
      status: l.status,
      tags: l.linkTags.map((lt) => lt.tag.name),
      favicon: (() => {
        try {
          return new URL(l.originalUrl).hostname;
        } catch {
          return "";
        }
      })(),
      passwordProtected: !!l.passwordHash,
    }));

    res.json({
      success: true,
      links: mapped,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function createLink(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req as AuthRequest;
    const { originalUrl, slug, title, password, expiresAt, redirectType, tags } = req.body;

    const finalSlug = slug || generateSlug();

    const existing = await prisma.link.findUnique({ where: { slug: finalSlug } });
    if (existing) {
      if (slug) throw new ConflictError("This slug is already taken");
      // If auto-generated slug collides (extremely unlikely), retry approach would go here
      throw new ConflictError("Slug collision, please try again");
    }

    const link = await prisma.link.create({
      data: {
        id: `lnk_${crypto.randomUUID().slice(0, 8)}`,
        userId,
        originalUrl,
        slug: finalSlug,
        title,
        passwordHash: password ? await hashPassword(password) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        redirectType: redirectType || "301",
        ...(tags && tags.length > 0
          ? {
              linkTags: {
                create: await Promise.all(
                  tags.map(async (tagName: string) => {
                    const tag = await prisma.tag.upsert({
                      where: { name_userId: { name: tagName, userId } },
                      update: {},
                      create: { id: `tag_${crypto.randomUUID().slice(0, 8)}`, name: tagName, userId },
                    });
                    return { tagId: tag.id };
                  })
                ),
              },
            }
          : {}),
      },
    });

    res.status(201).json({
      success: true,
      link: {
        id: link.id,
        original: link.originalUrl,
        short: `${serverConfig.SHORT_BASE_URL}/${link.slug}`,
        slug: link.slug,
        clicks: 0,
        created: link.createdAt.toISOString().split("T")[0],
        expires: link.expiresAt ? link.expiresAt.toISOString().split("T")[0] : "—",
        status: link.status,
        tags: tags || [],
        favicon: (() => {
          try {
            return new URL(link.originalUrl).hostname;
          } catch {
            return "";
          }
        })(),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getLink(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req as AuthRequest;
    const slug = req.params.slug as string;

    const link = await prisma.link.findFirst({
      where: { slug, userId },
      include: {
        linkTags: { include: { tag: true } },
        _count: { select: { clicks: true } },
      },
    });

    if (!link) throw new NotFoundError("Link not found");

    res.json({
      success: true,
      link: {
        id: link.id,
        original: link.originalUrl,
        short: `${serverConfig.SHORT_BASE_URL}/${link.slug}`,
        slug: link.slug,
        title: link.title,
        clicks: link._count.clicks,
        created: link.createdAt.toISOString().split("T")[0],
        expires: link.expiresAt ? link.expiresAt.toISOString().split("T")[0] : "—",
        status: link.status,
        redirectType: link.redirectType,
        utmSource: link.utmSource,
        utmMedium: link.utmMedium,
        utmCampaign: link.utmCampaign,
        utmTerm: link.utmTerm,
        utmContent: link.utmContent,
        tags: link.linkTags.map((lt) => lt.tag.name),
        favicon: (() => {
          try {
            return new URL(link.originalUrl).hostname;
          } catch {
            return "";
          }
        })(),
        passwordProtected: !!link.passwordHash,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateLink(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req as AuthRequest;
    const slug = req.params.slug as string;
    const { originalUrl, newSlug, title, password, expiresAt, redirectType, tags } = req.body;

    const existing = await prisma.link.findFirst({ where: { slug, userId } });
    if (!existing) throw new NotFoundError("Link not found");

    const data: Record<string, unknown> = {};

    if (originalUrl !== undefined) data.originalUrl = originalUrl;
    if (title !== undefined) data.title = title === null ? null : title;
    if (expiresAt !== undefined) data.expiresAt = expiresAt === null ? null : new Date(expiresAt);
    if (redirectType !== undefined) data.redirectType = redirectType;
    if (newSlug !== undefined && newSlug !== slug) {
      const slugExists = await prisma.link.findUnique({ where: { slug: newSlug } });
      if (slugExists) throw new ConflictError("This slug is already taken");
      data.slug = newSlug;
    }
    if (password !== undefined) {
      data.passwordHash = password === null ? null : await hashPassword(password);
    }

    if (tags !== undefined) {
      await prisma.linkTag.deleteMany({ where: { linkId: existing.id } });
      if (tags.length > 0) {
        await Promise.all(
          tags.map(async (tagName: string) => {
            const tag = await prisma.tag.upsert({
              where: { name_userId: { name: tagName, userId } },
              update: {},
              create: { id: `tag_${crypto.randomUUID().slice(0, 8)}`, name: tagName, userId },
            });
            await prisma.linkTag.create({ data: { linkId: existing.id, tagId: tag.id } });
          })
        );
      }
    }

    if (Object.keys(data).length > 0) {
      await prisma.link.update({ where: { id: existing.id }, data: data as any });
    }

    res.json({ success: true, message: "Link updated" });
  } catch (err) {
    next(err);
  }
}

export async function deleteLink(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req as AuthRequest;
    const slug = req.params.slug as string;

    const link = await prisma.link.findFirst({ where: { slug, userId } });
    if (!link) throw new NotFoundError("Link not found");

    await prisma.link.delete({ where: { id: link.id } });

    res.json({ success: true, message: "Link deleted" });
  } catch (err) {
    next(err);
  }
}

export async function bulkDeleteLinks(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req as AuthRequest;
    const { ids } = req.body;

    await prisma.link.deleteMany({
      where: { id: { in: ids }, userId },
    });

    res.json({ success: true, message: `${ids.length} links deleted` });
  } catch (err) {
    next(err);
  }
}

export async function duplicateLink(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req as AuthRequest;
    const slug = req.params.slug as string;

    const original = await prisma.link.findFirst({
      where: { slug, userId },
      include: { linkTags: { include: { tag: true } } },
    });
    if (!original) throw new NotFoundError("Link not found");

    const newSlug = generateSlug();
    const dup = await prisma.link.create({
      data: {
        id: `lnk_${crypto.randomUUID().slice(0, 8)}`,
        userId,
        originalUrl: original.originalUrl,
        slug: newSlug,
        title: original.title,
        redirectType: original.redirectType,
        status: "Active",
      },
    });

    res.status(201).json({
      success: true,
      link: {
        id: dup.id,
        original: dup.originalUrl,
        short: `${serverConfig.SHORT_BASE_URL}/${dup.slug}`,
        slug: dup.slug,
        clicks: 0,
        created: dup.createdAt.toISOString().split("T")[0],
        expires: "—",
        status: "Active",
        tags: [],
        favicon: (() => {
          try {
            return new URL(dup.originalUrl).hostname;
          } catch {
            return "";
          }
        })(),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function deactivateLinks(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req as AuthRequest;
    const { ids } = req.body;

    await prisma.link.updateMany({
      where: { id: { in: ids }, userId },
      data: { status: "Expired" },
    });

    res.json({ success: true, message: `${ids.length} links deactivated` });
  } catch (err) {
    next(err);
  }
}

export async function addTagToLinks(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req as AuthRequest;
    const { ids, tag: tagName } = req.body;

    const tag = await prisma.tag.upsert({
      where: { name_userId: { name: tagName, userId } },
      update: {},
      create: { id: `tag_${crypto.randomUUID().slice(0, 8)}`, name: tagName, userId },
    });

    // Add tag to all specified links (skip duplicates)
    for (const linkId of ids) {
      await prisma.linkTag.upsert({
        where: { linkId_tagId: { linkId, tagId: tag.id } },
        update: {},
        create: { linkId, tagId: tag.id },
      });
    }

    res.json({ success: true, message: `Tag "${tagName}" added to ${ids.length} links` });
  } catch (err) {
    next(err);
  }
}
