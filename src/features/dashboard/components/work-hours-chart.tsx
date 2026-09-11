import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  { day: "Sen 1", hours: 8 },
  { day: "Sel 2", hours: 10.5 },
  { day: "Rab 3", hours: 0, isHoliday: true },
  { day: "Kam 4", hours: 8 },
  { day: "Jum 5", hours: 9 },
  { day: "Sen 8", hours: 11 },
  { day: "Sel 9", hours: 8 },
];

interface TooltipPayload {
  payload?: { hours: number; isHoliday?: boolean };
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; payload: { isHoliday?: boolean } }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  const isHoliday = payload[0]?.payload?.isHoliday;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="font-semibold text-popover-foreground">{label}</p>
      {isHoliday ? (
        <p className="text-purple-500">Hari Libur</p>
      ) : (
        <p className="text-popover-foreground">
          {payload[0].value} jam kerja
          {payload[0].value > 8 && (
            <span className="ml-1 text-amber-500">
              (+{(payload[0].value - 8).toFixed(1)} lembur)
            </span>
          )}
        </p>
      )}
    </div>
  );
}

export default function WorkHoursChart() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Jam Kerja Harian</h3>
          <p className="text-xs text-muted-foreground">9 Sep 2026 — 2 minggu terakhir</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-4 rounded-sm bg-primary/80" />
            Normal
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-4 rounded-sm bg-amber-400" />
            Lembur
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 12]}
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted))", radius: 4 }} />
          <ReferenceLine
            y={8}
            stroke="hsl(var(--muted-foreground))"
            strokeDasharray="4 4"
            label={{ value: "8j", position: "right", fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
          />
          <Bar
            dataKey="hours"
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
            fill="hsl(var(--primary))"
            // Color bars differently for overtime
            label={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
