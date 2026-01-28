import { app, InvocationContext, Timer } from "@azure/functions";
import { runDigest } from "../../src/runDigest";

export async function dailyDigest(timer: Timer, context: InvocationContext): Promise<void> {
  const isPastDue = timer.isPastDue ? " (past due)" : "";
  context.log(`Daily digest trigger fired${isPastDue}.`);
  await runDigest();
}

app.timer("daily-digest", {
  schedule: "0 0 16 * * *",
  handler: dailyDigest
});
