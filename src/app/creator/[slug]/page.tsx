import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CreatorPage } from "@/components/pages/creator-page";
import { creators, getCreatorBySlug } from "@/lib/data";

export function generateStaticParams() {
  return creators.map((creator) => ({ slug: creator.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const creator = getCreatorBySlug(slug);
  if (!creator) return { title: "Creator not found — FolioX" };

  return {
    title: `${creator.name} — FolioX`,
    description: creator.bio,
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const creator = getCreatorBySlug(slug);
  if (!creator) notFound();

  return <CreatorPage creator={creator} />;
}
