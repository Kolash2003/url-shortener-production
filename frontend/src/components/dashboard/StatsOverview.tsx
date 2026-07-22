import { Link2, MousePointerClick, Zap, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useLinks } from "@/context/LinksContext";

const StatsOverview = () => {
  const { links } = useLinks();

  const totalLinks = links.length;
  const totalClicks = links.reduce((sum, l) => sum + l.clicks, 0);
  const activeLinks = links.filter((l) => l.status === "Active").length;
  const expiredLinks = links.filter((l) => l.status === "Expired").length;

  const stats = [
    { label: "Total Links", value: totalLinks.toLocaleString(), icon: Link2 },
    { label: "Total Clicks", value: totalClicks.toLocaleString(), icon: MousePointerClick },
    { label: "Active Links", value: activeLinks.toLocaleString(), icon: Zap },
    { label: "Expired Links", value: expiredLinks.toLocaleString(), icon: Clock },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((s) => (
        <Card
          key={s.label}
          className="flex items-center gap-3 border-border bg-card p-4 hover:glow-border transition-shadow"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-border bg-secondary text-primary">
            <s.icon size={16} />
          </div>
          <div className="min-w-0">
            <p className="font-mono text-xl font-bold leading-tight text-foreground">
              {s.value}
            </p>
            <p className="text-[11px] text-muted-foreground leading-tight">
              {s.label}
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default StatsOverview;
