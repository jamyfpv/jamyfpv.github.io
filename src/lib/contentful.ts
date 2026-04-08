import type { Flight } from "@/types/flight";
import { getYoutubeThumbnail, getYoutubeVideoId } from "@/lib/youtube";

interface ContentfulLocation {
  lat?: number;
  lon?: number;
}

interface ContentfulRichTextNode {
  nodeType?: string;
  value?: string;
  content?: ContentfulRichTextNode[];
}

interface ContentfulEntry<TFields> {
  sys: {
    id: string;
    contentType?: {
      sys?: {
        id?: string;
      };
    };
    createdAt?: string;
    updatedAt?: string;
  };
  fields: TFields;
}

interface ContentfulFlightFields {
  title?: string;
  slug?: string;
  youtubeUrl?: string;
  youtubeVideoId?: string;
  shortDescription?: string;
  body?: string;
  longDescription?: ContentfulRichTextNode;
  location?: string | ContentfulLocation;
  locationText?: string;
  shotFor?: string;
  flightDate?: string;
  publishedAt?: string;
  durationText?: string;
  featured?: boolean;
  tags?: string[];
  seoTitle?: string;
  seoDescription?: string;
  thumbnailUrl?: string;
  thumbnailAlt?: string;
}

interface ContentfulEntriesResponse<TFields> {
  items: Array<ContentfulEntry<TFields>>;
  includes?: {
    Entry?: Array<ContentfulEntry<ContentfulFlightFields>>;
  };
}

interface ContentfulLink {
  sys?: {
    id?: string;
    type?: string;
    linkType?: string;
  };
}

interface ContentfulVideoListFields {
  videos?: ContentfulLink[];
}

const hasContentfulConfig =
  Boolean(import.meta.env.CONTENTFUL_SPACE_ID) &&
  Boolean(import.meta.env.CONTENTFUL_DELIVERY_TOKEN);
const homepageVideoListEntryId = "3P29cA6x0zPOITNg7xbN3l";

function getFlightContentType() {
  return import.meta.env.CONTENTFUL_CONTENT_TYPE || "flight";
}

function getEnvironment() {
  return import.meta.env.CONTENTFUL_ENVIRONMENT || "master";
}

function getContentfulUrl(query: Record<string, string | number>, contentType?: string) {
  const params = new URLSearchParams(
    Object.fromEntries(
      Object.entries({
        ...(contentType ? { content_type: contentType } : {}),
        ...query
      }).map(([key, value]) => [key, String(value)])
    )
  );

  return `https://cdn.contentful.com/spaces/${import.meta.env.CONTENTFUL_SPACE_ID}/environments/${getEnvironment()}/entries?${params.toString()}`;
}

function richTextToPlainText(node?: ContentfulRichTextNode): string | undefined {
  if (!node) {
    return undefined;
  }

  if (node.nodeType === "text") {
    return node.value || "";
  }

  const parts = (node.content || [])
    .map((child) => richTextToPlainText(child))
    .filter(Boolean);

  if (parts.length === 0) {
    return undefined;
  }

  const separator = node.nodeType === "paragraph" ? "\n\n" : " ";
  return parts.join(separator).trim();
}

function formatLocation(location?: string | ContentfulLocation) {
  if (!location) {
    return undefined;
  }

  if (typeof location === "string") {
    return location;
  }

  if (typeof location.lat === "number" && typeof location.lon === "number") {
    return `${location.lat.toFixed(4)}, ${location.lon.toFixed(4)}`;
  }

  return undefined;
}

