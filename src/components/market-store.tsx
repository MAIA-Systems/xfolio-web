"use client";

import * as React from "react";

import { assets as seedAssets } from "@/lib/data";
import { formatClockTime } from "@/lib/format";
import { buildOrderBook } from "@/lib/series";
import type { Asset, Holding, Notice, NoticeTone, OrderBook, OrderSide } from "@/lib/types";

const STARTING_CASH = 5000;
const NOTICE_TTL_MS = 4500;
const LIMIT_FILL_DELAY_MS = 1400;
const TICK_INTERVAL_MS = 4000;

type Books = Record<string, OrderBook>;

interface MarketStore {
  cash: number;
  holdings: Holding[];
  assets: Asset[];
  books: Books;
  notices: Notice[];
  buy: (assetId: string, qty: number, price: number) => void;
  sell: (assetId: string, qty: number, price: number) => void;
  placeLimit: (assetId: string, side: OrderSide, qty: number, price: number) => void;
  dismissNotice: (id: string) => void;
  resetDemo: () => void;
}

const MarketStoreContext = React.createContext<MarketStore | null>(null);

function seedBooks(): Books {
  const books: Books = {};
  for (const asset of seedAssets) {
    const { bids, asks } = buildOrderBook(asset);
    books[asset.id] = { bids, asks, trades: [] };
  }
  return books;
}

