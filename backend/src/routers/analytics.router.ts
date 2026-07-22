import { Router, Request, Response } from "express";
import { authMiddleware, AuthRequest } from "../middlewares/auth.middleware";
import { prisma } from "../lib/prisma";
import { serverConfig } from "../config";

const router = Router();

router.get("/:slug", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { userId } = req as AuthRequest;
    const slug = req.params.slug as string;

    const link = await prisma.link.findFirst({
      where: { slug, userId },
      include: { _count: { select: { clicks: true } } },
    });

    if (!link) {
      return res.status(404).json({ success: false, message: "Link not found" });
    }

    const days = Math.min(90, Math.max(1, parseInt(req.query.days as string) || 7));
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const clicksByDay = await prisma.$queryRawUnsafe<{ day: Date; count: bigint }[]>(
      `SELECT DATE(clicked_at) as day, COUNT(*)::bigint as count
       FROM clicks WHERE link_id = $1 AND clicked_at >= $2
       GROUP BY DATE(clicked_at) ORDER BY day`,
      link.id, startDate
    );

    const trend: { date: string; clicks: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const dayStr = d.toISOString().split("T")[0];
      const found = clicksByDay.find((c) => {
        const cDate = new Date(c.day);
        cDate.setHours(0, 0, 0, 0);
        return cDate.getTime() === d.getTime();
      });
      trend.push({ date: dayStr, clicks: found ? Number(found.count) : 0 });
    }

    const referrers = await prisma.click.groupBy({
      by: ["referrer"], where: { linkId: link.id }, _count: { id: true },
      orderBy: { _count: { id: "desc" } }, take: 10,
    });
    const geography = await prisma.click.groupBy({
      by: ["country"], where: { linkId: link.id }, _count: { id: true },
      orderBy: { _count: { id: "desc" } }, take: 10,
    });
    const devices = await prisma.click.groupBy({
      by: ["device"], where: { linkId: link.id }, _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    });
    const browsers = await prisma.click.groupBy({
      by: ["browser"], where: { linkId: link.id }, _count: { id: true },
      orderBy: { _count: { id: "desc" } }, take: 10,
    });
    const recentClicks = await prisma.click.findMany({
      where: { linkId: link.id }, orderBy: { clickedAt: "desc" }, take: 20,
      select: { clickedAt: true, referrer: true, country: true, device: true, browser: true },
    });

    return res.json({
      success: true,
      link: { id: link.id, slug: link.slug, original: link.originalUrl, short: `${serverConfig.SHORT_BASE_URL}/${link.slug}`, totalClicks: link._count.clicks, status: link.status, passwordProtected: !!link.passwordHash },
      trend,
      referrers: referrers.map((r) => ({ referrer: r.referrer || "Direct", count: r._count.id })),
      geography: geography.map((g) => ({ country: g.country || "Unknown", count: g._count.id })),
      devices: devices.map((d) => ({ device: d.device || "Unknown", count: d._count.id })),
      browsers: browsers.map((b) => ({ browser: b.browser || "Unknown", count: b._count.id })),
      recentClicks: recentClicks.map((c) => ({ time: c.clickedAt.toISOString(), referrer: c.referrer || "Direct", country: c.country || "Unknown", device: c.device || "Unknown", browser: c.browser || "Unknown" })),
    });
  } catch (err) {
    console.error("[analytics] ERROR:", err);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

export default router;