function normalizeFlight(entry?: ContentfulEntry<ContentfulFlightFields>): Flight | null {
  if (!entry) {
    return null;
  }

  const fields = entry.fields || {};
  const youtubeVideoId = fields.youtubeVideoId || getYoutubeVideoId(fields.youtubeUrl);
  const body = fields.body || richTextToPlainText(fields.longDescription);
  const publishedAt = fields.publishedAt || fields.flightDate || entry.sys.updatedAt || entry.sys.createdAt;

  if (
    !entry.sys?.id ||
    !fields.title ||
    !fields.slug ||
    !fields.youtubeUrl ||
    !youtubeVideoId ||
    !fields.shortDescription ||
    !publishedAt
  ) {
    return null;
  }

  return {
    _id: entry.sys.id,
    title: fields.title,
    slug: fields.slug,
    youtubeUrl: fields.youtubeUrl,
    youtubeVideoId,
    shortDescription: fields.shortDescription,
    body,
    location: formatLocation(fields.location),
    locationText: fields.locationText,
    shotFor: fields.shotFor,
    flightDate: fields.flightDate,
    publishedAt,
    durationText: fields.durationText,
    featured: fields.featured || false,
    tags: fields.tags || [],
    seoTitle: fields.seoTitle || fields.title,
    seoDescription: fields.seoDescription || fields.shortDescription,
    thumbnailUrl: fields.thumbnailUrl || getYoutubeThumbnail(youtubeVideoId),
    thumbnailAlt: fields.thumbnailAlt || `${fields.title} thumbnail`
  } satisfies Flight;
}

async function fetchRawEntries<TFields>(
  query: Record<string, string | number>,
  contentType = getFlightContentType()
) {
  if (!hasContentfulConfig) {
    return {
      items: []
    } as ContentfulEntriesResponse<TFields>;
  }

  const response = await fetch(getContentfulUrl(query, contentType), {
    headers: {
      Authorization: `Bearer ${import.meta.env.CONTENTFUL_DELIVERY_TOKEN}`
    }
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Contentful request failed with ${response.status} ${response.statusText}: ${details}`);
  }

  return (await response.json()) as ContentfulEntriesResponse<TFields>;
}

function sortFlightsDesc(flights: Flight[]) {
  return [...flights].sort((a, b) => {
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });
}

async function fetchFlights(query: Record<string, string | number>) {
  const payload = await fetchRawEntries<ContentfulFlightFields>(query);
  return payload.items.map((entry) => normalizeFlight(entry)).filter(Boolean) as Flight[];
}

export async function getRecentFlights(limit = 6) {
  const flights = await fetchFlights({
    limit: Math.max(limit, 20)
  });

  return sortFlightsDesc(flights).slice(0, limit);
}

export async function getAllFlights() {
  const flights = await fetchFlights({
    limit: 100
  });

  return sortFlightsDesc(flights);
}

export async function getFlightBySlug(slug: string) {
  const flights = await fetchFlights({
    "fields.slug": slug,
    limit: 1
  });

  return flights[0] || null;
}

export async function getFlightSlugs() {
  const payload = await fetchRawEntries<ContentfulFlightFields>({
    limit: 100,
    select: "fields.slug"
  });

  return payload.items.map((item) => item.fields.slug).filter(Boolean) as string[];
}

export async function getHomepageFlights(limit = 100) {
  const videoListPayload = await fetchRawEntries<ContentfulVideoListFields>(
    {
      "sys.id": homepageVideoListEntryId,
      limit: 1,
      include: 2
    },
    "videoList"
  );

  const videoList = videoListPayload.items[0];
  const linkedEntries = new Map(
    (videoListPayload.includes?.Entry || []).map((entry) => [entry.sys.id, entry])
  );
  const orderedFlights =
    videoList?.fields.videos
      ?.map((videoLink) => {
        const id = videoLink.sys?.id;
        return id ? normalizeFlight(linkedEntries.get(id) as ContentfulEntry<ContentfulFlightFields>) : null;
      })
      .filter((flight): flight is Flight => Boolean(flight)) || [];

  if (orderedFlights.length > 0) {
    return orderedFlights.slice(0, limit);
  }

  return getRecentFlights(limit);
}

export function contentfulConfigured() {
  return hasContentfulConfig;
}
