export interface Fund {
  ticker: string;
  name: string;
  description: string;
  avgAnnualReturn: number; // decimal, e.g., 0.10 for 10%
  category: "index" | "broad-market" | "crypto";
}

export const FUNDS: Fund[] = [
  { ticker: "VOO", name: "S&P 500 Index", description: "Tracks the 500 largest US companies. A popular, diversified starting point for long-term investing.", avgAnnualReturn: 0.10, category: "index" },
  { ticker: "VTI", name: "Total US Stock Market", description: "Covers nearly every publicly traded US company — small, mid, and large.", avgAnnualReturn: 0.098, category: "broad-market" },
  { ticker: "VT", name: "Total World Stock Market", description: "Invests in companies worldwide, including the US, Europe, and Asia.", avgAnnualReturn: 0.085, category: "broad-market" },
  { ticker: "QQQ", name: "Nasdaq-100 Index", description: "Focuses on the 100 largest non-financial Nasdaq companies, heavy in tech.", avgAnnualReturn: 0.12, category: "index" },
  { ticker: "SCHB", name: "Schwab US Broad Market", description: "Similar to VTI — a low-cost way to own a broad slice of the US market.", avgAnnualReturn: 0.098, category: "broad-market" },
  { ticker: "BTC", name: "Bitcoin", description: "The original cryptocurrency. High growth potential but also higher volatility.", avgAnnualReturn: 0.15, category: "crypto" },
  { ticker: "ETH", name: "Ethereum", description: "A leading crypto platform powering smart contracts and decentralized apps.", avgAnnualReturn: 0.14, category: "crypto" },
];

export function getFundByTicker(ticker: string): Fund | undefined {
  return FUNDS.find((f) => f.ticker === ticker);
}
