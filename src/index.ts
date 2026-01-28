import { runDigest } from "./runDigest";

if (require.main === module) {
  runDigest().catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Digest failed: ${message}`);
    process.exit(1);
  });
}
