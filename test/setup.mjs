import { unstable_dev } from "wrangler";
import { mkdir, writeFile, rm } from "node:fs/promises";
import path from "node:path";

export async function setup() {
  const tmpPath = path.resolve(__dirname, "../.wrangler/tmp.json");
  const worker = await unstable_dev(undefined, {
    experimental: { disableExperimentalWarning: true },
    config: "wrangler.toml",
  });

  await mkdir(path.dirname(tmpPath), { recursive: true });
  await writeFile(tmpPath, JSON.stringify({ ip: worker.address, port: worker.port }));

  // Expose the worker for the teardown function
  return async () => {
    await worker.stop();
    await rm(tmpPath).catch(() => {});
  };
}

