import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { api } from "@/lib/api";
import { SHORT_DOMAIN } from "@/lib/config";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

export interface LinkItem {
  id: string;
  original: string;
  short: string;
  slug: string;
  clicks: number;
  created: string;
  status: "Active" | "Expired" | "Scheduled";
  tags: string[];
  sparkline: number[];
  expires: string;
  favicon: string;
  passwordProtected?: boolean;
}

function randomSparkline(): number[] {
  return Array.from({ length: 7 }, () => Math.floor(Math.random() * 20));
}

interface LinkResponse {
  id: string;
  original: string;
  short: string;
  slug: string;
  clicks: number;
  created: string;
  status: string;
  tags?: string[];
  sparkline?: number[];
  expires?: string;
  favicon?: string;
  passwordProtected?: boolean;
}

function mapLink(l: LinkResponse): LinkItem {
  return {
    id: l.id,
    original: l.original,
    short: l.short,
    slug: l.slug,
    clicks: l.clicks,
    created: l.created,
    status: l.status as LinkItem["status"],
    tags: l.tags || [],
    sparkline: l.sparkline || randomSparkline(),
    expires: l.expires || "—",
    favicon: l.favicon || "",
    passwordProtected: l.passwordProtected || false,
  };
}

interface LinksContextType {
  links: LinkItem[];
  loading: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  addLink: (originalUrl: string, slug: string, extra?: Record<string, unknown>) => Promise<void>;
  deleteLink: (id: string) => void;
  deleteLinks: (ids: string[]) => Promise<void>;
  duplicateLink: (id: string) => Promise<void>;
  updateLink: (id: string, updates: Partial<LinkItem>) => Promise<void>;
  deactivateLinks: (ids: string[]) => Promise<void>;
  addTagToLinks: (ids: string[], tag: string) => Promise<void>;
  refreshLinks: () => Promise<void>;
}

const LinksContext = createContext<LinksContextType | null>(null);

export const useLinks = () => {
  const ctx = useContext(LinksContext);
  if (!ctx) throw new Error("useLinks must be used within LinksProvider");
  return ctx;
};

export const LinksProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchLinks = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const data = await api.get<{ success: boolean; links: LinkResponse[] }>("/links?limit=100");
      setLinks(data.links.map(mapLink));
    } catch {
      setLinks([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) fetchLinks();
  }, [isAuthenticated, fetchLinks]);

  const addLink = async (originalUrl: string, slug: string, extra?: Record<string, unknown>) => {
    const optimisticId = `optimistic-${slug}`;
    const optimisticLink: LinkItem = {
      id: optimisticId,
      original: originalUrl,
      short: `${SHORT_DOMAIN}/${slug}`,
      slug,
      clicks: 0,
      created: new Date().toISOString(),
      status: "Active",
      tags: (extra?.tags as string[]) || [],
      sparkline: randomSparkline(),
      expires: "—",
      favicon: "",
    };
    setLinks((prev) => [optimisticLink, ...prev]);

    try {
      const body: Record<string, unknown> = { originalUrl, slug, ...extra };
      const data = await api.post<{ success: boolean; link: LinkResponse }>("/links", body);
      const newLink = mapLink(data.link);
      setLinks((prev) => prev.map((l) => l.id === optimisticId ? newLink : l));
    } catch (err: unknown) {
      setLinks((prev) => prev.filter((l) => l.id !== optimisticId));
      toast.error(err instanceof Error ? err.message : "Failed to create link");
      throw err;
    }
  };

  const deleteLink = async (id: string) => {
    const link = links.find((l) => l.id === id);
    if (!link) return;
    await api.delete(`/links/${link.slug}`);
    setLinks((prev) => prev.filter((l) => l.id !== id));
  };

  const deleteLinks = async (ids: string[]) => {
    await api.post("/links/bulk-delete", { ids });
    const idSet = new Set(ids);
    setLinks((prev) => prev.filter((l) => !idSet.has(l.id)));
  };

  const duplicateLink = async (id: string) => {
    try {
      const link = links.find((l) => l.id === id);
      if (!link) return;
      const data = await api.post<{ success: boolean; link: LinkResponse }>(`/links/${link.slug}/duplicate`);
      setLinks((prev) => {
        const dup = mapLink(data.link);
        const idx = prev.findIndex((l) => l.id === id);
        const next = [...prev];
        next.splice(idx + 1, 0, dup);
        return next;
      });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to duplicate link");
    }
  };

  const updateLink = async (id: string, updates: Partial<LinkItem>) => {
    try {
      const link = links.find((l) => l.id === id);
      if (!link) return;
      const body: Record<string, unknown> = {};
      if (updates.original) body.originalUrl = updates.original;
      if (updates.slug) body.newSlug = updates.slug;
      if (updates.tags) body.tags = updates.tags;
      if ((updates as Record<string, unknown>).password !== undefined) {
        body.password = (updates as Record<string, unknown>).password;
      }
      await api.put(`/links/${link.slug}`, body);
      setLinks((prev) => prev.map((l) => (l.id === id ? { ...l, ...updates } : l)));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update link");
    }
  };

  const deactivateLinks = async (ids: string[]) => {
    try {
      await api.post("/links/deactivate", { ids });
      const idSet = new Set(ids);
      setLinks((prev) => prev.map((l) => (idSet.has(l.id) ? { ...l, status: "Expired" as const } : l)));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to deactivate links");
    }
  };

  const addTagToLinks = async (ids: string[], tag: string) => {
    try {
      await api.post("/links/add-tag", { ids, tag });
      const idSet = new Set(ids);
      setLinks((prev) =>
        prev.map((l) =>
          idSet.has(l.id) && !l.tags.includes(tag) ? { ...l, tags: [...l.tags, tag] } : l,
        ),
      );
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to add tag");
    }
  };

  return (
    <LinksContext.Provider
      value={{
        links,
        loading,
        searchQuery,
        setSearchQuery,
        addLink,
        deleteLink,
        deleteLinks,
        duplicateLink,
        updateLink,
        deactivateLinks,
        addTagToLinks,
        refreshLinks: fetchLinks,
      }}
    >
      {children}
    </LinksContext.Provider>
  );
};
