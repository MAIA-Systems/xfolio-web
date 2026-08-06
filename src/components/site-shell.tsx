"use client";

import { ChartColumn, Compass, Layers, RotateCcw, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

import { Logo, LogoMark } from "@/components/logo";
import { useMarketStore } from "@/components/market-store";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";

const NAV_ITEMS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/", label: "Discover", icon: Compass },
  { href: "/markets", label: "Markets", icon: ChartColumn },
  { href: "/portfolio", label: "Portfolio", icon: Layers },
];

function NavLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
        active
          ? "bg-secondary text-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
      }`}
      data-testid={`link-nav-${label.toLowerCase()}`}
    >
      <Icon className="h-6 w-6" />
      <span>{label}</span>
    </Link>
  );
}

function NavItems({ pathname }: { pathname: string }) {
  return (
    <>
      {NAV_ITEMS.map((item) => (
        <NavLink key={item.href} {...item} active={pathname === item.href} />
      ))}
    </>
  );
}

export function SiteShell({ children }: { children: React.ReactNode }) {
  const { cash, holdings, assets, resetDemo, notices, dismissNotice } = useMarketStore();
  const pathname = usePathname();

  const positionsValue = holdings.reduce((total, holding) => {
    const asset = assets.find((entry) => entry.id === holding.assetId);
    return total + (asset ? asset.pricePerToken * holding.qty : 0);
  }, 0);
  const equity = cash + positionsValue;

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/65">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="hover-elevate -mx-2 rounded-md px-2 py-1" data-testid="link-home">
            <Logo />
          </Link>

          <nav className="ml-2 hidden items-center gap-1 md:flex">
            <NavItems pathname={pathname} />
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <div className="hidden items-center gap-3 rounded-md border border-border bg-card px-3 py-1.5 sm:flex">
              <Wallet className="h-4 w-4 text-muted-foreground" aria-hidden />
              <div className="flex flex-col leading-tight">
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Equity
                </span>
                <span
                  className="font-mono text-xs font-semibold tabular"
                  data-testid="text-equity"
                >
                  {formatCurrency(equity)}
                </span>
              </div>
              <div className="h-6 w-px bg-border" />
              <div className="flex flex-col leading-tight">
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Cash
                </span>
                <span
                  className="font-mono text-xs font-semibold tabular text-foreground"
                  data-testid="text-cash"
                >
                  {formatCurrency(cash)}
                </span>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              aria-label="Reset demo"
              onClick={resetDemo}
              data-testid="button-reset"
              title="Reset demo state"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <ThemeToggle />
          </div>
        </div>

        <nav className="flex items-center gap-1 overflow-x-auto border-t border-border/80 px-4 py-2 md:hidden">
          <NavItems pathname={pathname} />
        </nav>
      </header>

      <main className="mx-auto w-full max-w-[1400px] px-4 pb-24 pt-6 sm:px-6 lg:px-8">{children}</main>

      <footer className="border-t border-border/80 py-6 text-center">
        <div className="mx-auto max-w-[1400px] px-4 text-xs text-muted-foreground sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
            <div className="flex items-center gap-2">
              <LogoMark size={18} />
              <span>
                FolioX · Cross-media creator asset exchange · Demo only — no real funds, no
                blockchain.
              </span>
            </div>
            <span className="font-mono">v0.1 · {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>

      <div className="pointer-events-none fixed bottom-4 left-4 right-4 z-50 flex max-w-sm flex-col gap-2 sm:left-auto sm:px-0">
        {notices.map((notice) => (
          <div
            key={notice.id}
            role="status"
            className={`pointer-events-auto rounded-md border bg-card p-3 shadow-lg ring-1 ring-black/5 ${
              notice.tone === "success"
                ? "border-success/60"
                : notice.tone === "warn"
                  ? "border-destructive/60"
                  : "border-border"
            }`}
            data-testid={`toast-${notice.id}`}
          >
            <div className="flex items-start gap-3">
              <span
                className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                  notice.tone === "success"
                    ? "bg-success"
                    : notice.tone === "warn"
                      ? "bg-destructive"
                      : "bg-primary"
                }`}
                aria-hidden
              />
              <div className="flex-1">
                <p className="text-sm font-semibold">{notice.title}</p>
                {notice.body && (
                  <p className="mt-0.5 text-xs text-muted-foreground">{notice.body}</p>
                )}
              </div>
              <button
                onClick={() => dismissNotice(notice.id)}
                className="text-xs text-muted-foreground hover:text-foreground"
                aria-label="Dismiss"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
