import { Router } from "express";
import { prisma } from "../lib/prisma";
import type { Request, Response } from "express";
import crypto from "crypto";

const router = Router();

async function lookupGeo(ip: string | null): Promise<{ country: string | null; city: string | null } | null> {
  if (!ip) return null;
  if (ip === "127.0.0.1" || ip.startsWith("192.168.") || ip.startsWith("10.")) return null;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);
  try {
    const res = await fetch(`https://ipapi.co/${ip}/json/`, { signal: controller.signal });
    const data = await res.json();
    if (data.error) return null;
    return { country: data.country_name || null, city: data.city || null };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

router.get("/:slug", async (req: Request, res: Response) => {
  const slug = req.params.slug as string;

  const link = await prisma.link.findFirst({ where: { slug, status: "Active" } });

  if (!link) {
    return res.status(404).json({ success: false, message: "Link not found or expired" });
  }

  if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
    await prisma.link.update({ where: { id: link.id }, data: { status: "Expired" } });
    return res.status(410).json({ success: false, message: "This link has expired" });
  }

  const userAgent = (req.headers["user-agent"] as string) || null;
  const referrer = req.headers.referer || req.headers.referrer || null;

  // Parse user agent for device/browser/OS
  let device = "Unknown";
  let browser = "Unknown";
  let os = "Unknown";

  if (userAgent) {
    const ua = (userAgent as string).toLowerCase();
    if (ua.includes("mobile") || ua.includes("android")) device = "Mobile";
    else if (ua.includes("tablet") || ua.includes("ipad")) device = "Tablet";
    else device = "Desktop";

    if (ua.includes("firefox")) browser = "Firefox";
    else if (ua.includes("edg")) browser = "Edge";
    else if (ua.includes("chrome")) browser = "Chrome";
    else if (ua.includes("safari")) browser = "Safari";
    else browser = "Other";

    if (ua.includes("windows")) os = "Windows";
    else if (ua.includes("mac")) os = "macOS";
    else if (ua.includes("linux")) os = "Linux";
    else if (ua.includes("android")) os = "Android";
    else if (ua.includes("ios") || ua.includes("iphone")) os = "iOS";
    else os = "Other";
  }

  const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.ip || null;

  // Record click asynchronously (don't block redirect)
  (async () => {
    try {
      const click = await prisma.click.create({
        data: {
          id: `clk_${crypto.randomUUID().slice(0, 8)}`,
          linkId: link.id,
          ip,
          userAgent,
          referrer: typeof referrer === "string" ? referrer : null,
          device,
          browser,
          os,
        },
      });
      const geo = await lookupGeo(ip);
      if (geo?.country || geo?.city) {
        await prisma.click.update({
          where: { id: click.id },
          data: { country: geo.country, city: geo.city },
        });
      }
    } catch (err) {
      console.error("Click tracking error:", err);
    }
  })();

  return res.redirect(link.redirectType === "302" ? 302 : 301, link.originalUrl);
});

export default router;
