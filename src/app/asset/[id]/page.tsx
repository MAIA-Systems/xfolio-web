import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AssetPage } from "@/components/pages/asset-page";
import { assets, getAssetById } from "@/lib/data";

export function generateStaticParams() {
  return assets.map((asset) => ({ id: asset.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const asset = getAssetById(id);
  if (!asset) return { title: "Asset not found — FolioX" };

  return {
    title: `${asset.title} (${asset.ticker}) — FolioX`,
    description: asset.description,
  };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!getAssetById(id)) notFound();

  return <AssetPage assetId={id} />;
}
