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
import { Modal } from "@/components/ui/modal";
import { Fund } from "@/shared/constants/funds";
import {
  calculateGrowth,
  formatCurrency,
} from "@/shared/utils/growth-calculator";

const INITIAL_INVESTMENT = 100;
const PROJECTION_YEARS = 30;

interface GrowthProjectionModalProps {
  fund: Fund | null;
  onClose: () => void;
}

export function GrowthProjectionModal({
  fund,
  onClose,
}: GrowthProjectionModalProps) {
  const chartData = useMemo(() => {
    if (!fund) return [];
    return Array.from({ length: PROJECTION_YEARS + 1 }, (_, year) => ({
      year,
      value: Math.round(
        calculateGrowth(INITIAL_INVESTMENT, fund.avgAnnualReturn, year)
      ),
    }));
  }, [fund]);

  const finalValue = chartData.length
    ? chartData[chartData.length - 1].value
    : 0;

  if (!fund) return null;

  return (
    <Modal
      isOpen={!!fund}
      onClose={onClose}
      title={`${fund.ticker} — ${fund.name}`}
      className="max-w-2xl"
    >
      <div className="space-y-6">
        <div className="text-center rounded-[var(--radius-lg)] bg-primary-light p-6">
          <p className="text-sm text-text-secondary mb-1">
            {formatCurrency(INITIAL_INVESTMENT)} invested today could become
          </p>
          <p className="text-4xl font-bold text-primary">
            {formatCurrency(finalValue)}
          </p>
          <p className="text-sm text-text-secondary mt-1">
            in {PROJECTION_YEARS} years at {(fund.avgAnnualReturn * 100).toFixed(0)}% avg. annual return
          </p>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
            >
              <defs>
                <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00B964" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00B964" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0EC" />
              <XAxis
                dataKey="year"
                tick={{ fontSize: 12, fill: "#6B7280" }}
                tickLine={false}
                axisLine={{ stroke: "#E5E7EB" }}
                label={{
                  value: "Years",
                  position: "insideBottomRight",
                  offset: -5,
                  fontSize: 12,
                  fill: "#6B7280",
                }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#6B7280" }}
                tickLine={false}
                axisLine={{ stroke: "#E5E7EB" }}
                tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}`}
              />
              <Tooltip
                formatter={(value: number) => [formatCurrency(value), "Value"]}
                labelFormatter={(year) => `Year ${year}`}
                contentStyle={{
                  borderRadius: "0.75rem",
                  border: "1px solid #E5E7EB",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  fontSize: "0.875rem",
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#00B964"
                strokeWidth={2.5}
                fill="url(#growthGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <p className="text-xs text-text-secondary text-center">
          Based on historical average returns. Actual results may vary.
          Past performance does not guarantee future results.
        </p>
      </div>
    </Modal>
  );
}
