"use client";

import {
  ArrowRight,
  Calendar,
  CircleCheck,
  Gift,
  MapPin,
  Share2,
  Trophy,
  Users,
  Video,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { AssetCover } from "@/components/asset-cover";
import { useMarketStore } from "@/components/market-store";
import { Sparkline } from "@/components/sparkline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCompact, formatCurrency } from "@/lib/format";
import type { Creator } from "@/lib/types";

export function CreatorPage({ creator }: { creator: Creator }) {
  const { assets } = useMarketStore();
  const [filter, setFilter] = React.useState("all");

  const creatorAssets = assets.filter((asset) => asset.creatorId === creator.id);
  const visible = creatorAssets.filter((asset) => filter === "all" || asset.type === filter);
  const types = Array.from(new Set(creatorAssets.map((asset) => asset.type)));

  const stats = [
    { k: "Audience reach", v: `${formatCompact(creator.audienceReach)}` },
    { k: "Total value locked", v: formatCurrency(creator.totalValueLocked, 0) },
    { k: "Assets issued", v: `${creatorAssets.length}` },
    {
      k: "Demo payouts to date",
      v: formatCurrency(
        creatorAssets.reduce((total, asset) => total + asset.monthlyRevenuePool, 0) * 11.5,
        0,
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-foreground">
          Discover
        </Link>
        <span className="text-muted-foreground/60">/</span>
        <span className="text-foreground">{creator.name}</span>
      </nav>

      <section className="relative overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-44 opacity-50"
          style={{
            background:
              "radial-gradient(ellipse 80% 100% at 50% 0%, hsl(32 95% 56% / 0.45), transparent 70%), radial-gradient(ellipse 60% 80% at 80% 30%, hsl(348 72% 60% / 0.35), transparent 70%)",
          }}
        />

        <div className="relative grid gap-6 p-6 md:grid-cols-[auto_1fr_auto] md:items-end md:gap-8 md:p-10">
          <div className="relative">
            <div
              className={`h-28 w-28 rounded-full bg-gradient-to-br ${creator.accent} shadow-xl ring-4 ring-card md:h-32 md:w-32`}
            >
              <Trophy className="absolute inset-0 m-auto h-14 w-14 text-white/95" aria-hidden />
            </div>
            <span className="absolute bottom-1 right-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground ring-2 ring-card">
              <CircleCheck className="h-3.5 w-3.5" aria-label="Verified creator" />
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-success/15 text-success hover:bg-success/15">
                Verified creator
              </Badge>
              {creator.categories.map((category) => (
                <Badge key={category} variant="outline" className="text-muted-foreground">
                  {category}
                </Badge>
              ))}
            </div>
            <h1 className="mt-2 font-display text-[clamp(1.5rem,1rem+1.5vw,2rem)] font-bold leading-tight">
              {creator.name}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {creator.handle} · {creator.primaryPlatform}
            </p>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground md:text-[15px]">
              {creator.bio}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" /> {creator.base}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" /> Building culture since {creator.yearStarted}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" /> {formatCompact(creator.followers)} followers
              </span>
            </div>
          </div>

          <div className="flex flex-col items-stretch gap-2 sm:flex-row md:flex-col md:items-end">
            <Button variant="outline" size="sm" className="gap-2" data-testid="button-follow">
              <Share2 className="h-4 w-4" /> Share
            </Button>
            <Button asChild className="w-full gap-2" data-testid="button-markets">
              <Link href="/markets">
                Trade markets
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-px border-t border-border bg-border md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.k} className="bg-card px-6 py-4">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{stat.k}</p>
              <p className="mt-1 font-mono text-base font-semibold tabular">{stat.v}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold">Tokenised creator assets</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Each token represents a defined share of net revenue from a channel, video, live
              series, game asset, book, film, music drop or UGC pool. Listings are vetted and supply
              is capped.
            </p>
          </div>
          <div className="inline-flex rounded-md border border-border bg-secondary/40 p-1 text-xs">
            {["all", ...types].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`rounded px-3 py-1.5 font-medium capitalize ${
                  filter === type
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                data-testid={`filter-${type}`}
              >
                {type === "all" ? "All assets" : type}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((asset) => {
            const positive = asset.change24h >= 0;
            const soldPct = ((asset.totalSupply - asset.available) / asset.totalSupply) * 100;

            return (
              <Link
                key={asset.id}
                href={`/asset/${asset.id}`}
                className="group block rounded-xl border border-border bg-card p-5 shadow-sm hover-elevate"
                data-testid={`token-${asset.id}`}
              >
                <div className="flex items-start gap-4">
                  <AssetCover asset={asset} size={84} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-[10px]">
                        {asset.ticker}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-[10px] capitalize text-muted-foreground"
                      >
                        {asset.type}
                      </Badge>
                    </div>
                    <p className="mt-2 truncate font-display font-semibold leading-tight">
                      {asset.title}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {asset.releaseYear} · {formatCompact(asset.activity)} {asset.activityLabel}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      Price / token
                    </p>
                    <p className="font-mono text-lg font-bold tabular">
                      {formatCurrency(asset.pricePerToken)}
                    </p>
                    <p
                      className={`text-xs font-semibold tabular ${positive ? "text-success" : "text-destructive"}`}
                    >
                      {positive ? "+" : ""}
                      {asset.change24h.toFixed(2)}% · 24h
                    </p>
                  </div>
                  <Sparkline values={asset.spark} positive={positive} width={110} height={36} />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4 text-xs">
                  <div>
                    <p className="text-muted-foreground">Revenue share</p>
                    <p className="mt-0.5 font-mono font-semibold tabular text-foreground">
                      {asset.royaltyShare.toFixed(1)}% · {asset.durationMonths / 12}yr
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Monthly pool</p>
                    <p className="mt-0.5 font-mono font-semibold tabular text-foreground">
                      {formatCurrency(asset.monthlyRevenuePool, 0)}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{soldPct.toFixed(1)}% sold</span>
                    <span className="font-mono tabular">
                      {asset.available.toLocaleString()} of {asset.totalSupply.toLocaleString()} left
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-amber-500"
                      style={{ width: `${soldPct}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                  View token &amp; order book
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <Card className="p-5">
          <div className="flex items-center gap-2 text-primary">
            <Gift className="h-4 w-4" />
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Fan-holder utility
            </span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Tokens are not just passive revenue participation. Higher-conviction fans unlock private
            Discord roles, creator AMAs, watch parties, merch priority, tournament access and
            meet-and-greet lotteries.
          </p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 text-primary">
            <Video className="h-4 w-4" />
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Value proposition for owners
            </span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            A content owner can finance premium programming, prove fan demand, deepen community
            retention and create a transparent market price for creator IP without selling the
            underlying brand.
          </p>
        </Card>
      </section>
    </div>
  );
}
