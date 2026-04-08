export interface Flight {
  _id: string;
  title: string;
  slug: string;
  youtubeUrl: string;
  youtubeVideoId: string;
  shortDescription: string;
  body?: string;
  location?: string;
  locationText?: string;
  shotFor?: string;
  flightDate?: string;
  publishedAt: string;
  durationText?: string;
  featured?: boolean;
  tags?: string[];
  seoTitle?: string;
  seoDescription?: string;
  thumbnailUrl?: string;
  thumbnailAlt?: string;
}
