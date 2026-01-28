import { FEEDS } from "./feeds";
import { loadConfig } from "./config";
import { fetchFeed } from "./rss";
import { buildDigest } from "./digest";
import { isHiringNews, isTechNews } from "./filters";
import { dedupeItems, sortByPublishedDesc } from "./utils";
import { sendDigest } from "./email";
import { FeedItem, FeedSource } from "./types";
import { summarizeHighlights } from "./summarize";

async function fetchAllFeeds(): Promise<FeedItem[]> {
  const results = await Promise.all(
    FEEDS.map(async (feed) => {
      try {
        const items = await fetchFeed(feed);
        return applyFeedFilter(feed, items);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`Failed to fetch ${feed.name}: ${message}`);
        return [] as FeedItem[];
      }
    })
  );

  return results.flat();
}

function applyFeedFilter(source: FeedSource, items: FeedItem[]): FeedItem[] {
  if (source.filter === "all") return items;

  if (source.filter === "hiring") {
    return items.filter(isHiringNews);
  }

  return items.filter(isTechNews);
}

function withinLookback(item: FeedItem, cutoff: Date): boolean {
  if (!item.published) return true;
  return item.published >= cutoff;
}

export async function runDigest(): Promise<void> {
  const config = loadConfig();
  const now = new Date();
  const cutoff = new Date(now.getTime() - config.lookbackHours * 60 * 60 * 1000);

  const items = await fetchAllFeeds();
  const recentItems = items.filter((item) => withinLookback(item, cutoff));
  const deduped = dedupeItems(recentItems);
  const sorted = sortByPublishedDesc(deduped);

  const highlights = await summarizeHighlights(config, [
    {
      category: "hiring",
      title: "Hiring News",
      items: sorted.filter((item) => item.category === "hiring").slice(0, 24)
    },
    {
      category: "tech",
      title: "Tech News",
      items: sorted.filter((item) => item.category === "tech").slice(0, 24)
    },
    {
      category: "research",
      title: "AI / Research Breakthroughs",
      items: sorted.filter((item) => item.category === "research").slice(0, 24)
    }
  ]);

  const digest = buildDigest(sorted, config.maxItemsPerSection, now, highlights || undefined);
  const subject = config.subject;

  if (config.dryRun) {
    console.log(digest.text);
    return;
  }

  await sendDigest(config, { subject, text: digest.text, html: digest.html });
  console.log(`Digest sent to ${config.to.join(", ")}.`);
}
