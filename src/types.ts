export type FeedCategory = "hiring" | "tech" | "research";
export type FeedFilter = "all" | "hiring" | "tech";

export interface FeedSource {
  name: string;
  url: string;
  category: FeedCategory;
  filter: FeedFilter;
}

export interface FeedItem {
  title: string;
  link: string;
  published: Date | null;
  summary: string | null;
  source: string;
  category: FeedCategory;
}