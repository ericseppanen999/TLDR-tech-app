import { FeedItem } from "./types";

const DROP_PARAMS = new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "gclid",
  "fbclid",
  "mc_cid",
  "mc_eid",
  "ref",
  "spm",
  "igshid"
]);

export function normalizeLink(link: string): string {
  if (!link) return "";
  try {
    const url = new URL(link);
    for (const key of Array.from(url.searchParams.keys())) {
      if (DROP_PARAMS.has(key)) {
        url.searchParams.delete(key);
      }
    }
    const normalized = url.toString();
    return normalized.endsWith("?") ? normalized.slice(0, -1) : normalized;
  } catch {
    return link.trim().toLowerCase();
  }
}

export function dedupeItems(items: FeedItem[]): FeedItem[] {
  const seen = new Set<string>();
  const result: FeedItem[] = [];

  for (const item of items) {
    const key = normalizeLink(item.link) || item.title.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }

  return result;
}

export function sortByPublishedDesc(items: FeedItem[]): FeedItem[] {
  return [...items].sort((a, b) => {
    const timeA = a.published ? a.published.getTime() : 0;
    const timeB = b.published ? b.published.getTime() : 0;
    return timeB - timeA;
  });
}