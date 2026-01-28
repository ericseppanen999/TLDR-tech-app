import OpenAI from "openai";
import { FeedCategory, FeedItem } from "./types";
import { Config } from "./config";

export interface SectionSummaryInput {
  category: FeedCategory;
  title: string;
  items: FeedItem[];
}

export type Highlights = Record<FeedCategory, string[]>;

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function buildPrompt(sections: SectionSummaryInput[], maxPerSection: number): string {
  const lines: string[] = [];
  lines.push("You are writing a concise daily tech digest.");
  lines.push(
    "For each section, write up to " +
      maxPerSection +
      " bullet highlights (each <= 20 words)."
  );
  lines.push("Use only the provided items; no speculation.");
  lines.push("Return JSON: {\"hiring\":[...],\"tech\":[...],\"research\":[...] }.");

  for (const section of sections) {
    lines.push("");
    lines.push("SECTION: " + section.title + " (" + section.category + ")");
    section.items.forEach((item, index) => {
      const summary = item.summary ? stripHtml(item.summary) : "";
      const snippet = summary ? " — " + summary.slice(0, 240) : "";
      lines.push(
        `${index + 1}. ${item.title} [${item.source}]${snippet}`.trim()
      );
    });
  }

  return lines.join("\n");
}

function extractJson(text: string): unknown | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  const slice = text.slice(start, end + 1);
  try {
    return JSON.parse(slice);
  } catch {
    return null;
  }
}

function coerceHighlights(value: unknown): Highlights | null {
  if (!value || typeof value !== "object") return null;
  const obj = value as Record<string, unknown>;
  const hiring = Array.isArray(obj.hiring) ? obj.hiring : null;
  const tech = Array.isArray(obj.tech) ? obj.tech : null;
  const research = Array.isArray(obj.research) ? obj.research : null;
  if (!hiring || !tech || !research) return null;

  return {
    hiring: hiring.map((item) => String(item)).filter(Boolean),
    tech: tech.map((item) => String(item)).filter(Boolean),
    research: research.map((item) => String(item)).filter(Boolean)
  };
}

export async function summarizeHighlights(
  config: Config,
  sections: SectionSummaryInput[]
): Promise<Highlights | null> {
  if (!config.summarizeEnabled) return null;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const client = new OpenAI({ apiKey });
  const prompt = buildPrompt(sections, config.summarizeTop);

  try {
    const response = await client.responses.create({
      model: config.summarizeModel,
      input: [{
        role: "user",
        content: prompt
      }],
      temperature: 0.2
    });

    const text = response.output_text?.trim();
    if (!text) return null;

    try {
      const parsed = JSON.parse(text);
      return coerceHighlights(parsed);
    } catch {
      const fallback = extractJson(text);
      return fallback ? coerceHighlights(fallback) : null;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Summarization failed: ${message}`);
    return null;
  }
}