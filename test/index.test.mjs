import { describe, it, expect } from "vitest";
import { readFile } from "node:fs/promises";
import path from "node:path";

describe("Root route", () => {
  it("should return 200 on /", async () => {
    // Read the server address from the temp file
    const tmpPath = path.resolve(__dirname, "../.wrangler/tmp.json");
    const { ip, port } = JSON.parse(await readFile(tmpPath, "utf-8"));
    const response = await fetch(`http://${ip}:${port}/`);

    expect(response.status).toBe(200);
    const text = await response.text();
    expect(text).toContain("<title>EPUB Reader</title>");
  });
});
