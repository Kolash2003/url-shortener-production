import { useState } from "react";
import { ArrowLeft, Copy, ExternalLink, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { SHORT_BASE_URL, SHORT_DOMAIN } from "@/lib/config";
import { copyToClipboard } from "@/lib/utils";
import type { AnalyticsLink } from "@/pages/LinkAnalytics";

const AnalyticsHeader = ({
  link,
  geography,
  days,
}: {
  link: AnalyticsLink;
  geography: { country: string; count: number }[];
  days: number;
}) => {
  const [showFull, setShowFull] = useState(false);

  const avgPerDay = days > 0 ? Math.round(link.totalClicks / days) : 0;
  const countryCount = geography.length;

  const stats = [
    { label: "Total Clicks", value: link.totalClicks.toLocaleString() },
    { label: "Countries", value: countryCount.toLocaleString() },
    { label: "Avg/Day", value: avgPerDay.toLocaleString() },
  ];

  const copy = async () => {
    const ok = await copyToClipboard(link.short);
    toast.success(ok ? "Copied to clipboard" : "Failed to copy");
  };

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
        <Link to="/dashboard" className="hover:text-foreground transition-colors flex items-center gap-1">
          <ArrowLeft size={14} />
          Dashboard
        </Link>
        <ChevronRight size={12} />
        <Link to="/dashboard/links" className="hover:text-foreground transition-colors">
          My Links
        </Link>
        <ChevronRight size={12} />
        <span className="text-foreground">{SHORT_DOMAIN}/{link.slug}</span>
      </div>

      {/* Short URL badge */}
      <div className="flex items-center gap-3">
        <Badge
          variant="outline"
          className="font-mono text-lg px-4 py-1.5 text-primary border-primary/30 cursor-pointer hover:bg-primary/10"
          onClick={copy}
        >
          {SHORT_DOMAIN}/{link.slug}
          <Copy size={14} className="ml-2" />
        </Badge>
        <a
          href={`${SHORT_BASE_URL}/${link.slug}`}
          target="_blank"
          rel="noreferrer"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ExternalLink size={16} />
        </a>
      </div>

      {/* Original URL */}
      <div className="text-xs font-mono text-muted-foreground">
        <span className={showFull ? "" : "max-w-[400px] truncate inline-block align-bottom"}>
          {link.original}
        </span>
        <button
          onClick={() => setShowFull(!showFull)}
          className="ml-2 text-primary hover:underline"
        >
          {showFull ? "collapse" : "show full"}
        </button>
      </div>

      {/* Stat chips */}
      <div className="flex flex-wrap gap-2">
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex items-center gap-2 rounded-sm border border-border bg-secondary px-3 py-1.5"
          >
            <span className="font-mono text-sm font-bold text-foreground">{s.value}</span>
            <span className="text-[10px] text-muted-foreground">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnalyticsHeader;
