import type { Flight } from "@/types/flight";
import { absoluteUrl, DEFAULT_OG_IMAGE, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

export interface SeoProps {
  title?: string;
  description?: string;
  pathname?: string;
  image?: string;
  type?: "website" | "article";
}

export function getBaseSeo(overrides: SeoProps = {}): Required<SeoProps> {
  return {
    title: overrides.title || SITE_NAME,
    description: overrides.description || SITE_DESCRIPTION,
    pathname: overrides.pathname || "/",
    image: overrides.image || DEFAULT_OG_IMAGE,
    type: overrides.type || "website"
  };
}

export function getFlightSeo(flight: Flight): Required<SeoProps> {
  return getBaseSeo({
    title: flight.seoTitle || flight.title,
    description: flight.seoDescription || flight.shortDescription,
    pathname: `/flights/${flight.slug}/`,
    image: flight.thumbnailUrl || DEFAULT_OG_IMAGE,
    type: "article"
  });
}

export function getCanonicalUrl(pathname: string) {
  return absoluteUrl(pathname);
}
