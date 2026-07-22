import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ReferrersTable = ({
  referrers,
  totalClicks,
}: {
  referrers: { referrer: string; count: number }[];
  totalClicks: number;
}) => {
  const total = totalClicks || 1;

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-heading font-semibold text-foreground">
        Traffic Sources
      </h2>
      <div className="rounded-sm border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="font-mono text-[11px] text-muted-foreground">Source</TableHead>
              <TableHead className="font-mono text-[11px] text-muted-foreground text-right">Clicks</TableHead>
              <TableHead className="font-mono text-[11px] text-muted-foreground text-right">% of Total</TableHead>
              <TableHead className="font-mono text-[11px] text-muted-foreground w-[120px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {referrers.length === 0 ? (
              <TableRow className="border-border hover:bg-transparent">
                <TableCell colSpan={4} className="text-center font-mono text-xs text-muted-foreground py-8">
                  No referrer data yet.
                </TableCell>
              </TableRow>
            ) : (
              referrers.map((r) => {
                const pct = (r.count / total) * 100;
                return (
                  <TableRow key={r.referrer} className="border-border hover:bg-secondary/40">
                    <TableCell className="font-mono text-xs text-foreground">{r.referrer}</TableCell>
                    <TableCell className="font-mono text-xs text-foreground text-right">
                      {r.count.toLocaleString()}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground text-right">
                      {pct.toFixed(1)}%
                    </TableCell>
                    <TableCell>
                      <div className="h-1.5 rounded-sm bg-secondary overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-sm"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ReferrersTable;
