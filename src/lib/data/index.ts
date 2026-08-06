import { assets } from "@/lib/data/assets";
import { creators } from "@/lib/data/creators";
import type { Asset, Creator } from "@/lib/types";

export { assets, creators };

export const featuredCreator: Creator = creators[0];

export function getCreatorById(id: string): Creator | undefined {
  return creators.find((creator) => creator.id === id);
}

export function getCreatorBySlug(slug: string): Creator | undefined {
  return creators.find((creator) => creator.slug === slug);
}

export function getAssetsByCreatorId(creatorId: string): Asset[] {
  return assets.filter((asset) => asset.creatorId === creatorId);
}

export function getAssetById(id: string): Asset | undefined {
  return assets.find((asset) => asset.id === id);
}
