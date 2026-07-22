import { Progress } from "@/components/ui/progress";

const GeographySection = ({
  geography,
}: {
  geography: { country: string; count: number }[];
}) => {
  const total = geography.reduce((sum, c) => sum + c.count, 0) || 1;
  const topCountries = geography.slice(0, 5);

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-heading font-semibold text-foreground">
        Geography
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Map placeholder */}
        <div className="rounded-sm border border-border bg-card flex items-center justify-center min-h-[220px] relative overflow-hidden">
          <div className="absolute inset-0 dot-grid opacity-30" />
          <div className="text-center z-10">
            <p className="font-mono text-xs text-muted-foreground mb-1">World Map</p>
            <p className="font-mono text-[10px] text-muted-foreground/60">{geography.length} countries reached</p>
          </div>
        </div>

        {/* Top countries */}
        <div className="rounded-sm border border-border bg-card p-4 space-y-3">
          <p className="font-mono text-[11px] text-muted-foreground">Top Countries</p>
          {topCountries.length === 0 ? (
            <p className="text-xs font-mono text-muted-foreground">No location data yet.</p>
          ) : (
            topCountries.map((c) => (
              <div key={c.country} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-foreground">{c.country}</span>
                  <span className="text-xs font-mono text-muted-foreground">
                    {c.count.toLocaleString()}
                  </span>
                </div>
                <Progress value={(c.count / total) * 100} className="h-1.5 bg-secondary [&>div]:bg-primary" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default GeographySection;
