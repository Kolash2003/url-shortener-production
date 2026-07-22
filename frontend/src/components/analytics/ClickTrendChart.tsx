import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const ranges = [
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
];

const ClickTrendChart = ({
  trend,
  days,
  onDaysChange,
}: {
  trend: { date: string; clicks: number }[];
  days: number;
  onDaysChange: (days: number) => void;
}) => {
  const [active, setActive] = useState(ranges.findIndex((r) => r.days === days) === -1 ? 0 : ranges.findIndex((r) => r.days === days));

  const data = trend.map((d) => ({
    ...d,
    date: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  }));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-heading font-semibold text-foreground">
          Click Trend
        </h2>
        <div className="flex gap-1">
          {ranges.map((r, i) => (
            <button
              key={r.label}
              onClick={() => {
                setActive(i);
                onDaysChange(r.days);
              }}
              className={`rounded-sm px-2.5 py-1 text-[11px] font-mono transition-colors ${
                i === active
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-sm border border-border bg-card p-4">
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(0 0% 18%)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fill: "hsl(0 0% 55%)", fontSize: 10, fontFamily: "JetBrains Mono" }}
              axisLine={{ stroke: "hsl(0 0% 18%)" }}
              tickLine={false}
              interval={Math.max(0, Math.floor(data.length / 7) - 1)}
            />
            <YAxis
              tick={{ fill: "hsl(0 0% 55%)", fontSize: 10, fontFamily: "JetBrains Mono" }}
              axisLine={false}
              tickLine={false}
              width={36}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                background: "hsl(0 0% 8%)",
                border: "1px solid hsl(0 0% 18%)",
                borderRadius: 4,
                fontSize: 12,
                fontFamily: "JetBrains Mono",
                color: "hsl(0 0% 94%)",
              }}
            />
            <Line
              type="monotone"
              dataKey="clicks"
              stroke="hsl(187 100% 50%)"
              strokeWidth={2}
              dot={{ r: 2, fill: "hsl(187 100% 50%)" }}
              activeDot={{ r: 4, fill: "hsl(187 100% 50%)" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ClickTrendChart;
