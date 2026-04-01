"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Fund } from "@/shared/constants/funds";
import {
  calculateGrowth,
  formatCurrency,
} from "@/shared/utils/growth-calculator";

const INITIAL_INVESTMENT = 100;
const PROJECTION_YEARS = 30;

export function GrowthChart({ fund }: { fund: Fund }) {
  const chartData = useMemo(
    () =>
      Array.from({ length: PROJECTION_YEARS + 1 }, (_, year) => ({
        year,
        value: Math.round(
          calculateGrowth(INITIAL_INVESTMENT, fund.avgAnnualReturn, year)
        ),
      })),
    [fund.avgAnnualReturn]
  );

  const finalValue = chartData[chartData.length - 1].value;

  return (
    <Card>
      <CardContent>
        <h3 className="text-sm font-semibold text-text-primary mb-4 font-[family-name:var(--font-body)]">
          Projected Growth
        </h3>

        <div className="text-center rounded-[var(--radius-md)] bg-primary-light p-4 mb-4">
          <p className="text-xs text-text-secondary mb-0.5">
            {formatCurrency(INITIAL_INVESTMENT)} gift could become
          </p>
          <p className="text-2xl font-bold text-primary">
            {formatCurrency(finalValue)}
          </p>
          <p className="text-xs text-text-secondary mt-0.5">
            in {PROJECTION_YEARS} years at{" "}
            {(fund.avgAnnualReturn * 100).toFixed(0)}% avg. return
          </p>
        </div>

        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 5, right: 5, left: -10, bottom: 5 }}
            >
              <defs>
                <linearGradient
                  id="growthGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#00B964" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00B964" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0EC" />
              <XAxis
                dataKey="year"
                tick={{ fontSize: 11, fill: "#6B7280" }}
                tickLine={false}
                axisLine={{ stroke: "#E5E7EB" }}
                label={{
                  value: "Years",
                  position: "insideBottomRight",
                  offset: -5,
                  fontSize: 11,
                  fill: "#6B7280",
                }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#6B7280" }}
                tickLine={false}
                axisLine={{ stroke: "#E5E7EB" }}
                tickFormatter={(v) =>
                  `$${v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}`
                }
              />
              <Tooltip
                formatter={(value) => [
                  formatCurrency(Number(value)),
                  "Value",
                ]}
                labelFormatter={(year) => `Year ${year}`}
                contentStyle={{
                  borderRadius: "0.75rem",
                  border: "1px solid #E5E7EB",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  fontSize: "0.8125rem",
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#00B964"
                strokeWidth={2}
                fill="url(#growthGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <p className="text-[11px] text-text-secondary text-center mt-3 leading-tight">
          Based on historical average returns. Actual results may vary.
        </p>
      </CardContent>
    </Card>
  );
}
