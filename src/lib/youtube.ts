const YOUTUBE_PATTERNS = [
  /youtube\.com\/watch\?v=([^&]+)/i,
  /youtu\.be\/([^?&]+)/i,
  /youtube\.com\/shorts\/([^?&]+)/i,
  /youtube\.com\/embed\/([^?&]+)/i
];

export function getYoutubeVideoId(url?: string | null) {
  if (!url) {
    return "";
  }

  for (const pattern of YOUTUBE_PATTERNS) {
    const match = url.match(pattern);
    if (match?.[1]) {
      return match[1];
    }
  }

  return "";
}

export function getYoutubeThumbnail(videoId?: string | null) {
  return videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : "";
}

export function getYoutubeEmbedUrl(videoId: string) {
  return `https://www.youtube-nocookie.com/embed/${videoId}`;
}
