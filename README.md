# Daily Tech + Hiring Digest

Local Node/TypeScript script that collects RSS feeds, filters for tech hiring news and overall tech/AI breakthroughs, and emails a daily digest.

## Quick start

1) Install dependencies

```bash
npm install
```

2) Configure environment

```bash
copy .env.example .env
```

Edit `.env` with your SMTP credentials and email addresses.

3) Run once

```bash
npm run run
```

## Notes

- The script looks back `LOOKBACK_HOURS` to avoid missing late-night posts.
- Set `DRY_RUN=true` to print the digest to stdout without sending email.
- Feeds live in `src/feeds.ts` if you want to tweak sources or queries.
- Optional: enable LLM summaries by setting `OPENAI_API_KEY` and `SUMMARIZE_ENABLED=true`.

## GitHub Actions schedule

If your machine is off, run this as a scheduled GitHub Action. The workflow below is already included at `.github/workflows/daily-digest.yml`.

Set the following repository secrets:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_SECURE`
- `DIGEST_FROM`
- `DIGEST_TO`
- `DIGEST_SUBJECT`
- `LOOKBACK_HOURS`
- `MAX_ITEMS_PER_SECTION`

Note: GitHub Actions schedules are UTC. The workflow is set to 16:00 UTC (8:00 AM PST). Adjust seasonally for daylight saving time.

## Azure Functions timer trigger

This repo also includes an Azure Functions timer trigger so the digest can run even when your machine is off.

### What you need

- Azure Functions Core Tools (for local runs)
- An Azure Function App (Linux, Node 20 runtime)

### Local run

```bash
copy local.settings.json.example local.settings.json
npm install
npm run build
func start
```

### Deploy (Azure Functions)

1) Create a Function App (Node 20) in Azure.
2) Set Application Settings using the keys from `local.settings.json.example`.
3) Deploy from this repo (VS Code Azure Functions extension or `func azure functionapp publish <app-name>`).

Schedule is set to 16:00 UTC (8:00 AM PST in winter). Adjust for daylight saving time if you want 8:00 AM year-round.
