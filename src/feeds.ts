import { FeedSource } from "./types";

export const FEEDS: FeedSource[] = [
  {
    name: "Google News - Tech Hiring",
    url:
      "https://news.google.com/rss/search?q=(hiring%20OR%20layoffs%20OR%20%22job%20cuts%22%20OR%20%22hiring%20freeze%22%20OR%20%22workforce%20reduction%22%20OR%20headcount)%20(tech%20OR%20software%20OR%20AI%20OR%20%22artificial%20intelligence%22%20OR%20cybersecurity%20OR%20semiconductor)&hl=en-US&gl=US&ceid=US:en",
    category: "hiring",
    filter: "hiring"
  },
  {
    name: "TechCrunch",
    url: "https://techcrunch.com/feed/",
    category: "tech",
    filter: "all"
  },
  {
    name: "Wired",
    url: "https://www.wired.com/feed/rss",
    category: "tech",
    filter: "all"
  },
  {
    name: "Wired - AI",
    url: "https://www.wired.com/feed/tag/ai/latest/rss",
    category: "research",
    filter: "all"
  },
  {
    name: "Google News - Tech Industry",
    url:
      "https://news.google.com/rss/search?q=(technology%20OR%20software%20OR%20AI%20OR%20%22artificial%20intelligence%22%20OR%20cybersecurity%20OR%20semiconductor%20OR%20cloud%20OR%20%22data%20center%22%20OR%20robotics%20OR%20chip%20OR%20chips)%20(launch%20OR%20release%20OR%20acquisition%20OR%20funding%20OR%20regulation%20OR%20policy%20OR%20product)&hl=en-US&gl=US&ceid=US:en",
    category: "tech",
    filter: "all"
  },
  {
    name: "Google News - AI Breakthroughs",
    url:
      "https://news.google.com/rss/search?q=(breakthrough%20OR%20%22state%20of%20the%20art%22%20OR%20SOTA%20OR%20%22new%20model%22%20OR%20benchmark%20OR%20%22open%20source%22)%20(AI%20OR%20%22machine%20learning%22%20OR%20LLM%20OR%20robotics%20OR%20%22computer%20vision%22)&hl=en-US&gl=US&ceid=US:en",
    category: "research",
    filter: "all"
  },
  {
    name: "arXiv - cs.AI",
    url: "https://rss.arxiv.org/rss/cs.AI",
    category: "research",
    filter: "all"
  },
  {
    name: "arXiv - cs.LG",
    url: "https://rss.arxiv.org/rss/cs.LG",
    category: "research",
    filter: "all"
  },
  {
    name: "arXiv - cs.CL",
    url: "https://rss.arxiv.org/rss/cs.CL",
    category: "research",
    filter: "all"
  },
  {
    name: "arXiv - stat.ML",
    url: "https://rss.arxiv.org/rss/stat.ML",
    category: "research",
    filter: "all"
  },
  {
    name: "Hacker News Front Page",
    url: "https://hnrss.org/frontpage",
    category: "tech",
    filter: "tech"
  }
];