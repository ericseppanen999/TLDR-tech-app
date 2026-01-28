import dotenv from "dotenv";

export interface Config {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  smtpSecure: boolean;
  from: string;
  to: string[];
  subject: string;
  lookbackHours: number;
  maxItemsPerSection: number;
  dryRun: boolean;
  summarizeEnabled: boolean;
  summarizeModel: string;
  summarizeTop: number;
}

dotenv.config();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function parseBool(value: string | undefined, fallback: boolean): boolean {
  if (!value) return fallback;
  return value.toLowerCase() === "true" || value === "1";
}

function parseNumber(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function loadConfig(): Config {
  const dryRun = parseBool(process.env.DRY_RUN, false);

  const smtpHost = requireEnv("SMTP_HOST");
  const smtpPort = parseNumber(process.env.SMTP_PORT, 587);
  const smtpUser = requireEnv("SMTP_USER");
  const smtpPass = requireEnv("SMTP_PASS");
  const smtpSecure = parseBool(process.env.SMTP_SECURE, false);

  const from = requireEnv("DIGEST_FROM");
  const to = requireEnv("DIGEST_TO")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  if (to.length === 0) {
    throw new Error("DIGEST_TO must contain at least one recipient");
  }

  return {
    smtpHost,
    smtpPort,
    smtpUser,
    smtpPass,
    smtpSecure,
    from,
    to,
    subject: process.env.DIGEST_SUBJECT || "Daily Tech + Hiring Digest",
    lookbackHours: parseNumber(process.env.LOOKBACK_HOURS, 36),
    maxItemsPerSection: parseNumber(process.env.MAX_ITEMS_PER_SECTION, 12),
    dryRun,
    summarizeEnabled: parseBool(process.env.SUMMARIZE_ENABLED, false),
    summarizeModel: process.env.SUMMARIZE_MODEL || "gpt-4o-mini",
    summarizeTop: parseNumber(process.env.SUMMARIZE_TOP, 3)
  };
}
