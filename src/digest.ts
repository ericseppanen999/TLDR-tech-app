import { FeedItem, FeedCategory } from "./types";
import { sortByPublishedDesc } from "./utils";

interface DigestSection {
  title: string;
  category: FeedCategory;
}

const sections: DigestSection[] = [
  { title: "Hiring News", category: "hiring" },
  { title: "Tech News", category: "tech" },
  { title: "AI / Research Breakthroughs", category: "research" }
];

function formatDate(value: Date | null): string {
  if (!value) return "";
  return value.toISOString().slice(0, 10);
}

function renderList(items: FeedItem[]): string {
  return items
    .map((item) => {
      const date = formatDate(item.published);
      const dateSuffix = date ? ` (${date})` : "";
      return `- [${item.source}] ${item.title}${dateSuffix}\n  ${item.link}`;
    })
    .join("\n");
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderHtmlList(items: FeedItem[]): string {
  return items
    .map((item) => {
      const date = formatDate(item.published);
      const dateSuffix = date ? ` (${date})` : "";
      return `
        <li>
          <div><strong>[${escapeHtml(item.source)}]</strong> ${escapeHtml(
        item.title
      )}${escapeHtml(dateSuffix)}</div>
          <div><a href="${escapeHtml(item.link)}">${escapeHtml(item.link)}</a></div>
        </li>
      `;
    })
    .join("");
}

export function buildDigest(
  items: FeedItem[],
  maxItemsPerSection: number,
  generatedAt: Date
): { text: string; html: string } {
  const header = `Daily Tech + Hiring Digest\nGenerated: ${generatedAt.toISOString()}`;

  const textSections = sections
    .map((section) => {
      const sectionItems = sortByPublishedDesc(
        items.filter((item) => item.category === section.category)
      ).slice(0, maxItemsPerSection);

      const body = sectionItems.length
        ? renderList(sectionItems)
        : "(no items)";

      return `\n\n${section.title} (${sectionItems.length})\n${body}`;
    })
    .join("");

  const text = `${header}${textSections}`;

  const htmlSections = sections
    .map((section) => {
      const sectionItems = sortByPublishedDesc(
        items.filter((item) => item.category === section.category)
      ).slice(0, maxItemsPerSection);

      const listItems = sectionItems.length
        ? renderHtmlList(sectionItems)
        : "<li>(no items)</li>";

      return `
        <h2>${escapeHtml(section.title)} (${sectionItems.length})</h2>
        <ul>
          ${listItems}
        </ul>
      `;
    })
    .join("");

  const html = `
    <html>
      <body>
        <h1>Daily Tech + Hiring Digest</h1>
        <div>Generated: ${escapeHtml(generatedAt.toISOString())}</div>
        ${htmlSections}
      </body>
    </html>
  `;

  return { text, html };
}