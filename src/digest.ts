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

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function clampText(value: string, maxLen: number): string {
  if (value.length <= maxLen) return value;
  return value.slice(0, maxLen - 1).trimEnd() + "…";
}

function hostFromLink(link: string): string {
  try {
    const url = new URL(link);
    return url.hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function renderList(items: FeedItem[]): string {
  return items
    .map((item) => {
      const date = formatDate(item.published);
      const dateSuffix = date ? ` (${date})` : "";
      const host = hostFromLink(item.link);
      const hostSuffix = host ? ` — ${host}` : "";
      return `- [${item.source}] ${item.title}${dateSuffix}${hostSuffix}\n  ${item.link}`;
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
      const summary = item.summary ? clampText(stripHtml(item.summary), 180) : "";
      const host = hostFromLink(item.link);
      const hostSuffix = host ? ` · ${host}` : "";
      return `
        <li style="margin-bottom: 12px;">
          <div style="font-weight: 600;">
            <strong>[${escapeHtml(item.source)}]</strong> ${escapeHtml(
        item.title
      )}${escapeHtml(dateSuffix)}${escapeHtml(hostSuffix)}
          </div>
          ${
            summary
              ? `<div style="color: #4b5563; margin: 4px 0 6px 0;">${escapeHtml(
                  summary
                )}</div>`
              : ""
          }
          <div><a href="${escapeHtml(item.link)}">Read the article →</a></div>
        </li>
      `;
    })
    .join("");
}

export function buildDigest(
  items: FeedItem[],
  maxItemsPerSection: number,
  generatedAt: Date,
  highlights?: Record<FeedCategory, string[]>
): { text: string; html: string } {
  const header = `Daily Tech + Hiring Digest\nGenerated: ${generatedAt.toISOString()}`;

  const textSections = sections
    .map((section) => {
      const sectionItems = sortByPublishedDesc(
        items.filter((item) => item.category === section.category)
      ).slice(0, maxItemsPerSection);

      const highlightLines = highlights?.[section.category] || [];
      const highlightsText = highlightLines.length
        ? `Highlights:\n${highlightLines.map((line) => `- ${line}`).join("\n")}\n`
        : "";

      const body = sectionItems.length
        ? `${highlightsText}${renderList(sectionItems)}`
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

      const highlightLines = highlights?.[section.category] || [];
      const highlightBlock = highlightLines.length
        ? `
          <div style="margin: 8px 0 12px 0;">
            <div style="font-weight: 600; margin-bottom: 6px;">Highlights</div>
            <ul style="margin: 0; padding-left: 20px;">
              ${highlightLines
                .map((line) => `<li>${escapeHtml(line)}</li>`)
                .join("")}
            </ul>
          </div>
        `
        : "";

      const listItems = sectionItems.length
        ? renderHtmlList(sectionItems)
        : "<li>(no items)</li>";

      return `
        <div style="background:#ffffff; padding:18px 20px; border-radius:12px; box-shadow:0 2px 10px rgba(15, 23, 42, 0.08); margin-bottom:16px;">
          <h2 style="margin:0 0 8px 0; font-size:18px;">${escapeHtml(
            section.title
          )} (${sectionItems.length})</h2>
          ${highlightBlock}
          <ul style="margin:0; padding-left:20px;">
            ${listItems}
          </ul>
        </div>
      `;
    })
    .join("");

  const html = `
    <html>
      <body style="margin:0; padding:24px; background:#f5f7fb; font-family: Arial, sans-serif; color:#111827;">
        <div style="max-width: 720px; margin: 0 auto;">
          <div style="background:#0f172a; color:#f8fafc; padding:20px 24px; border-radius:12px;">
            <h1 style="margin:0 0 6px 0; font-size:24px;">Daily Tech + Hiring Digest</h1>
            <div style="opacity:0.85; font-size:12px;">Generated: ${escapeHtml(
              generatedAt.toISOString()
            )}</div>
          </div>
          <div style="margin-top:16px;">
            ${htmlSections}
          </div>
        </div>
      </body>
    </html>
  `;

  return { text, html };
}
