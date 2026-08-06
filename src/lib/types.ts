export type AssetType = "channel" | "ugc" | "video" | "series" | "music" | "book" | "film" | "game";

export type OrderSide = "buy" | "sell";

export interface Creator {
  id: string;
  slug: string;
  name: string;
  handle: string;
  audienceReach: number;
  followers: number;
  verified: boolean;
  categories: string[];
  base: string;
  yearStarted: number;
  primaryPlatform: string;
  bio: string;
  totalAssets: number;
  totalValueLocked: number;
  /** Tailwind gradient stops used for the creator's cover treatment. */
  accent: string;
}

export interface Asset {
  id: string;
  creatorId: string;
  type: AssetType;
  title: string;
  ticker: string;
  releaseYear: number;
  /** Raw CSS gradient for the artwork tile. */
  cover: string;
  coverAccent: string[];
  totalSupply: number;
  available: number;
  pricePerToken: number;
  previousPrice: number;
  change24h: number;
  royaltyShare: number;
  durationMonths: number;
  activity: number;
  activityLabel: string;
  monthlyRevenuePool: number;
  perks: string[];
  revenueStreams: string[];
  description: string;
  payoutCadence: string;
  issuer: string;
  /** 30-point price history driving the sparkline. */
  spark: number[];
}

export interface Order {
  id: string;
  side: OrderSide;
  price: number;
  qty: number;
  total: number;
  trader: string;
}

export interface Trade {
  id: string;
  side: OrderSide;
  price: number;
  qty: number;
  time: string;
}

export interface OrderBook {
  bids: Order[];
  asks: Order[];
  trades: Trade[];
}

export interface Holding {
  assetId: string;
  qty: number;
  avgCost: number;
}

export type NoticeTone = "success" | "warn" | "info";

export interface Notice {
  id: string;
  tone: NoticeTone;
  title: string;
  body: string;
}
