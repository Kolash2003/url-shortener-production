import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const palette = [
  "hsl(187 100% 50%)",
  "hsl(170 100% 45%)",
  "hsl(45 100% 55%)",
  "hsl(0 0% 40%)",
  "hsl(280 100% 65%)",
  "hsl(340 100% 60%)",
];

interface ChartItem {
  name: string;
  value: number;
  color: string;
}

const DonutChart = ({
  data,
  title,
}: {
  data: ChartItem[];
  title: string;
}) => (
  <div className="rounded-sm border border-border bg-card p-4 space-y-3">
    <p className="font-mono text-[11px] text-muted-foreground">{title}</p>
    <div className="flex items-center gap-4">
      <div className="w-[120px] h-[120px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={35}
              outerRadius={55}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-1.5 flex-1">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-2">
            <span
              className="inline-block h-2 w-2 rounded-sm shrink-0"
              style={{ background: d.color }}
            />
            <span className="text-xs font-mono text-foreground flex-1">{d.name}</span>
            <span className="text-[11px] font-mono text-muted-foreground">
              {d.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const DevicesBrowsers = ({
  devices,
  browsers,
}: {
  devices: { device: string; count: number }[];
  browsers: { browser: string; count: number }[];
}) => {
  const deviceData: ChartItem[] = devices.map((d, i) => ({
    name: d.device,
    value: d.count,
    color: palette[i % palette.length],
  }));

  const browserData: ChartItem[] = browsers.map((b, i) => ({
    name: b.browser,
    value: b.count,
    color: palette[i % palette.length],
  }));

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-heading font-semibold text-foreground">
        Devices & Browsers
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DonutChart data={deviceData} title="Device Type" />
        <DonutChart data={browserData} title="Browser" />
      </div>
    </div>
  );
};

export default DevicesBrowsers;
