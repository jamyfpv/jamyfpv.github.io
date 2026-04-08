export const SITE_NAME = "Jamy FPV";
export const SITE_TAGLINE = "Cinematic FPV drone films for venues, events, brands, and bold spaces.";
export const SITE_DESCRIPTION =
  "Jamy FPV creates immersive aerial fly-throughs and cinematic FPV video that helps venues, hospitality brands, events, and businesses stand out.";
export const DEFAULT_OG_IMAGE =
  "https://images.unsplash.com/photo-1508615070457-7baeba4003ab?auto=format&fit=crop&w=1200&q=80";

export function getContactEmail() {
  return import.meta.env.PUBLIC_CONTACT_EMAIL || "hello@jamyfpv.com";
}

export function getSiteUrl() {
  return import.meta.env.PUBLIC_SITE_URL || "https://jamyfpv.com";
}

export function withBase(pathname: string) {
  const base = import.meta.env.BASE_URL || "/";
  const trimmedBase = base.endsWith("/") ? base.slice(0, -1) : base;
  const trimmedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const combined = `${trimmedBase}${trimmedPath}`;

  return combined.replaceAll("//", "/");
}

export function absoluteUrl(pathname: string) {
  return new URL(withBase(pathname), getSiteUrl()).toString();
}
