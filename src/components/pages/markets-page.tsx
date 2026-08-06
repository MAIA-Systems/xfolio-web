"use client";

import { Activity, ArrowRight, Layers, TrendingUp } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { AssetCover } from "@/components/asset-cover";
import { useMarketStore } from "@/components/market-store";
import { Sparkline } from "@/components/sparkline";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getCreatorById } from "@/lib/data";
import { formatCurrency } from "@/lib/format";

type SortKey = "price" | "change" | "volume" | "supply";
type SortDirection = "asc" | "desc";

export function MarketsPage() {
  const { assets } = useMarketStore();
  const [sortKey, setSortKey] = React.useState<SortKey>("change");
  const [direction, setDirection] = React.useState<SortDirection>("desc");

  const sorted = React.useMemo(() => {
    const next = [...assets];
    next.sort((a, b) => {
      let delta = 0;
      switch (sortKey) {
        case "price":
          delta = a.pricePerToken - b.pricePerToken;
          break;
        case "change":
          delta = a.change24h - b.change24h;
          break;
        case "volume":
          delta = a.monthlyRevenuePool - b.monthlyRevenuePool;
          break;
        case "supply":
          delta = a.available - b.available;
          break;
      }
      return direction === "asc" ? delta : -delta;
    });
    return next;
  }, [assets, sortKey, direction]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setDirection((current) => (current === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setDirection("desc");
    }
  }

  const sortMarker = (key: SortKey) =>
    sortKey === key ? <span className="ml-0.5">{direction === "asc" ? "↑" : "↓"}</span> : null;

  const marketCap = assets.reduce(
    (total, asset) => total + asset.pricePerToken * (asset.totalSupply - asset.available),
    0,
  );
  const monthlyPool = assets.reduce((total, asset) => total + asset.monthlyRevenuePool, 0);

  const stats = [
    { k: "Market cap", v: formatCurrency(marketCap, 0), icon: TrendingUp },
    { k: "Monthly revenue pool", v: formatCurrency(monthlyPool, 0), icon: Activity },
    { k: "Tokens listed", v: assets.length.toString(), icon: Layers },
    {
      k: "Avg 24h change",
      v: `${(assets.reduce((total, asset) => total + asset.change24h, 0) / assets.length).toFixed(2)}%`,
      icon: TrendingUp,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Exchange</p>
          <h1 className="font-display text-[clamp(1.25rem,1rem+1vw,1.75rem)] font-bold leading-tight">
            All markets
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Trade creator, channel, video, game, book, film, music and UGC tokens with live pricing
            and order books.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1">
            <span className="live-dot h-1.5 w-1.5 rounded-full bg-success" /> Live
          </span>
          <span className="rounded-full border border-border bg-card px-2.5 py-1">
            {assets.length} markets
          </span>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.k} className="flex items-start gap-3 p-4">
            <stat.icon className="mt-0.5 h-4 w-4 text-primary" aria-hidden />
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{stat.k}</p>
              <p className="mt-0.5 font-mono text-base font-semibold tabular">{stat.v}</p>
            </div>
          </Card>
        ))}
      </section>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 text-left">Market</th>
                <th className="px-4 py-2.5 text-right">
                  <button onClick={() => toggleSort("price")} className="hover:text-foreground">
                    Price
                    {sortMarker("price")}
                  </button>
                </th>
                <th className="px-4 py-2.5 text-right">
                  <button onClick={() => toggleSort("change")} className="hover:text-foreground">
                    24h
                    {sortMarker("change")}
                  </button>
                </th>
                <th className="hidden px-4 py-2.5 text-right sm:table-cell">
                  <button onClick={() => toggleSort("volume")} className="hover:text-foreground">
                    Monthly pool
                    {sortMarker("volume")}
                  </button>
                </th>
                <th className="hidden px-4 py-2.5 text-right md:table-cell">Share</th>
                <th className="hidden px-4 py-2.5 text-right md:table-cell">
                  <button onClick={() => toggleSort("supply")} className="hover:text-foreground">
                    Available
                    {sortMarker("supply")}
                  </button>
                </th>
                <th className="hidden px-4 py-2.5 text-right lg:table-cell">Chart</th>
                <th className="px-4 py-2.5 text-right">Trade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {sorted.map((asset) => {
                const positive = asset.change24h >= 0;
                const creator = getCreatorById(asset.creatorId);
                return (
                  <tr key={asset.id} className="group hover:bg-secondary/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <AssetCover asset={asset} size={40} />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{asset.title}</p>
                          <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                            <Badge variant="outline" className="font-mono text-[10px]">
                              {asset.ticker}
                            </Badge>
                            <span className="capitalize">{asset.type}</span>
                            <span aria-hidden>·</span>
                            <span>{creator?.name ?? "Creator"}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular">
                      {formatCurrency(asset.pricePerToken)}
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-mono font-semibold tabular ${positive ? "text-success" : "text-destructive"}`}
                    >
                      {positive ? "+" : ""}
                      {asset.change24h.toFixed(2)}%
                    </td>
                    <td className="hidden px-4 py-3 text-right font-mono tabular text-muted-foreground sm:table-cell">
                      {formatCurrency(asset.monthlyRevenuePool, 0)}
                    </td>
                    <td className="hidden px-4 py-3 text-right font-mono tabular text-muted-foreground md:table-cell">
                      {asset.royaltyShare.toFixed(1)}% · {asset.durationMonths / 12}y
                    </td>
                    <td className="hidden px-4 py-3 text-right font-mono tabular text-muted-foreground md:table-cell">
                      {asset.available.toLocaleString()}
                    </td>
                    <td className="hidden px-4 py-3 text-right lg:table-cell">
                      <Sparkline values={asset.spark} positive={positive} width={90} height={28} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/asset/${asset.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                        data-testid={`trade-${asset.id}`}
                      >
                        Trade
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
