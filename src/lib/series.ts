import type { Asset, Order } from "@/lib/types";

/**
 * Linear congruential generator seeded from the price, so every asset's
 * sparkline and order book are identical on the server and the client.
 * A plain Math.random() here would hydrate-mismatch.
 */
function lcg(seed: number) {
  let state = seed;
  return () => {
    state = (state * 9301 + 49297) % 233280;
    return state / 233280;
  };
}

/** Builds a deterministic price history walking back from `start`. */
export function buildSpark(start: number, points = 30, volatility = 0.06): number[] {
  const series = [start];
  let current = start;
  let state = start * 9301 + 49297;

  for (let i = 1; i < points; i++) {
    state = (state * 9301 + 49297) % 233280;
    const drift = state / 233280 - 0.5;
    current = Math.max(start * 0.7, current * (1 + drift * volatility));
    series.push(Number(current.toFixed(2)));
  }

  return series;
}

const TRADERS = [
  "fan_0x4a",
  "clipdao",
  "creatorfund",
  "streamwhale",
  "guild_42",
  "watchparty",
  "angel_arc",
  "fan_0xae",
];

/** Synthesises eight levels of depth either side of the asset's mid price. */
export function buildOrderBook(asset: Asset): { bids: Order[]; asks: Order[] } {
  const mid = asset.pricePerToken;
  const random = lcg(Math.round(mid * 1000));
  const bids: Order[] = [];
  const asks: Order[] = [];

  for (let level = 1; level <= 8; level++) {
    const bidPrice = Number((mid * (1 - level * 0.0035 - random() * 0.001)).toFixed(2));
    const bidQty = Math.max(2, Math.round(20 + random() * 240));
    bids.push({
      id: `bid_${asset.id}_${level}`,
      side: "buy",
      price: bidPrice,
      qty: bidQty,
      total: Number((bidPrice * bidQty).toFixed(2)),
      trader: TRADERS[Math.floor(random() * TRADERS.length)],
    });

    const askPrice = Number((mid * (1 + level * 0.0035 + random() * 0.001)).toFixed(2));
    const askQty = Math.max(2, Math.round(20 + random() * 240));
    asks.push({
      id: `ask_${asset.id}_${level}`,
      side: "sell",
      price: askPrice,
      qty: askQty,
      total: Number((askPrice * askQty).toFixed(2)),
      trader: TRADERS[Math.floor(random() * TRADERS.length)],
    });
  }

  return { bids, asks };
}
