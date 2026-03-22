"use client";

import { useState } from "react";
import { BarChart3 } from "lucide-react";
import { FUNDS, Fund } from "@/shared/constants/funds";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GrowthProjectionModal } from "./growth-projection-modal";

const categoryLabel: Record<Fund["category"], string> = {
  index: "Index Fund",
  "broad-market": "Index Fund",
  crypto: "Crypto",
};

export function InvestmentOptionsSection() {
  const [selectedFund, setSelectedFund] = useState<Fund | null>(null);

  return (
    <section className="bg-surface-muted py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
            <BarChart3 className="h-7 w-7 text-primary" />
          </div>
          <h2 className="text-3xl sm:text-4xl text-text-primary mb-4">
            Choose How Their Money Grows
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto text-lg">
            Parents pick the investment that fits their goals — from broad
            market index funds to crypto.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {FUNDS.map((fund) => (
            <button
              key={fund.ticker}
              onClick={() => setSelectedFund(fund)}
              className="text-left cursor-pointer"
            >
              <Card className="h-full hover:shadow-card-hover transition-shadow">
                <CardContent>
                  <h3 className="text-xl font-bold text-primary mb-1">
                    {fund.ticker}
                  </h3>
                  <p className="font-semibold text-text-primary text-sm mb-3">
                    {fund.name}
                  </p>
                  <Badge className="mb-4">{categoryLabel[fund.category]}</Badge>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    {fund.description}
                  </p>
                </CardContent>
              </Card>
            </button>
          ))}
        </div>
      </div>

      <GrowthProjectionModal
        fund={selectedFund}
        onClose={() => setSelectedFund(null)}
      />
    </section>
  );
}
