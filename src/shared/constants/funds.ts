export interface Fund {
  ticker: string;
  name: string;
  avgAnnualReturn: number; // decimal, e.g., 0.10 for 10%
  category: "index" | "broad-market" | "crypto";
}

export const FUNDS: Fund[] = [
  { ticker: "VOO", name: "S&P 500 Index", avgAnnualReturn: 0.10, category: "index" },
  { ticker: "VTI", name: "Total US Stock Market", avgAnnualReturn: 0.098, category: "broad-market" },
  { ticker: "VT", name: "Total World Stock Market", avgAnnualReturn: 0.085, category: "broad-market" },
  { ticker: "QQQ", name: "Nasdaq-100 Index", avgAnnualReturn: 0.12, category: "index" },
  { ticker: "SCHB", name: "Schwab US Broad Market", avgAnnualReturn: 0.098, category: "broad-market" },
  { ticker: "BTC", name: "Bitcoin", avgAnnualReturn: 0.15, category: "crypto" },
  { ticker: "ETH", name: "Ethereum", avgAnnualReturn: 0.14, category: "crypto" },
];

export function getFundByTicker(ticker: string): Fund | undefined {
  return FUNDS.find((f) => f.ticker === ticker);
}
