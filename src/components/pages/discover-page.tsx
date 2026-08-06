"use client";

import {
  ArrowRight,
  BookOpen,
  CircleCheck,
  Coins,
  Film,
  Gamepad2,
  Music,
  Search,
  Shield,
  SquarePlay,
  TrendingUp,
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
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { creators, featuredCreator, getCreatorById } from "@/lib/data";
import { formatCompact, formatCurrency } from "@/lib/format";

const TRENDING_QUERIES = [
  "faze clan",
  "ed sheeran",
  "jk rowling",
  "christopher nolan",
  "music",
  "books",
  "movies",
];

const ASSET_CLASSES = [
  { icon: Video, label: "Channels", body: "MrBeast + FaZe", href: "/creator/mrbeast-studio" },
  { icon: SquarePlay, label: "Videos", body: "Specific drops", href: "/creator/mrbeast-studio" },
  { icon: Music, label: "Music", body: "Ed Sheeran", href: "/creator/ed-sheeran" },
  { icon: BookOpen, label: "Books", body: "J.K. Rowling", href: "/creator/jk-rowling" },
  { icon: Film, label: "Movies", body: "Christopher Nolan", href: "/creator/christopher-nolan" },
  { icon: Gamepad2, label: "Games", body: "PixelForge", href: "/creator/pixelforge-games" },
  { icon: Users, label: "UGC", body: "FaZe Clan clips", href: "/creator/faze-clan" },
];

const HOW_IT_WORKS = [
  {
    icon: Video,
    title: "Creators tokenise",
    body: "Channels, videos, game assets, books, films and UGC pools become capped-supply digital revenue tokens.",
  },
  {
    icon: Coins,
    title: "Fans buy in",
    body: "Fans back the content they believe in, receive defined revenue participation, and unlock holder rewards.",
  },
  {
    icon: Users,
    title: "Hold, access, trade",
    body: "Private Discord, AMAs, watch parties and meet-and-greets turn ownership into fan utility and liquidity.",
  },
];

export function DiscoverPage() {
  const [query, setQuery] = React.useState("");
  const { assets } = useMarketStore();

  const results = React.useMemo(() => {
    if (!query.trim()) return [];
    const needle = query.trim().toLowerCase();
    return creators.filter((creator) =>
      [creator.name, creator.handle, creator.primaryPlatform, ...creator.categories].some((field) =>
        field.toLowerCase().includes(needle),
      ),
    );
  }, [query]);

  const topMovers = [...assets]
    .sort((a, b) => Math.abs(b.change24h) - Math.abs(a.change24h))
    .slice(0, 3);

  return (
    <div className="flex flex-col gap-10">
      <section className="relative overflow-hidden rounded-xl border border-border bg-card aurora-bg">
        <div className="grid gap-8 px-6 py-12 md:grid-cols-[1.2fr_1fr] md:px-12 md:py-16">
          <div className="flex flex-col justify-center">
            <Badge
              variant="outline"
              className="mb-4 w-fit gap-1.5 border-primary/40 bg-primary/10 text-primary"
            >
              <Coins className="h-3 w-3" />
              <span className="text-[11px] font-semibold uppercase tracking-wider">
                Cross-media asset exchange
              </span>
            </Badge>

            <h1 className="font-display text-[clamp(1.75rem,1.2rem+2vw,2.25rem)] font-bold leading-tight">
              Trade the upside of culture
              <br />
              <span className="bg-gradient-to-r from-primary to-amber-400 bg-clip-text text-transparent">
                across every medium
              </span>
              .
            </h1>

            <p className="mt-3 max-w-prose text-sm text-muted-foreground md:text-base">
              FolioX lets creators, studios and IP owners tokenise channels, videos, games, books,
              films, music and UGC pools. Fans buy revenue-share tokens, unlock holder bonuses, and
              trade each asset class on a live exchange.
            </p>

            <form
              className="relative mt-6 max-w-xl"
              role="search"
              onSubmit={(event) => event.preventDefault()}
            >
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search creators or assets — try ‘FaZe Clan’"
                className="h-12 rounded-md border-border pl-10 pr-28 text-sm shadow-sm"
                aria-label="Search creators"
                data-testid="input-search"
                autoFocus
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded border border-border bg-secondary px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                ⌘K
              </kbd>
            </form>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="text-muted-foreground/80">Trending:</span>
              {TRENDING_QUERIES.map((term) => (
                <button
                  key={term}
                  onClick={() => setQuery(term)}
                  className="rounded-full border border-border bg-secondary/60 px-2.5 py-1 hover-elevate"
                  data-testid={`button-trending-${term.replace(/\s+/g, "-")}`}
                >
                  {term}
                </button>
              ))}
            </div>

            {query.trim() && (
              <div className="mt-6 overflow-hidden rounded-md border border-border bg-card shadow-sm">
                {results.length === 0 ? (
                  <div className="p-6 text-center text-sm text-muted-foreground">
                    No matches for “{query}”.
                  </div>
                ) : (
                  <ul className="divide-y divide-border">
                    {results.map((creator) => (
                      <li key={creator.id}>
                        <Link
                          href={`/creator/${creator.slug}`}
                          className="flex items-center gap-4 p-4 hover-elevate"
                          data-testid={`result-${creator.id}`}
                        >
                          <div
                            className={`h-12 w-12 shrink-0 rounded-full bg-gradient-to-br ${creator.accent}`}
                            aria-hidden
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="truncate font-semibold">{creator.name}</p>
                              {creator.verified && (
                                <CircleCheck
                                  className="h-4 w-4 shrink-0 text-primary"
                                  aria-label="Verified"
                                />
                              )}
                            </div>
                            <p className="truncate text-xs text-muted-foreground">
                              {formatCompact(creator.audienceReach)} audience reach ·{" "}
                              {creator.categories.join(" · ")}
                            </p>
                          </div>
                          <Badge className="bg-success/15 text-success hover:bg-success/15">
                            {creator.totalAssets} tokens live
                          </Badge>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <Link
            href="/creator/faze-clan"
            className="group relative block rounded-xl border border-border bg-gradient-to-br from-card to-secondary/40 p-1 shadow-lg hover-elevate"
            data-testid="link-featured-faze"
          >
            <div className="rounded-[calc(theme(borderRadius.xl)-4px)] bg-card p-6">
              <div className="flex items-start gap-4">
                <div
                  className={`relative h-20 w-20 shrink-0 rounded-full bg-gradient-to-br ${featuredCreator.accent} shadow-lg`}
                >
                  <Trophy className="absolute inset-0 m-auto h-9 w-9 text-white/90" aria-hidden />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Featured
                    </span>
                    <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
                    <span className="text-[11px] text-muted-foreground">Live now</span>
                  </div>
                  <h2 className="mt-1 truncate font-display text-lg font-bold leading-tight">
                    {featuredCreator.name}
                    <CircleCheck
                      className="ml-1.5 inline h-4 w-4 text-primary"
                      aria-label="Verified"
                    />
                  </h2>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {featuredCreator.handle} · {featuredCreator.primaryPlatform}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Tokens</p>
                  <p className="mt-0.5 font-mono text-sm font-semibold tabular">
                    {featuredCreator.totalAssets}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">TVL</p>
                  <p className="mt-0.5 font-mono text-sm font-semibold tabular">
                    {formatCurrency(featuredCreator.totalValueLocked, 0)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Reach</p>
                  <p className="mt-0.5 font-mono text-sm font-semibold tabular">
                    {formatCompact(featuredCreator.audienceReach)}
                  </p>
                </div>
              </div>

              <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                View tokenised channel
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </div>
            </div>
          </Link>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-display text-base font-semibold uppercase tracking-wider text-muted-foreground">
            Asset classes
          </h2>
          <span className="text-xs text-muted-foreground">One exchange for digital culture</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
          {ASSET_CLASSES.map((entry) => (
            <Link
              key={entry.label}
              href={entry.href}
              data-testid={`link-class-${entry.label.toLowerCase()}`}
              className="block"
            >
              <Card className="h-full p-4 hover-elevate">
                <entry.icon className="h-4 w-4 text-primary" aria-hidden />
                <p className="mt-3 text-sm font-semibold">{entry.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{entry.body}</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-display text-base font-semibold uppercase tracking-wider text-muted-foreground">
            Example creator markets
          </h2>
          <span className="text-xs text-muted-foreground">
            Every profile has live tradable tokens
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {creators.map((creator) => (
            <Link
              key={creator.id}
              href={`/creator/${creator.slug}`}
              className="block"
              data-testid={`link-creator-${creator.slug}`}
            >
              <Card className="flex h-full items-center gap-4 p-4 hover-elevate">
                <div
                  className={`h-12 w-12 shrink-0 rounded-2xl bg-gradient-to-br ${creator.accent}`}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-sm font-semibold">{creator.name}</p>
                    <CircleCheck className="h-3.5 w-3.5 shrink-0 text-primary" />
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {creator.categories.join(" · ")}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-mono text-sm font-semibold">{creator.totalAssets}</p>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    markets
                  </p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-display text-base font-semibold uppercase tracking-wider text-muted-foreground">
            How it works
          </h2>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {HOW_IT_WORKS.map((entry) => (
            <Card key={entry.title} className="p-5">
              <div className="flex items-center gap-2 text-primary">
                <entry.icon className="h-4 w-4" />
                <span className="text-[11px] font-semibold uppercase tracking-wider">
                  {entry.title}
                </span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{entry.body}</p>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-display text-base font-semibold uppercase tracking-wider text-muted-foreground">
            Top movers · 24h
          </h2>
          <Link href="/markets" className="text-xs font-medium text-primary hover:underline">
            All markets →
          </Link>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {topMovers.map((asset) => {
            const positive = asset.change24h >= 0;
            return (
              <Link
                key={asset.id}
                href={`/asset/${asset.id}`}
                className="flex min-w-0 items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm hover-elevate sm:gap-4"
                data-testid={`mover-${asset.id}`}
              >
                <AssetCover asset={asset} size={56} className="shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold">{asset.title}</p>
                    <Badge variant="outline" className="font-mono text-[10px]">
                      {asset.ticker}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground capitalize">
                    {asset.type} · {getCreatorById(asset.creatorId)?.name ?? "Creator"}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-mono text-sm font-semibold tabular">
                    {formatCurrency(asset.pricePerToken)}
                  </p>
                  <p
                    className={`text-xs font-semibold tabular ${positive ? "text-success" : "text-destructive"}`}
                  >
                    {positive ? "+" : ""}
                    {asset.change24h.toFixed(2)}%
                  </p>
                </div>
                <div className="hidden shrink-0 sm:block">
                  <Sparkline values={asset.spark} positive={positive} width={70} height={28} />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="rounded-xl border border-dashed border-border bg-card/60 p-5">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5" /> Smart-contract audited (demo)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CircleCheck className="h-3.5 w-3.5" /> Creator + rights verification
          </span>
          <span className="inline-flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5" /> Revenue share paid by asset terms
          </span>
          <span className="ml-auto font-mono text-[10px] text-muted-foreground/70">
            Demo only — no real funds or blockchain.
          </span>
        </div>
      </section>
    </div>
  );
}
