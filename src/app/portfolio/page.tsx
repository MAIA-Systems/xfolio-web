import type { Metadata } from "next";

import { PortfolioPage } from "@/components/pages/portfolio-page";

export const metadata: Metadata = {
  title: "Portfolio — FolioX",
  description: "Your demo holdings, unrealised P&L and estimated revenue share across FolioX.",
};

export default function Page() {
  return <PortfolioPage />;
}
