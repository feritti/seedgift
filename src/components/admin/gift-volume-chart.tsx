"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { formatCurrency } from "@/shared/utils/growth-calculator";

export function AdminGiftVolumeChart({
  data,
}: {
  data: { day: string; count: number; grossCents: number }[];
}) {
  const chartData = data.map((d) => ({
    day: d.day,
    gross: d.grossCents / 100,
    count: d.count,
  }));

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="gift-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00B964" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#00B964" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#F0F0EC" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 11, fill: "#6B7280" }}
            tickFormatter={(d: string) => d.slice(5)}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#6B7280" }}
            width={44}
            tickFormatter={(v: number) => `$${v}`}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value, name) =>
              name === "gross"
                ? [formatCurrency(Number(value)), "Volume"]
                : [String(value), "Gifts"]
            }
            labelFormatter={(d) => String(d)}
            contentStyle={{
              borderRadius: 8,
              border: "1px solid #F0F0EC",
              fontSize: 12,
            }}
          />
          <Area
            type="monotone"
            dataKey="gross"
            stroke="#00B964"
            strokeWidth={2}
            fill="url(#gift-fill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