const randomId = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 8)}`;

export function MarketStoreProvider({ children }: { children: React.ReactNode }) {
  const [cash, setCash] = React.useState(STARTING_CASH);
  const [holdings, setHoldings] = React.useState<Holding[]>([]);
  const [assets, setAssets] = React.useState<Asset[]>(seedAssets);
  const [books, setBooks] = React.useState<Books>(seedBooks);
  const [notices, setNotices] = React.useState<Notice[]>([]);

  const notify = React.useCallback((notice: { tone: NoticeTone; title: string; body: string }) => {
    const id = randomId("n");
    setNotices((current) => [...current, { ...notice, id }]);
    window.setTimeout(() => {
      setNotices((current) => current.filter((entry) => entry.id !== id));
    }, NOTICE_TTL_MS);
  }, []);

  const dismissNotice = React.useCallback((id: string) => {
    setNotices((current) => current.filter((entry) => entry.id !== id));
  }, []);

  /** Records a fill on the tape and re-prices the asset off the traded price. */
  const settleTrade = React.useCallback(
    (assetId: string, side: OrderSide, qty: number, price: number) => {
      setBooks((current) => {
        const book = current[assetId];
        const trade = {
          id: randomId("tr"),
          side,
          price,
          qty,
          time: formatClockTime(),
        };
        return {
          ...current,
          [assetId]: { ...book, trades: [trade, ...book.trades].slice(0, 30) },
        };
      });

      setAssets((current) =>
        current.map((asset) =>
          asset.id === assetId
            ? {
                ...asset,
                previousPrice: asset.pricePerToken,
                pricePerToken: Number(price.toFixed(2)),
                change24h: Number((((price - asset.spark[0]) / asset.spark[0]) * 100).toFixed(2)),
                spark: [...asset.spark.slice(1), Number(price.toFixed(2))],
                available:
                  side === "buy" ? Math.max(0, asset.available - qty) : asset.available + qty,
              }
            : asset,
        ),
      );
    },
    [],
  );

  const buy = React.useCallback(
    (assetId: string, qty: number, price: number) => {
      const cost = qty * price;
      if (cost > cash) {
        notify({
          tone: "warn",
          title: "Insufficient demo funds",
          body: `Need ${cost.toFixed(2)} USD but balance is ${cash.toFixed(2)}.`,
        });
        return;
      }

      setCash((current) => Number((current - cost).toFixed(2)));
      setHoldings((current) => {
        const index = current.findIndex((holding) => holding.assetId === assetId);
        if (index === -1) return [...current, { assetId, qty, avgCost: price }];

        // Blend the new lot into the existing position's average cost.
        const existing = current[index];
        const nextQty = existing.qty + qty;
        const nextAvg = (existing.qty * existing.avgCost + qty * price) / nextQty;
        const next = [...current];
        next[index] = { assetId, qty: nextQty, avgCost: Number(nextAvg.toFixed(4)) };
        return next;
      });

      settleTrade(assetId, "buy", qty, price);

      const asset = assets.find((entry) => entry.id === assetId);
      notify({
        tone: "success",
        title: "Purchase confirmed",
        body: `${qty} × ${asset?.ticker ?? assetId} at ${price.toFixed(2)}`,
      });
    },
    [assets, cash, notify, settleTrade],
  );

  const sell = React.useCallback(
    (assetId: string, qty: number, price: number) => {
      const holding = holdings.find((entry) => entry.assetId === assetId);
      if (!holding || holding.qty < qty) {
        notify({
          tone: "warn",
          title: "Not enough tokens",
          body: "You don't hold enough tokens for this sell.",
        });
        return;
      }

      const proceeds = qty * price;
      setCash((current) => Number((current + proceeds).toFixed(2)));
      setHoldings((current) =>
        current
          .map((entry) => (entry.assetId === assetId ? { ...entry, qty: entry.qty - qty } : entry))
          .filter((entry) => entry.qty > 0),
      );

      settleTrade(assetId, "sell", qty, price);

      const asset = assets.find((entry) => entry.id === assetId);
      notify({
        tone: "success",
        title: "Sale settled",
        body: `Sold ${qty} × ${asset?.ticker ?? assetId} for ${proceeds.toFixed(2)}`,
      });
    },
    [assets, holdings, notify, settleTrade],
  );

  /** Rests the order on the book, then fills it after a short delay. */
  const placeLimit = React.useCallback(
    (assetId: string, side: OrderSide, qty: number, price: number) => {
      const orderId = randomId("ord");

      setBooks((current) => {
        const book = current[assetId];
        const order = {
          id: orderId,
          side,
          price,
          qty,
          total: Number((price * qty).toFixed(2)),
          trader: "you",
        };

        if (side === "buy") {
          const bids = [...book.bids, order].sort((a, b) => b.price - a.price);
          return { ...current, [assetId]: { ...book, bids } };
        }

        const asks = [...book.asks, order].sort((a, b) => a.price - b.price);
        return { ...current, [assetId]: { ...book, asks } };
      });

      notify({
        tone: "info",
        title: "Limit order placed",
        body: `${side === "buy" ? "Buy" : "Sell"} ${qty} @ ${price.toFixed(2)}`,
      });

      window.setTimeout(() => {
        setBooks((current) => {
          const book = current[assetId];
          if (side === "buy") {
            return {
              ...current,
              [assetId]: { ...book, bids: book.bids.filter((bid) => bid.id !== orderId) },
            };
          }
          return {
            ...current,
            [assetId]: { ...book, asks: book.asks.filter((ask) => ask.id !== orderId) },
          };
        });

        if (side === "buy") buy(assetId, qty, price);
        else sell(assetId, qty, price);
      }, LIMIT_FILL_DELAY_MS);
    },
    [buy, sell, notify],
  );

  const resetDemo = React.useCallback(() => {
    setCash(STARTING_CASH);
    setHoldings([]);
    setAssets(seedAssets);
    setBooks(seedBooks());
    notify({ tone: "info", title: "Demo reset", body: "Cash, holdings and books restored." });
  }, [notify]);

  // Nudges one random asset every few seconds so the tape looks alive.
  React.useEffect(() => {
    const interval = window.setInterval(() => {
      setAssets((current) => {
        const index = Math.floor(Math.random() * current.length);
        const asset = current[index];
        const drift = (Math.random() - 0.5) * 0.012;
        const price = Number((asset.pricePerToken * (1 + drift)).toFixed(2));

        const next = [...current];
        next[index] = {
          ...asset,
          previousPrice: asset.pricePerToken,
          pricePerToken: price,
          change24h: Number((((price - asset.spark[0]) / asset.spark[0]) * 100).toFixed(2)),
          spark: [...asset.spark.slice(1), price],
        };
        return next;
      });
    }, TICK_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, []);

  const value = React.useMemo<MarketStore>(
    () => ({
      cash,
      holdings,
      assets,
      books,
      notices,
      buy,
      sell,
      placeLimit,
      dismissNotice,
      resetDemo,
    }),
    [cash, holdings, assets, books, notices, buy, sell, placeLimit, dismissNotice, resetDemo],
  );

  return <MarketStoreContext.Provider value={value}>{children}</MarketStoreContext.Provider>;
}

export function useMarketStore(): MarketStore {
  const store = React.useContext(MarketStoreContext);
  if (!store) throw new Error("useMarketStore must be used inside MarketStoreProvider");
  return store;
}
