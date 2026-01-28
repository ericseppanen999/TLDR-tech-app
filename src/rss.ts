import { XMLParser } from "fast-xml-parser";
import { FeedItem, FeedSource } from "./types";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text"
});

const USER_AGENT = "tldr-digest/0.1 (rss reader)";

function normalizeText(value: unknown): string | null {
  if (typeof value === "string") return value.trim();
  if (value && typeof value === "object" && "#text" in (value as Record<string, unknown>)) {
    const text = (value as Record<string, unknown>)["#text"];
    return typeof text === "string" ? text.trim() : null;
  }
  return null;
}

function pickLink(value: unknown): string | null {
  if (typeof value === "string") return value.trim();
  if (!value) return null;

  if (Array.isArray(value)) {
    for (const entry of value) {
      const link = pickLink(entry);
      if (link) return link;
    }
    return null;
  }

  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const href = obj["@_href"];
    if (typeof href === "string") return href.trim();
    if ("#text" in obj) return normalizeText(obj);
  }

  return null;
}

function parseDate(value: unknown): Date | null {
  if (!value) return null;
  const text = normalizeText(value);
  if (!text) return null;
  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function parseRssItems(source: FeedSource, channel: Record<string, unknown>): FeedItem[] {
  const rawItems = channel.item;
  if (!rawItems) return [];

  const items = Array.isArray(rawItems) ? rawItems : [rawItems];
  return items
    .map((item: Record<string, unknown>) => {
      const title = normalizeText(item.title) || "(untitled)";
      const link = pickLink(item.link) || "";
      const published = parseDate(item.pubDate || item.date);
      const summary =
        normalizeText(item.description) || normalizeText(item["content:encoded"]) || null;

      return {
        title,
        link,
        published,
        summary,
        source: source.name,
        category: source.category
      };
    })
    .filter((item) => item.link || item.title);
}

function parseAtomItems(source: FeedSource, feed: Record<string, unknown>): FeedItem[] {
  const rawEntries = feed.entry;
  if (!rawEntries) return [];
  const entries = Array.isArray(rawEntries) ? rawEntries : [rawEntries];

  return entries
    .map((entry: Record<string, unknown>) => {
      const title = normalizeText(entry.title) || "(untitled)";
      const link = pickLink(entry.link) || "";
      const published = parseDate(entry.published || entry.updated);
      const summary = normalizeText(entry.summary) || normalizeText(entry.content) || null;

      return {
        title,
        link,
        published,
        summary,
        source: source.name,
        category: source.category
      };
    })
    .filter((item) => item.link || item.title);
}

export async function fetchFeed(source: FeedSource): Promise<FeedItem[]> {
  const response = await fetch(source.url, {
    headers: {
      "User-Agent": USER_AGENT
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${source.name}: ${response.status}`);
  }

  const xml = await response.text();
  const data = parser.parse(xml);

  if (data.rss?.channel) {
    return parseRssItems(source, data.rss.channel);
  }

  if (data.feed) {
    return parseAtomItems(source, data.feed);
  }

  return [];
}