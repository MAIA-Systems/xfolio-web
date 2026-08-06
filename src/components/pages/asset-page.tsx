"use client";

import { Activity, CircleCheck, Coins, Info, Lock, Minus, Plus, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { AssetCover } from "@/components/asset-cover";
import { useMarketStore } from "@/components/market-store";
import { Sparkline } from "@/components/sparkline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCreatorById } from "@/lib/data";
import { formatCompact, formatCurrency } from "@/lib/format";
import type { OrderSide } from "@/lib/types";

const PLATFORM_FEE_RATE = 0.005;

export function AssetPage({ assetId }: { assetId: string }) {
  const { assets, books, cash, holdings, buy, sell, placeLimit } = useMarketStore();

  const asset = assets.find((entry) => entry.id === assetId);
  const book = books[assetId];
  const holding = holdings.find((entry) => entry.assetId === assetId);

  const [side, setSide] = React.useState<OrderSide>("buy");
  const [orderType, setOrderType] = React.useState<"market" | "limit">("market");
  const [qty, setQty] = React.useState(10);
  const [limitPrice, setLimitPrice] = React.useState(asset?.pricePerToken ?? 0);
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  if (!asset || !book) {
    return (
      <div className="rounded-xl border border-border bg-card p-12 text-center">
        <p className="text-muted-foreground">Asset not found.</p>
        <Link href="/" className="mt-3 inline-block text-sm text-primary hover:underline">
          Back to discover
        </Link>
      </div>
    );
  }

  const positive = asset.change24h >= 0;
  const bestBid = book.bids[0]?.price ?? asset.pricePerToken * 0.995;
  const bestAsk = book.asks[0]?.price ?? asset.pricePerToken * 1.005;
  const spread = bestAsk - bestBid;
  const mid = (bestAsk + bestBid) / 2;

  const soldPct = ((asset.totalSupply - asset.available) / asset.totalSupply) * 100;
  const annualPerToken = (asset.monthlyRevenuePool * 12) / asset.totalSupply;
  const annualYieldPct = (annualPerToken / asset.pricePerToken) * 100;

  const executionPrice = orderType === "market" ? asset.pricePerToken : limitPrice;
  const subtotal = qty * executionPrice;
  const fee = subtotal * PLATFORM_FEE_RATE;
  const net = side === "buy" ? subtotal + fee : subtotal - fee;

  const affordable = Math.floor(cash / executionPrice);
  const maxBuyable = Math.min(asset.available, affordable);
  const owned = holding?.qty ?? 0;
  const maxQty = side === "buy" ? maxBuyable : owned;

  const creator = getCreatorById(asset.creatorId);
  const creatorHref = creator ? `/creator/${creator.slug}` : "/";

  const disabled =
    qty <= 0 ||
    qty > maxQty ||
    (orderType === "limit" && (limitPrice <= 0 || !Number.isFinite(limitPrice)));

  function submitOrder() {
    if (orderType === "market") setConfirmOpen(true);
    else placeLimit(asset!.id, side, qty, limitPrice);
  }

  function confirmMarketOrder() {
    if (side === "buy") buy(asset!.id, qty, asset!.pricePerToken);
    else sell(asset!.id, qty, asset!.pricePerToken);
    setConfirmOpen(false);
  }

  const bids = book.bids.slice(0, 8);
  const asks = book.asks.slice(0, 8).reverse();
  const maxDepth = Math.max(...bids.map((o) => o.qty), ...asks.map((o) => o.qty), 1);

  const stats = [
    {
      k: "Revenue share",
      v: `${asset.royaltyShare.toFixed(1)}%`,
      sub: `${asset.durationMonths / 12} yr term`,
    },
    { k: "Est. annual yield", v: `${annualYieldPct.toFixed(2)}%`, sub: "Revenue-pool based" },
    {
      k: "Monthly pool",
      v: formatCurrency(asset.monthlyRevenuePool, 0),
      sub: "Distributed pro-rata",
    },
    {
      k: "Total supply",
      v: asset.totalSupply.toLocaleString(),
      sub: `${asset.available.toLocaleString()} left`,
    },
    { k: asset.activityLabel, v: formatCompact(asset.activity), sub: "Defined asset scope" },
    {
      k: "Bid / Ask spread",
      v: formatCurrency(spread, 2),
      sub: `${((spread / mid) * 100).toFixed(2)}%`,
    },
  ];

  const terms: [string, string][] = [
    ["Revenue share", `${asset.royaltyShare.toFixed(1)}% of defined net revenue`],
    ["Duration", `${asset.durationMonths} months from issuance`],
    ["Payout cadence", asset.payoutCadence],
    ["Settlement", "On-platform fiat ledger (demo)"],
    ["Token supply", `${asset.totalSupply.toLocaleString()} (capped)`],
    ["Vesting", "None — fully tradeable on T+0"],
    ["Issuer", asset.issuer],
    ["Custody", "FolioX Treasury · 1:1 reserve"],
  ];

  return (
    <div className="flex flex-col gap-6">
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-foreground">
          Discover
        </Link>
        <span className="text-muted-foreground/60">/</span>
        <Link href={creatorHref} className="hover:text-foreground">
          {creator?.name ?? "Creator"}
        </Link>
        <span className="text-muted-foreground/60">/</span>
        <span className="text-foreground">{asset.title}</span>
      </nav>

      <section className="grid gap-6 rounded-xl border border-border bg-card p-6 shadow-sm md:grid-cols-[auto_1fr_auto] md:items-center">
        <AssetCover asset={asset} size={140} className="shadow-lg" />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="font-mono text-[10px]">
              {asset.ticker}
            </Badge>
            <Badge variant="outline" className="text-[10px] capitalize text-muted-foreground">
              {asset.type}
            </Badge>
            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
              <span className="live-dot inline-block h-1.5 w-1.5 rounded-full bg-success" /> Live
              market
            </span>
          </div>
          <h1 className="mt-2 font-display text-[clamp(1.25rem,1rem+1vw,1.75rem)] font-bold leading-tight">
            {asset.title}
          </h1>
          <p className="mt-1 inline-flex items-center gap-1 text-sm text-muted-foreground">
            <CircleCheck className="h-3.5 w-3.5 text-primary" /> {creator?.name ?? "Creator"} ·{" "}
            {asset.releaseYear}
          </p>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{asset.description}</p>
        </div>
        <div className="md:text-right">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Price / token</p>
          <p className="font-mono text-3xl font-bold tabular">
            {formatCurrency(asset.pricePerToken)}
          </p>
          <p
            className={`mt-0.5 text-sm font-semibold tabular ${positive ? "text-success" : "text-destructive"}`}
          >
            {positive ? "▲" : "▼"} {Math.abs(asset.change24h).toFixed(2)}% · 24h
          </p>
          <div className="mt-2 md:flex md:justify-end">
            <Sparkline values={asset.spark} positive={positive} width={180} height={50} />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((stat) => (
          <Card key={stat.k} className="p-4">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{stat.k}</p>
            <p className="mt-1 font-mono text-base font-semibold tabular">{stat.v}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{stat.sub}</p>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-6">
          <Tabs defaultValue="book">
            <TabsList>
              <TabsTrigger value="book" data-testid="tab-book">
                <Activity className="mr-1.5 h-3.5 w-3.5" />
                Order book
              </TabsTrigger>
              <TabsTrigger value="trades" data-testid="tab-trades">
                Recent trades
              </TabsTrigger>
              <TabsTrigger value="about" data-testid="tab-about">
                Token terms
              </TabsTrigger>
            </TabsList>

            <TabsContent value="book" className="mt-3">
              <Card className="overflow-hidden p-0">
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 border-b border-border bg-secondary/50 px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <span>Bids · USD</span>
                  <span className="px-3 text-center text-muted-foreground/80">Qty</span>
                  <span className="text-right">Asks · USD</span>
                </div>

                <ul className="divide-y divide-border/50 text-xs">
                  {asks.map((order) => (
                    <li
                      key={order.id}
                      className="relative grid grid-cols-[1fr_auto_1fr] items-center px-4 py-1.5 tabular"
                    >
                      <div
                        className="pointer-events-none absolute inset-y-0 right-0 bg-destructive/10"
                        style={{ width: `${(order.qty / maxDepth) * 50}%` }}
                        aria-hidden
                      />
                      <span className="relative font-mono text-muted-foreground">—</span>
                      <span className="relative px-3 text-center font-mono text-muted-foreground">
                        {order.qty}
                      </span>
                      <span className="relative text-right font-mono font-semibold text-destructive">
                        {order.price.toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="flex items-center justify-between bg-secondary/30 px-4 py-2 text-[11px]">
                  <span className="text-muted-foreground">Spread</span>
                  <span className="font-mono font-semibold tabular">
                    {formatCurrency(spread)} · {((spread / mid) * 100).toFixed(2)}%
                  </span>
                  <span className="text-muted-foreground">
                    Mid{" "}
                    <span className="font-mono font-semibold tabular text-foreground">
                      {formatCurrency(mid)}
                    </span>
                  </span>
                </div>

                <ul className="divide-y divide-border/50 text-xs">
                  {bids.map((order) => (
                    <li
                      key={order.id}
                      className="relative grid grid-cols-[1fr_auto_1fr] items-center px-4 py-1.5 tabular"
                    >
                      <div
                        className="pointer-events-none absolute inset-y-0 left-0 bg-success/10"
                        style={{ width: `${(order.qty / maxDepth) * 50}%` }}
                        aria-hidden
                      />
                      <span className="relative font-mono font-semibold text-success">
                        {order.price.toFixed(2)}
                      </span>
                      <span className="relative px-3 text-center font-mono text-muted-foreground">
                        {order.qty}
                      </span>
                      <span className="relative text-right font-mono text-muted-foreground">—</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </TabsContent>

            <TabsContent value="trades" className="mt-3">
              <Card className="overflow-hidden p-0">
                <div className="grid grid-cols-3 gap-2 border-b border-border bg-secondary/50 px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <span>Side</span>
                  <span className="text-right">Price · USD</span>
                  <span className="text-right">Qty · Time</span>
                </div>
                {book.trades.length === 0 ? (
                  <div className="px-6 py-10 text-center text-sm text-muted-foreground">
                    No trades yet. Place an order to start the tape.
                  </div>
                ) : (
                  <ul className="divide-y divide-border/50 text-xs">
                    {book.trades.map((trade) => (
                      <li key={trade.id} className="grid grid-cols-3 gap-2 px-4 py-2 tabular">
                        <span
                          className={`font-semibold capitalize ${trade.side === "buy" ? "text-success" : "text-destructive"}`}
                        >
                          {trade.side}
                        </span>
                        <span className="text-right font-mono">{trade.price.toFixed(2)}</span>
                        <span className="text-right font-mono text-muted-foreground">
                          {trade.qty} · {trade.time}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="about" className="mt-3">
              <Card className="p-6">
                <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Revenue share &amp; terms
                </h3>
                <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  {terms.map(([label, value]) => (
                    <div key={label} className="border-b border-border pb-2">
                      <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">
                        {label}
                      </dt>
                      <dd className="mt-0.5 font-mono text-xs tabular">{value}</dd>
                    </div>
                  ))}
                </dl>

                <h3 className="mt-6 font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Included revenue streams
                </h3>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {asset.revenueStreams.map((stream) => (
                    <li key={stream} className="flex items-start gap-2 text-sm">
                      <Activity className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                      <span>{stream}</span>
                    </li>
                  ))}
                </ul>

                <h3 className="mt-6 font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Tokenholder perks
                </h3>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {asset.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2 text-sm">
                      <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 flex items-start gap-2 rounded-md bg-secondary/60 p-3 text-xs text-muted-foreground">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>
                    All figures are illustrative. Tokenisation legal-wrapper and revenue-share
                    mechanics are simulated for this product demonstration only — no real securities
                    are being offered and no affiliation is implied.
                  </span>
                </div>
              </Card>
            </TabsContent>
          </Tabs>

          <Card className="p-5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Primary issuance progress</span>
              <span className="font-mono text-xs tabular text-muted-foreground">
                {(asset.totalSupply - asset.available).toLocaleString()} sold ·{" "}
                {asset.available.toLocaleString()} remaining
              </span>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-amber-500"
                style={{ width: `${soldPct}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
              <span>{soldPct.toFixed(1)}% sold</span>
              <span className="font-mono">List price {formatCurrency(asset.pricePerToken)}</span>
            </div>
          </Card>
        </div>

        <aside className="flex flex-col gap-3">
          <Card className="overflow-hidden p-0">
            <div className="grid grid-cols-2">
              <button
                onClick={() => setSide("buy")}
                className={`px-4 py-3 text-sm font-semibold transition-colors ${
                  side === "buy"
                    ? "bg-success/15 text-success border-b-2 border-success"
                    : "bg-secondary/40 text-muted-foreground hover:text-foreground border-b border-border"
                }`}
                data-testid="button-side-buy"
              >
                Buy {asset.ticker}
              </button>
              <button
                onClick={() => setSide("sell")}
                className={`px-4 py-3 text-sm font-semibold transition-colors ${
                  side === "sell"
                    ? "bg-destructive/15 text-destructive border-b-2 border-destructive"
                    : "bg-secondary/40 text-muted-foreground hover:text-foreground border-b border-border"
                }`}
                data-testid="button-side-sell"
              >
                Sell
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div className="inline-flex w-full rounded-md border border-border bg-secondary/40 p-1 text-xs">
                {(["market", "limit"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setOrderType(type)}
                    className={`flex-1 rounded px-3 py-1.5 font-medium capitalize ${
                      orderType === type
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    data-testid={`order-type-${type}`}
                  >
                    {type} order
                  </button>
                ))}
              </div>

              <div>
                <label className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">Quantity</span>
                  <button
                    onClick={() => setQty(maxQty)}
                    className="font-mono text-[11px] text-primary hover:underline"
                    data-testid="button-max"
                    disabled={maxQty <= 0}
                  >
                    Max {maxQty.toLocaleString()}
                  </button>
                </label>
                <div className="mt-1.5 flex items-stretch gap-1.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-10"
                    onClick={() => setQty((current) => Math.max(0, current - 1))}
                    aria-label="Decrease quantity"
                    data-testid="button-qty-minus"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </Button>
                  <Input
                    type="number"
                    min={0}
                    max={maxQty}
                    value={qty}
                    onChange={(event) =>
                      setQty(Math.max(0, parseInt(event.target.value || "0", 10)))
                    }
                    className="h-10 flex-1 text-center font-mono tabular"
                    aria-label="Quantity"
                    data-testid="input-qty"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-10"
                    onClick={() => setQty((current) => Math.min(maxQty, current + 1))}
                    aria-label="Increase quantity"
                    data-testid="button-qty-plus"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="mt-2 grid grid-cols-4 gap-1.5">
                  {[0.25, 0.5, 0.75, 1].map((fraction) => (
                    <button
                      key={fraction}
                      onClick={() => setQty(Math.floor(maxQty * fraction))}
                      className="rounded-md border border-border bg-secondary/40 py-1 text-[10px] font-medium text-muted-foreground hover-elevate"
                      data-testid={`button-pct-${fraction * 100}`}
                    >
                      {fraction * 100}%
                    </button>
                  ))}
                </div>
              </div>

              {orderType === "limit" ? (
                <div>
                  <label className="text-xs font-medium" htmlFor="limit-price">
                    Limit price (USD)
                  </label>
                  <Input
                    id="limit-price"
                    type="number"
                    step="0.01"
                    value={limitPrice}
                    onChange={(event) => setLimitPrice(parseFloat(event.target.value || "0"))}
                    className="mt-1.5 h-10 text-center font-mono tabular"
                    data-testid="input-limit-price"
                  />
                  <p className="mt-1.5 text-[11px] text-muted-foreground">
                    Mid {formatCurrency(mid)} · Bid {formatCurrency(bestBid)} · Ask{" "}
                    {formatCurrency(bestAsk)}
                  </p>
                </div>
              ) : (
                <div className="rounded-md border border-border bg-secondary/30 px-3 py-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Market price</span>
                    <span className="font-mono font-semibold tabular">
                      {formatCurrency(asset.pricePerToken)}
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-1.5 rounded-md bg-secondary/40 p-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-mono tabular">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Platform fee · 0.50%</span>
                  <span className="font-mono tabular">{formatCurrency(fee)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-border/60 pt-1.5">
                  <span className="font-medium">{side === "buy" ? "You pay" : "You receive"}</span>
                  <span className="font-mono text-sm font-semibold tabular">
                    {formatCurrency(net)}
                  </span>
                </div>
                {side === "buy" && (
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    Funded from cash · balance {formatCurrency(cash)} →{" "}
                    {formatCurrency(Math.max(0, cash - net))}
                  </p>
                )}
              </div>

              <Button
                size="lg"
                className={`w-full ${side === "sell" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}`}
                disabled={disabled}
                onClick={submitOrder}
                data-testid="button-submit-order"
              >
                {orderType === "market"
                  ? `${side === "buy" ? "Buy" : "Sell"} ${qty} ${asset.ticker} now`
                  : `Place ${side} limit order`}
              </Button>

              <div className="flex items-center justify-center gap-3 text-[10px] text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Lock className="h-3 w-3" /> Sandbox
                </span>
                <span className="inline-flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> Audited contract
                </span>
              </div>
            </div>
          </Card>

          {holding && (
            <Card className="p-5">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Your position
              </p>
              <div className="mt-2 grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-[11px] text-muted-foreground">Tokens</p>
                  <p className="font-mono font-semibold tabular">{holding.qty}</p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">Avg cost</p>
                  <p className="font-mono font-semibold tabular">
                    {formatCurrency(holding.avgCost)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">Value</p>
                  <p className="font-mono font-semibold tabular">
                    {formatCurrency(holding.qty * asset.pricePerToken)}
                  </p>
                </div>
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                Est. annual revenue-share income:{" "}
                <span className="font-mono font-semibold text-foreground tabular">
                  {formatCurrency(holding.qty * annualPerToken)}
                </span>
              </div>
            </Card>
          )}
        </aside>
      </section>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-primary" /> Confirm{" "}
              {side === "buy" ? "purchase" : "sale"}
            </DialogTitle>
            <DialogDescription>
              Review the details below. Demo trades settle instantly into your portfolio.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="flex items-center gap-4 rounded-md border border-border p-3">
              <AssetCover asset={asset} size={56} />
              <div className="min-w-0">
                <p className="truncate font-semibold">{asset.title}</p>
                <p className="text-xs text-muted-foreground">
                  {asset.ticker} · {creator?.name ?? "Creator"} · {asset.type}
                </p>
              </div>
            </div>

            <dl className="space-y-1.5 rounded-md bg-secondary/40 p-3 text-sm tabular">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Side</dt>
                <dd className="font-medium capitalize">{side}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Quantity</dt>
                <dd className="font-mono">{qty} tokens</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Market price</dt>
                <dd className="font-mono">{formatCurrency(asset.pricePerToken)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Platform fee</dt>
                <dd className="font-mono">{formatCurrency(fee)}</dd>
              </div>
              <div className="flex justify-between border-t border-border/60 pt-1.5">
                <dt className="font-medium">{side === "buy" ? "Total cost" : "Net proceeds"}</dt>
                <dd className="font-mono font-semibold">{formatCurrency(net)}</dd>
              </div>
            </dl>

            <div className="flex items-start gap-2 rounded-md border border-dashed border-border p-3 text-xs text-muted-foreground">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                By confirming you agree to the token terms. Revenue share will be paid pro-rata once
                the next settlement period closes. (Demo — no real money is moved.)
              </span>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setConfirmOpen(false)} data-testid="button-cancel">
              Cancel
            </Button>
            <Button
              className={
                side === "sell"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : ""
              }
              onClick={confirmMarketOrder}
              data-testid="button-confirm-trade"
            >
              Confirm {side === "buy" ? "purchase" : "sale"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
