"use client";

import { ArrowRight, Coins, Sparkles, TrendingUp, Wallet } from "lucide-react";
import Link from "next/link";

import { AssetCover } from "@/components/asset-cover";
import { useMarketStore } from "@/components/market-store";
import { Sparkline } from "@/components/sparkline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import type { Asset } from "@/lib/types";

/**
 * Days until the next settlement. Derived from the asset id rather than
 * Math.random() so the date stays put across the 4s price ticks.
 */
function nextPayoutDate(asset: Asset): Date {
  const seed = [...asset.id].reduce((total, char) => total + char.charCodeAt(0), 0);
  const date = new Date();
  date.setDate(date.getDate() + 14 + (seed % 60));
  return date;
}

export function PortfolioPage() {
  const { cash, holdings, assets } = useMarketStore();

  const positions = holdings.flatMap((holding) => {
    const asset = assets.find((entry) => entry.id === holding.assetId);
    if (!asset) return [];

    const value = asset.pricePerToken * holding.qty;
    const cost = holding.avgCost * holding.qty;
    const pnl = value - cost;

    return [
      {
        holding,
        asset,
        value,
        cost,
        pnl,
        pnlPct: cost > 0 ? (pnl / cost) * 100 : 0,
        annualRevenueShare: ((asset.monthlyRevenuePool * 12) / asset.totalSupply) * holding.qty,
      },
    ];
  });

  const holdingsValue = positions.reduce((total, position) => total + position.value, 0);
  const equity = cash + holdingsValue;
  const totalPnl = positions.reduce((total, position) => total + position.pnl, 0);
  const annualRevenue = positions.reduce(
    (total, position) => total + position.annualRevenueShare,
    0,
  );

  const stats = [
    { k: "Cash balance", v: formatCurrency(cash), icon: Wallet },
    { k: "Holdings value", v: formatCurrency(holdingsValue), icon: Coins },
    {
      k: "Unrealised P&L",
      v: `${totalPnl >= 0 ? "+" : ""}${formatCurrency(totalPnl)}`,
      icon: TrendingUp,
      tone: totalPnl >= 0 ? "success" : "destructive",
    },
    { k: "Est. annual revenue", v: formatCurrency(annualRevenue), icon: Sparkles },
  ];

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Account</p>
          <h1 className="font-display text-[clamp(1.25rem,1rem+1vw,1.75rem)] font-bold leading-tight">
            Portfolio
          </h1>
        </div>
        <div className="text-right">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Total equity</p>
          <p className="font-mono text-2xl font-bold tabular">{formatCurrency(equity)}</p>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.k} className="flex items-start gap-3 p-4">
            <stat.icon className="mt-0.5 h-4 w-4 text-primary" aria-hidden />
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{stat.k}</p>
              <p
                className={`mt-0.5 font-mono text-base font-semibold tabular ${
                  stat.tone === "success"
                    ? "text-success"
                    : stat.tone === "destructive"
                      ? "text-destructive"
                      : ""
                }`}
              >
                {stat.v}
              </p>
            </div>
          </Card>
        ))}
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between">
          <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Your holdings
          </h2>
          <Link href="/markets" className="text-xs font-medium text-primary hover:underline">
            All markets →
          </Link>
        </div>

        {positions.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Coins className="h-7 w-7" />
            </div>
            <h3 className="mt-4 font-display text-lg font-semibold">No tokens yet</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Discover a creator or content asset and buy your first token to start earning a share
              of defined revenue.
            </p>
            <Button asChild className="mt-5 gap-1.5" data-testid="button-empty-cta">
              <Link href="/markets">
                Explore all asset markets
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </Card>
        ) : (
          <Card className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary/50 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2.5 text-left">Token</th>
                    <th className="px-4 py-2.5 text-right">Qty</th>
                    <th className="hidden px-4 py-2.5 text-right md:table-cell">Avg cost</th>
                    <th className="px-4 py-2.5 text-right">Price</th>
                    <th className="px-4 py-2.5 text-right">Value</th>
                    <th className="hidden px-4 py-2.5 text-right sm:table-cell">P&amp;L</th>
                    <th className="hidden px-4 py-2.5 text-right lg:table-cell">
                      Est. rev share / yr
                    </th>
                    <th className="hidden px-4 py-2.5 text-right lg:table-cell">Chart</th>
                    <th className="px-4 py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {positions.map((position) => {
                    const positive = position.pnl >= 0;
                    return (
                      <tr key={position.holding.assetId}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <AssetCover asset={position.asset} size={40} />
                            <div>
                              <p className="truncate text-sm font-semibold">
                                {position.asset.title}
                              </p>
                              <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                <Badge variant="outline" className="font-mono text-[10px]">
                                  {position.asset.ticker}
                                </Badge>
                                <span className="capitalize">{position.asset.type}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-mono tabular">
                          {position.holding.qty}
                        </td>
                        <td className="hidden px-4 py-3 text-right font-mono tabular text-muted-foreground md:table-cell">
                          {formatCurrency(position.holding.avgCost)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono tabular">
                          {formatCurrency(position.asset.pricePerToken)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-semibold tabular">
                          {formatCurrency(position.value)}
                        </td>
                        <td
                          className={`hidden px-4 py-3 text-right font-mono font-semibold tabular sm:table-cell ${positive ? "text-success" : "text-destructive"}`}
                        >
                          {positive ? "+" : ""}
                          {formatCurrency(position.pnl)}{" "}
                          <span className="text-[11px] font-normal">
                            ({positive ? "+" : ""}
                            {position.pnlPct.toFixed(2)}%)
                          </span>
                        </td>
                        <td className="hidden px-4 py-3 text-right font-mono tabular text-muted-foreground lg:table-cell">
                          {formatCurrency(position.annualRevenueShare)}
                        </td>
                        <td className="hidden px-4 py-3 text-right lg:table-cell">
                          <Sparkline
                            values={position.asset.spark}
                            positive={position.asset.change24h >= 0}
                            width={80}
                            height={28}
                          />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/asset/${position.asset.id}`}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                            data-testid={`portfolio-trade-${position.asset.id}`}
                          >
                            Trade / sell
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
        )}
      </section>

      {positions.length > 0 && (
        <section>
          <div className="mb-3 flex items-end justify-between">
            <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Upcoming payouts
            </h2>
          </div>
          <Card className="p-5">
            <ul className="divide-y divide-border">
              {positions.slice(0, 3).map((position) => {
                const payoutDate = nextPayoutDate(position.asset);
                const amount =
                  position.annualRevenueShare /
                  (position.asset.payoutCadence === "Monthly" ? 12 : 4);

                return (
                  <li key={position.holding.assetId} className="flex items-center gap-3 py-2.5">
                    <AssetCover asset={position.asset} size={36} />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-semibold">{position.asset.title}</p>
                      <p className="text-[11px] text-muted-foreground">
                        Next {position.asset.payoutCadence.toLowerCase()} settlement ·{" "}
                        {payoutDate.toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sm font-semibold tabular text-success">
                        {formatCurrency(amount)}
                      </p>
                      <p className="text-[11px] text-muted-foreground">est.</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        </section>
      )}
    </div>
  );
}
