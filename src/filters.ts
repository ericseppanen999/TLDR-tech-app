import { FeedItem } from "./types";

const hiringMust = [
  "hiring",
  "layoffs",
  "job cuts",
  "hiring freeze",
  "workforce reduction",
  "headcount",
  "restructuring",
  "expands hiring",
  "staffing",
  "recruiting",
  "downsizing"
];

const hiringExclude = [
  "apply now",
  "job posting",
  "job postings",
  "career",
  "careers",
  "open positions",
  "job board",
  "now hiring",
  "hiring now",
  "vacancy",
  "vacancies"
];

const techKeywords = [
  "ai",
  "artificial intelligence",
  "machine learning",
  "llm",
  "model",
  "chip",
  "semiconductor",
  "cloud",
  "data center",
  "robotics",
  "cybersecurity",
  "open source",
  "startup",
  "funding",
  "acquisition",
  "product launch",
  "release",
  "regulation",
  "policy",
  "platform"
];

function normalize(value: string | null | undefined): string {
  if (!value) return "";
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function isHiringNews(item: FeedItem): boolean {
  const text = normalize(`${item.title} ${item.summary ?? ""}`);
  if (!text) return false;

  if (hiringExclude.some((keyword) => text.includes(keyword))) {
    return false;
  }

  return hiringMust.some((keyword) => text.includes(keyword));
}

export function isTechNews(item: FeedItem): boolean {
  const text = normalize(`${item.title} ${item.summary ?? ""}`);
  if (!text) return false;

  return techKeywords.some((keyword) => text.includes(keyword));
}