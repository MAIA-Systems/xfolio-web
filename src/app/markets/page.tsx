import type { Metadata } from "next";

import { MarketsPage } from "@/components/pages/markets-page";

export const metadata: Metadata = {
  title: "All markets — FolioX",
  description:
    "Trade creator, channel, video, game, book, film, music and UGC tokens with live pricing and order books.",
};

export default function Page() {
  return <MarketsPage />;
}
