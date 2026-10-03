import fs from "fs";
import path from "path";

export class SemanticCache {
  private static cacheFile = path.resolve(process.cwd(), ".codgar_semantic_cache.json");

  public static checkCache(query: string): string | null {
    try {
      if (fs.existsSync(this.cacheFile)) {
        const cache = JSON.parse(fs.readFileSync(this.cacheFile, "utf-8"));
        const clean = query.trim().toLowerCase();
        for (const [k, v] of Object.entries(cache)) {
          if (clean.includes(k) || k.includes(clean)) return v as string;
        }
      }
    } catch (e) {}
    return null;
  }

  public static setCache(query: string, response: string) {
    try {
      let cache: Record<string, string> = {};
      if (fs.existsSync(this.cacheFile)) cache = JSON.parse(fs.readFileSync(this.cacheFile, "utf-8"));
      cache[query.trim().toLowerCase().slice(0, 50)] = response;
      fs.writeFileSync(this.cacheFile, JSON.stringify(cache, null, 2));
    } catch (e) {}
  }
}
